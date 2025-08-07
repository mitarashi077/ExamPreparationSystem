#!/bin/bash

# Lightweight Quality Check - 15-20 seconds execution
# Focuses on critical checks with caching

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
METRICS_DIR="$PROJECT_ROOT/.claude/metrics"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create directories
mkdir -p "$CACHE_DIR" "$METRICS_DIR"

# Get git hash for cache invalidation
GIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "nogit")
CACHE_KEY="quality-${GIT_HASH:0:8}"

# Check cache validity (1 hour)
is_cache_valid() {
    local cache_file="$CACHE_DIR/$1"
    if [ -f "$cache_file" ]; then
        local cache_age=$(($(date +%s) - $(stat -f %m "$cache_file" 2>/dev/null || stat -c %Y "$cache_file" 2>/dev/null || echo 0)))
        [ $cache_age -lt 3600 ]
    else
        false
    fi
}

# Save to cache
save_cache() {
    echo "$2" > "$CACHE_DIR/$1"
}

# Phase 1: Fast Lint (cached)
phase1_lint() {
    echo -e "${BLUE}▸ Lint Check${NC}"
    
    local cache_file="${CACHE_KEY}-lint"
    if is_cache_valid "$cache_file"; then
        local result=$(cat "$CACHE_DIR/$cache_file")
        echo -e "  ${GREEN}✓ Cached (${result})${NC}"
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    local errors=0
    
    # Quick biome check
    if command -v biome >/dev/null 2>&1; then
        errors=$(npx biome check . --config-path=biome.json 2>&1 | grep -c "error" || echo "0")
    else
        # Fallback to eslint if available
        if [ -f "frontend/package.json" ]; then
            cd frontend
            errors=$(npm run lint 2>&1 | grep -c "error" || echo "0")
            cd ..
        fi
    fi
    
    save_cache "$cache_file" "$errors errors"
    
    if [ $errors -eq 0 ]; then
        echo -e "  ${GREEN}✓ Pass${NC}"
    else
        echo -e "  ${RED}✗ ${errors} errors${NC}"
        return 1
    fi
}

# Phase 2: Type Check Only (no build)
phase2_types() {
    echo -e "${BLUE}▸ Type Check${NC}"
    
    cd "$PROJECT_ROOT"
    local errors=0
    
    # Frontend type check
    if [ -f "frontend/tsconfig.json" ]; then
        cd frontend
        if ! npx tsc --noEmit > /dev/null 2>&1; then
            errors=$((errors + 1))
        fi
        cd ..
    fi
    
    # Backend type check
    if [ -f "backend/tsconfig.json" ]; then
        cd backend
        if ! npx tsc --noEmit > /dev/null 2>&1; then
            errors=$((errors + 1))
        fi
        cd ..
    fi
    
    if [ $errors -eq 0 ]; then
        echo -e "  ${GREEN}✓ Pass${NC}"
    else
        echo -e "  ${RED}✗ ${errors} projects with errors${NC}"
        return 1
    fi
}

# Phase 3: Coverage Check (read existing)
phase3_coverage() {
    echo -e "${BLUE}▸ Coverage Check${NC}"
    
    local frontend_cov=0
    local backend_cov=0
    
    if [ -f "frontend/coverage/coverage-summary.json" ]; then
        frontend_cov=$(node -e "
            try {
                const d = JSON.parse(require('fs').readFileSync('frontend/coverage/coverage-summary.json', 'utf8'));
                const t = d.total;
                console.log(Math.round((t.lines.pct + t.statements.pct + t.functions.pct + t.branches.pct) / 4));
            } catch(e) { console.log(0); }
        ")
    fi
    
    if [ -f "backend/coverage/coverage-summary.json" ]; then
        backend_cov=$(node -e "
            try {
                const d = JSON.parse(require('fs').readFileSync('backend/coverage/coverage-summary.json', 'utf8'));
                const t = d.total;
                console.log(Math.round((t.lines.pct + t.statements.pct + t.functions.pct + t.branches.pct) / 4));
            } catch(e) { console.log(0); }
        ")
    fi
    
    echo -e "  Frontend: $([ $frontend_cov -ge 85 ] && echo "${GREEN}${frontend_cov}%${NC}" || echo "${YELLOW}${frontend_cov}%${NC}")"
    echo -e "  Backend:  $([ $backend_cov -ge 85 ] && echo "${GREEN}${backend_cov}%${NC}" || echo "${YELLOW}${backend_cov}%${NC}")"
    
    local overall=$(( (frontend_cov + backend_cov) / 2 ))
    if [ $overall -ge 85 ]; then
        echo -e "  ${GREEN}✓ Overall: ${overall}%${NC}"
    else
        echo -e "  ${YELLOW}⚠ Overall: ${overall}% (target: 85%)${NC}"
    fi
}

# Phase 4: Security (high/critical only)
phase4_security() {
    echo -e "${BLUE}▸ Security Check${NC}"
    
    local cache_file="${CACHE_KEY}-security"
    if is_cache_valid "$cache_file"; then
        local result=$(cat "$CACHE_DIR/$cache_file")
        echo -e "  ${GREEN}✓ Cached (${result})${NC}"
        return 0
    fi
    
    local total_vulns=0
    
    for dir in . frontend backend; do
        if [ -f "$dir/package.json" ]; then
            cd "$PROJECT_ROOT/$dir" 2>/dev/null || continue
            local vulns=$(npm audit --audit-level=high --json 2>/dev/null | node -e "
                let input = '';
                process.stdin.on('data', chunk => input += chunk);
                process.stdin.on('end', () => {
                    try {
                        const a = JSON.parse(input);
                        const v = (a.metadata?.vulnerabilities?.high || 0) + 
                                 (a.metadata?.vulnerabilities?.critical || 0);
                        console.log(v);
                    } catch(e) { console.log(0); }
                });
            " || echo "0")
            total_vulns=$((total_vulns + vulns))
        fi
    done
    
    cd "$PROJECT_ROOT"
    save_cache "$cache_file" "$total_vulns vulnerabilities"
    
    if [ $total_vulns -eq 0 ]; then
        echo -e "  ${GREEN}✓ No high/critical vulnerabilities${NC}"
    else
        echo -e "  ${RED}✗ ${total_vulns} high/critical vulnerabilities${NC}"
        return 1
    fi
}

# Main
main() {
    local start=$(date +%s)
    
    echo -e "${GREEN}⚡ Quality Check Lite - Fast Mode${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    local failed=0
    
    # Run checks (some in parallel using subshells)
    (phase1_lint) &
    local lint_pid=$!
    
    (phase2_types) &
    local type_pid=$!
    
    # Wait for parallel tasks
    wait $lint_pid || failed=$((failed + 1))
    wait $type_pid || failed=$((failed + 1))
    
    # Sequential checks that are already fast
    phase3_coverage
    phase4_security || failed=$((failed + 1))
    
    # Summary
    local end=$(date +%s)
    local duration=$((end - start))
    
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Time: ${GREEN}${duration}s${NC}"
    
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}✅ All checks passed!${NC}"
        
        # Save success metric
        echo "$TIMESTAMP: PASS (${duration}s)" >> "$METRICS_DIR/quality-lite-history.log"
        exit 0
    else
        echo -e "${RED}❌ ${failed} checks failed${NC}"
        echo "$TIMESTAMP: FAIL (${duration}s)" >> "$METRICS_DIR/quality-lite-history.log"
        exit 1
    fi
}

main "$@"