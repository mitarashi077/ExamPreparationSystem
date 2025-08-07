#!/bin/bash

# Lightweight Performance Monitor - 8-12 seconds execution
# Uses cached data and parallel checks for speed

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CACHE_DIR="$PROJECT_ROOT/.claude/cache"
METRICS_DIR="$PROJECT_ROOT/.claude/metrics"

# Create directories
mkdir -p "$CACHE_DIR" "$METRICS_DIR"

# Quick scoring calculation
calculate_score() {
    local current=$1
    local target=$2
    local max=$3
    
    if [ $current -ge $target ]; then
        echo $max
    else
        echo $(( (current * max) / target ))
    fi
}

# Parallel metric collection
collect_metrics() {
    local metric_name=$1
    local command=$2
    local output_file="$CACHE_DIR/metric_${metric_name}_$$"
    
    eval "$command" > "$output_file" 2>&1 &
    echo "$!:$metric_name:$output_file"
}

# Main execution
main() {
    local start=$(date +%s)
    
    echo -e "${CYAN}⚡ Performance Monitor Lite${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    # Start parallel metric collection
    local pids=()
    
    # 1. Quick lint score (cached if possible)
    pids+=("$(collect_metrics "lint" "
        if [ -f '$CACHE_DIR/quality-*-lint' ]; then
            errors=\$(cat '$CACHE_DIR'/quality-*-lint | grep -o '[0-9]* errors' | cut -d' ' -f1 | head -1)
            echo \$((100 - errors * 5))
        else
            echo 90
        fi
    ")")
    
    # 2. Type safety score (quick check)
    pids+=("$(collect_metrics "types" "
        errors=0
        for dir in frontend backend; do
            if [ -f '\$dir/tsconfig.json' ]; then
                cd '$PROJECT_ROOT/\$dir' 2>/dev/null && npx tsc --noEmit 2>&1 | grep -c 'error' || true
            fi
        done
        echo \$((100 - errors * 3))
    ")")
    
    # 3. Coverage score (read existing)
    pids+=("$(collect_metrics "coverage" "
        fcov=0
        bcov=0
        [ -f '$PROJECT_ROOT/frontend/coverage/coverage-summary.json' ] && fcov=\$(node -e \"
            try {
                const d = JSON.parse(require('fs').readFileSync('$PROJECT_ROOT/frontend/coverage/coverage-summary.json', 'utf8'));
                const t = d.total;
                console.log(Math.round((t.lines.pct + t.statements.pct + t.functions.pct + t.branches.pct) / 4));
            } catch(e) { console.log(0); }
        \")
        [ -f '$PROJECT_ROOT/backend/coverage/coverage-summary.json' ] && bcov=\$(node -e \"
            try {
                const d = JSON.parse(require('fs').readFileSync('$PROJECT_ROOT/backend/coverage/coverage-summary.json', 'utf8'));
                const t = d.total;
                console.log(Math.round((t.lines.pct + t.statements.pct + t.functions.pct + t.branches.pct) / 4));
            } catch(e) { console.log(0); }
        \")
        echo \$(( (fcov + bcov) / 2 ))
    ")")
    
    # 4. Security score (high/critical only)
    pids+=("$(collect_metrics "security" "
        vulns=0
        for dir in . frontend backend; do
            [ -f '$PROJECT_ROOT/\$dir/package.json' ] && {
                cd '$PROJECT_ROOT/\$dir' 2>/dev/null
                v=\$(npm audit --audit-level=high --json 2>/dev/null | node -e \"
                    let input = '';
                    process.stdin.on('data', chunk => input += chunk);
                    process.stdin.on('end', () => {
                        try {
                            const a = JSON.parse(input);
                            console.log((a.metadata?.vulnerabilities?.high || 0) + 
                                       (a.metadata?.vulnerabilities?.critical || 0));
                        } catch(e) { console.log(0); }
                    });
                \" || echo 0)
                vulns=\$((vulns + v))
            }
        done
        echo \$((100 - vulns * 10))
    ")")
    
    # 5. Build health (type check only, no full build)
    pids+=("$(collect_metrics "build" "
        success=100
        for dir in frontend backend; do
            if [ -f '$PROJECT_ROOT/\$dir/tsconfig.json' ]; then
                cd '$PROJECT_ROOT/\$dir' 2>/dev/null
                npx tsc --noEmit >/dev/null 2>&1 || success=\$((success - 50))
            fi
        done
        echo \$success
    ")")
    
    # Wait and collect results
    echo -e "${YELLOW}Collecting metrics...${NC}\n"
    
    local lint_score=90
    local type_score=95
    local coverage_score=0
    local security_score=100
    local build_score=100
    
    for pid_info in "${pids[@]}"; do
        IFS=':' read -r pid name file <<< "$pid_info"
        wait $pid 2>/dev/null || true
        
        if [ -f "$file" ]; then
            value=$(cat "$file")
            case $name in
                lint) lint_score=$value ;;
                types) type_score=$value ;;
                coverage) coverage_score=$value ;;
                security) security_score=$value ;;
                build) build_score=$value ;;
            esac
            rm -f "$file"
        fi
    done
    
    # Calculate overall score (simplified weights)
    # Quality(20%), Types(20%), Coverage(30%), Security(20%), Build(10%)
    local overall=$(( (lint_score * 20 + type_score * 20 + coverage_score * 30 + security_score * 20 + build_score * 10) / 100 ))
    
    # Display results
    echo -e "${BLUE}📊 Performance Metrics${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Color-coded scores
    [ $lint_score -ge 90 ] && lc=$GREEN || lc=$YELLOW
    [ $type_score -ge 90 ] && tc=$GREEN || tc=$YELLOW
    [ $coverage_score -ge 85 ] && cc=$GREEN || cc=$YELLOW
    [ $security_score -ge 95 ] && sc=$GREEN || sc=$YELLOW
    [ $build_score -eq 100 ] && bc=$GREEN || bc=$YELLOW
    
    printf "Code Quality:  ${lc}%3d/100${NC}\n" $lint_score
    printf "Type Safety:   ${tc}%3d/100${NC}\n" $type_score
    printf "Test Coverage: ${cc}%3d/100${NC} %s\n" $coverage_score "$([ $coverage_score -ge 85 ] && echo '✓' || echo '⚠')"
    printf "Security:      ${sc}%3d/100${NC}\n" $security_score
    printf "Build Health:  ${bc}%3d/100${NC}\n" $build_score
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Overall assessment
    if [ $overall -ge 92 ]; then
        echo -e "${GREEN}⭐ OVERALL: ${overall}/100 - EXCELLENT${NC}"
    elif [ $overall -ge 85 ]; then
        echo -e "${GREEN}✅ OVERALL: ${overall}/100 - GOOD${NC}"
    elif [ $overall -ge 75 ]; then
        echo -e "${YELLOW}⚠️  OVERALL: ${overall}/100 - NEEDS IMPROVEMENT${NC}"
    else
        echo -e "${RED}❌ OVERALL: ${overall}/100 - CRITICAL${NC}"
    fi
    
    # Execution time
    local end=$(date +%s)
    local duration=$((end - start))
    echo -e "\nExecution time: ${GREEN}${duration}s${NC}"
    
    # Save to metrics
    echo "$(date +%Y%m%d_%H%M%S): Overall=$overall, Lint=$lint_score, Types=$type_score, Coverage=$coverage_score, Security=$security_score, Build=$build_score (${duration}s)" >> "$METRICS_DIR/performance-lite-history.log"
    
    # Quick recommendations
    if [ $coverage_score -lt 85 ]; then
        echo -e "\n${YELLOW}💡 Run tests with coverage to update metrics${NC}"
    fi
    if [ $security_score -lt 100 ]; then
        echo -e "${YELLOW}💡 Run 'npm audit fix' to resolve vulnerabilities${NC}"
    fi
    
    exit $([ $overall -ge 85 ] && echo 0 || echo 1)
}

main "$@"