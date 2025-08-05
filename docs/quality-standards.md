# Quality Standards and Checklist

## 6-Phase Quality Framework

This document defines the comprehensive quality assurance process that ensures all code meets professional standards before deployment.

### Phase 1: Code Linting
- **Tool**: Biome check (primary), ESLint (fallback)
- **Criteria**: Zero lint errors
- **Auto-fix**: Enabled where possible
- **Command**: `npm run lint` or `npx biome check .`
- **Purpose**: Enforce consistent code style and catch basic errors

**Configuration Requirements**:
- Use Biome for modern JavaScript/TypeScript projects
- Configure strict rules for code consistency
- Enable auto-formatting on save

### Phase 2: Type Checking
- **Tool**: TypeScript compiler
- **Criteria**: Zero type errors
- **Strict Mode**: Always enabled (`strict: true`)
- **Command**: `npx tsc --noEmit`
- **Purpose**: Ensure type safety and catch potential runtime errors

**Configuration Requirements**:
- Enable all strict TypeScript options
- Use explicit return types for functions
- Prefer specific types over `any` or `unknown`
- Configure path mapping for clean imports

### Phase 3: Testing
- **Tool**: Jest (Node.js) / Vitest (Vite projects)
- **Criteria**: 100% test pass rate
- **Coverage**: Minimum 80% line coverage
- **Command**: `npm test`
- **Purpose**: Verify functionality and prevent regression

**Testing Requirements**:
- Unit tests for all business logic
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for critical user flows

### Phase 4: Build Verification
- **Tool**: Project build system (Vite, Webpack, etc.)
- **Criteria**: Successful compilation without warnings
- **Bundle Analysis**: Enabled for size optimization
- **Command**: `npm run build`
- **Purpose**: Ensure production readiness

**Build Requirements**:
- No compilation errors or warnings
- Bundle size within acceptable limits
- Tree shaking enabled for dead code elimination
- Source maps generated for debugging

### Phase 5: Security Audit
- **Tool**: npm audit, Snyk (optional)
- **Criteria**: Zero high/critical vulnerabilities
- **Auto-fix**: Enabled where possible
- **Command**: `npm audit --audit-level high`
- **Purpose**: Identify and resolve security vulnerabilities

**Security Requirements**:
- All dependencies up to date
- No known security vulnerabilities
- Secure coding practices followed
- Environment variables properly handled

### Phase 6: Performance Check
- **Tool**: Lighthouse CI, Web Vitals
- **Criteria**: Performance score ≥ 90
- **Metrics**: First Contentful Paint (FCP), Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), First Input Delay (FID)
- **Command**: `npm run perf` or `lighthouse-ci`
- **Purpose**: Ensure optimal user experience

**Performance Requirements**:
- Core Web Vitals within Google's recommended thresholds
- Optimal bundle size and loading times
- Efficient rendering and interactivity
- Accessibility score ≥ 95

## Quality Gates Integration

### Continuous Integration
All quality phases must pass in CI/CD pipeline:

```yaml
quality-gates:
  runs-on: ubuntu-latest
  steps:
    - name: Lint Check
      run: npm run lint
    - name: Type Check
      run: npx tsc --noEmit
    - name: Test Suite
      run: npm test
    - name: Build Verification
      run: npm run build
    - name: Security Audit
      run: npm audit --audit-level high
    - name: Performance Check
      run: npm run perf
```

### Pre-commit Hooks
Configure Git hooks to run quality checks locally:

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run quality checks
npm run lint && \
npx tsc --noEmit && \
npm test && \
npm run build

if [ $? -ne 0 ]; then
  echo "Quality checks failed. Please fix issues before committing."
  exit 1
fi
```

## Success Criteria

### Definition of Done
A task is considered complete only when:

- [ ] All 6 quality phases pass without errors
- [ ] Code review approved by designated reviewer
- [ ] Documentation updated and accurate
- [ ] No performance regression introduced
- [ ] All acceptance criteria met

### Quality Metrics
Track these metrics to maintain quality standards:

- **Defect Rate**: < 1 bug per 1000 lines of code
- **Test Coverage**: ≥ 80% line coverage
- **Build Success Rate**: ≥ 95%
- **Performance Score**: ≥ 90 (Lighthouse)
- **Security Vulnerabilities**: 0 high/critical

## Exception Handling

### Temporary Exemptions
In rare cases, quality gates may be temporarily bypassed:

1. **Process**: Create exemption request with justification
2. **Approval**: Requires technical lead approval
3. **Timeline**: Maximum 48 hours to resolve
4. **Tracking**: Log in project issue tracker

### Legacy Code
For existing code that doesn't meet current standards:

1. **Incremental Improvement**: Apply boy scout rule (leave it better)
2. **Refactoring Plans**: Create technical debt tickets
3. **Priority**: Address based on risk and change frequency

## Tools and Configuration

### Recommended Tool Stack
- **Linting**: Biome (preferred) or ESLint + Prettier
- **Type Checking**: TypeScript with strict configuration
- **Testing**: Jest/Vitest + Testing Library
- **Build**: Vite (modern) or Webpack (legacy)
- **Security**: npm audit + GitHub Security Advisories
- **Performance**: Lighthouse CI + Web Vitals

### Configuration Templates
Standardized configurations available in `/config` directory:
- `biome.json` - Biome configuration
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Jest testing configuration
- `vite.config.ts` - Vite build configuration

## Enforcement

### Automated Enforcement
- CI/CD pipeline blocks merge if quality gates fail
- Pre-commit hooks prevent local commits with issues
- Branch protection rules require status checks

### Manual Reviews
- Code review checklist includes quality verification
- Architecture review for significant changes
- Performance review for user-facing features

---

**Remember**: Quality is not negotiable. All phases must pass before code can be merged to main branch.