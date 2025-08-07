#!/bin/bash

# Quick Check - Parallel Execution for Fast Quality Validation
# Target: 30 seconds total execution time

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CACHE_DIR="$PROJECT_ROOT/.claude/cache"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_DIR="$PROJECT_ROOT/.claude/logs"
PARALLEL_PIDS=()

# Create directories
mkdir -p "$CACHE_DIR" "$LOG_DIR"

# Parse arguments
MODE="quick"  # quick, full, minimal
PHASES=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --mode=*)
            MODE="${1#*=}"
            shift
            ;;
        --phase=*)
            PHASES="${1#*=}"
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# Progress indicator
spin() {
    local pid=$1
    local task=$2
    local spin='⣾⣽⣻⢿⡿⣟⣯⣷'
    local i=0
    while kill -0 $pid 2>/dev/null; do
        i=$(( (i+1) %8 ))
        printf "\r${BLUE}[${spin:$i:1}]${NC} Running: %s" "$task"
        sleep 0.1
    done
    wait $pid
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        printf "\r${GREEN}[✓]${NC} Complete: %s\n" "$task"
    else
        printf "\r${RED}[✗]${NC} Failed: %s\n" "$task"
    fi
    return $exit_code
}

# Parallel execution helper
run_parallel() {
    local task_name=$1
    local task_command=$2
    
    eval "$task_command" > "$LOG_DIR/${task_name}_${TIMESTAMP}.log" 2>&1 &
    local pid=$!
    PARALLEL_PIDS+=($pid)
    echo "$pid:$task_name"
}

# Cache helper
get_cache_key() {
    local check_type=$1
    echo "${check_type}-$(git rev-parse HEAD 2>/dev/null || echo 'nogit')-$(date +%Y%m%d)"
}

# Phase 1: Parallel Lint Check
phase1_lint() {
    local cache_key=$(get_cache_key "lint")
    local cache_file="$CACHE_DIR/$cache_key"
    
    if [ -f "$cache_file" ] && [ "$MODE" = "quick" ]; then
        echo "0"  # Cached - assume pass
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    if npm run lint > /dev/null 2>&1; then
        touch "$cache_file"
        echo "0"
    else
        echo "1"
    fi
}

# Phase 2: Parallel Type Check (no build)
phase2_typecheck() {
    cd "$PROJECT_ROOT"
    local errors=0
    
    if [ -f "tsconfig.json" ] || [ -f "config/build/tsconfig.json" ]; then
        local tsconfig="tsconfig.json"
        [ -f "config/build/tsconfig.json" ] && tsconfig="config/build/tsconfig.json"
        
        if ! npx tsc --noEmit --project "$tsconfig" > /dev/null 2>&1; then
            errors=1
        fi
    fi
    
    echo "$errors"
}

# Phase 3: Parallel Test Coverage (read existing)
phase3_coverage() {
    local frontend_cov=0
    local backend_cov=0
    
    # Read existing coverage if available
    if [ -f "$PROJECT_ROOT/frontend/coverage/coverage-summary.json" ]; then
        frontend_cov=$(node -e "
            try {
                const data = JSON.parse(require('fs').readFileSync('$PROJECT_ROOT/frontend/coverage/coverage-summary.json', 'utf8'));
                const t = data.total;
                console.log(Math.round((t.lines.pct + t.statements.pct + t.functions.pct + t.branches.pct) / 4));
            } catch(e) { console.log(0); }
        ")
    fi
    
    if [ -f "$PROJECT_ROOT/backend/coverage/coverage-summary.json" ]; then
        backend_cov=$(node -e "
            try {
                const data = JSON.parse(require('fs').readFileSync('$PROJECT_ROOT/backend/coverage/coverage-summary.json', 'utf8'));
                const t = data.total;
                console.log(Math.round((t.lines.pct + t.statements.pct + t.functions.pct + t.branches.pct) / 4));
            } catch(e) { console.log(0); }
        ")
    fi
    
    local overall=$(( (frontend_cov + backend_cov) / 2 ))
    echo "$overall"
}

# Phase 4: Fast Security Check (high/critical only)
phase4_security() {
    local vulns=0
    
    for dir in "$PROJECT_ROOT" "$PROJECT_ROOT/frontend" "$PROJECT_ROOT/backend"; do
        if [ -f "$dir/package.json" ]; then
            cd "$dir" 2>/dev/null || continue
            local high_critical=$(npm audit --audit-level=high --json 2>/dev/null | node -e "
                let input = '';
                process.stdin.on('data', chunk => input += chunk);
                process.stdin.on('end', () => {
                    try {
                        const audit = JSON.parse(input);
                        const v = (audit.metadata?.vulnerabilities?.high || 0) + 
                                 (audit.metadata?.vulnerabilities?.critical || 0);
                        console.log(v);
                    } catch(e) { console.log(0); }
                });
            " || echo "0")
            vulns=$((vulns + high_critical))
        fi
    done
    
    echo "$vulns"
}

# Main execution
main() {
    local start_time=$(date +%s)
    
    echo -e "${GREEN}🚀 Quick Quality Check - Parallel Mode${NC}"
    echo -e "${BLUE}Mode: $MODE | Target: 30 seconds${NC}\n"
    
    # Start parallel tasks
    echo -e "${YELLOW}Starting parallel checks...${NC}"
    
    # Launch all checks in parallel
    run_parallel "lint" "phase1_lint"
    local lint_pid=$(echo "${!}" | cut -d: -f1)
    
    run_parallel "typecheck" "phase2_typecheck"
    local type_pid=$(echo "${!}" | cut -d: -f1)
    
    run_parallel "coverage" "phase3_coverage"
    local cov_pid=$(echo "${!}" | cut -d: -f1)
    
    if [ "$MODE" != "minimal" ]; then
        run_parallel "security" "phase4_security"
        local sec_pid=$(echo "${!}" | cut -d: -f1)
    fi
    
    # Wait with progress indicators
    spin $lint_pid "Lint Check"
    local lint_result=$(cat "$LOG_DIR/lint_${TIMESTAMP}.log")
    
    spin $type_pid "Type Check"
    local type_result=$(cat "$LOG_DIR/typecheck_${TIMESTAMP}.log")
    
    spin $cov_pid "Coverage Analysis"
    local cov_result=$(cat "$LOG_DIR/coverage_${TIMESTAMP}.log")
    
    local sec_result=0
    if [ "$MODE" != "minimal" ]; then
        spin $sec_pid "Security Scan"
        sec_result=$(cat "$LOG_DIR/security_${TIMESTAMP}.log")
    fi
    
    # Calculate results
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Display summary
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}📊 RESULTS SUMMARY${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Lint status
    if [ "$lint_result" = "0" ]; then
        echo -e "Lint:     ${GREEN}✓ PASS${NC}"
    else
        echo -e "Lint:     ${RED}✗ FAIL${NC}"
    fi
    
    # Type check status
    if [ "$type_result" = "0" ]; then
        echo -e "Types:    ${GREEN}✓ PASS${NC}"
    else
        echo -e "Types:    ${RED}✗ FAIL${NC}"
    fi
    
    # Coverage status
    if [ "$cov_result" -ge 85 ]; then
        echo -e "Coverage: ${GREEN}✓ ${cov_result}%${NC}"
    elif [ "$cov_result" -ge 70 ]; then
        echo -e "Coverage: ${YELLOW}⚠ ${cov_result}%${NC}"
    else
        echo -e "Coverage: ${RED}✗ ${cov_result}%${NC}"
    fi
    
    # Security status
    if [ "$MODE" != "minimal" ]; then
        if [ "$sec_result" = "0" ]; then
            echo -e "Security: ${GREEN}✓ CLEAN${NC}"
        else
            echo -e "Security: ${RED}✗ ${sec_result} issues${NC}"
        fi
    fi
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Time: ${GREEN}${duration}s${NC} (Target: 30s)"
    
    # Overall status
    local exit_code=0
    if [ "$lint_result" != "0" ] || [ "$type_result" != "0" ] || [ "$sec_result" != "0" ]; then
        exit_code=1
        echo -e "\n${RED}❌ Quality check failed${NC}"
    elif [ "$cov_result" -lt 85 ]; then
        echo -e "\n${YELLOW}⚠️ Quality check passed with warnings${NC}"
    else
        echo -e "\n${GREEN}✅ All quality checks passed!${NC}"
    fi
    
    # Cleanup old logs
    find "$LOG_DIR" -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    return $exit_code
}

# Execute
main "$@"