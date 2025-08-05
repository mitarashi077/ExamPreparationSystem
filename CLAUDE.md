# 🔒 Claude Code Integrated Development Automation System (Complete Edition)

> **⚠️ CRITICAL**: Execute the 3-second check system immediately upon receiving new tasks

## 🎯 Core Operating Principles (MANDATORY)

### **3-Second Check System**
Execute the following immediately upon receiving any new task:

```xml
<task-analysis>
  <current-status>
    <branch>{{ git rev-parse --abbrev-ref HEAD }}</branch>
    <uncommitted-changes>{{ git status --porcelain | wc -l }}</uncommitted-changes>
    <task-context-file>{{ test -f CLAUDE-TASK-CONTEXT.md && echo "exists" || echo "missing" }}</task-context-file>
  </current-status>
  
  <new-task-classification>
    <type>{{ feature|fix|docs|hotfix|continuation }}</type>
    <scope>{{ single-file|multi-file|full-system }}</scope>
    <complexity>{{ simple|medium|complex }}</complexity>
    <estimated-files>{{ number }}</estimated-files>
  </new-task-classification>
  
  <decision>
    <continue-current>{{ yes|no }}</continue-current>
    <new-branch-required>{{ yes|no }}</new-branch-required>
    <recommended-action>{{ specific action }}</recommended-action>
  </decision>
</task-analysis>
```

### **XML Structured Development Pipeline**

#### Phase 1: Requirements Analysis
```xml
<requirements-phase>
  <agent>requirement-analyzer</agent>
  <deliverables>
    <file>docs/requirements/{{ task-name }}.md</file>
    <content>
      - User Stories
      - Acceptance Criteria  
      - Technical Constraints
      - Success Metrics
    </content>
  </deliverables>
  <completion-criteria>
    <measurable-outcomes>yes</measurable-outcomes>
    <stakeholder-approval>documented</stakeholder-approval>
  </completion-criteria>
</requirements-phase>
```

#### Phase 2: Technical Design
```xml
<design-phase>
  <agent>technical-designer</agent>
  <deliverables>
    <file>docs/design/{{ task-name }}.md</file>
    <file>docs/adr/{{ decision-number }}-{{ decision-name }}.md</file>
    <content>
      - Architecture Decisions
      - Data Models
      - API Specifications
      - Security Considerations
    </content>
  </deliverables>
  <completion-criteria>
    <technical-feasibility>validated</technical-feasibility>
    <security-review>completed</security-review>
  </completion-criteria>
</design-phase>
```

#### Phase 3: Implementation Planning
```xml
<planning-phase>
  <agent>work-planner</agent>
  <deliverables>
    <file>docs/plans/{{ task-name }}.md</file>
    <content>
      - Task Breakdown Structure
      - Dependencies Map
      - Risk Assessment
      - Timeline Estimation
    </content>
  </deliverables>
  <completion-criteria>
    <atomic-tasks>defined</atomic-tasks>
    <dependencies>mapped</dependencies>
  </completion-criteria>
</planning-phase>
```

#### Phase 4: Task Execution
```xml
<execution-phase>
  <task-decomposition>
    <agent>task-decomposer</agent>
    <output>docs/plans/tasks/</output>
  </task-decomposition>
  
  <implementation>
    <agent>{{ task-executor|frontend-executor|backend-executor }}</agent>
    <atomic-commits>enforced</atomic-commits>
    <quality-gates>continuous</quality-gates>
  </implementation>
  
  <quality-assurance>
    <agent>quality-fixer</agent>
    <phases>
      <lint>biome</lint>
      <type-check>typescript</type-check>
      <test>jest|vitest</test>
      <build>compilation</build>
      <security>audit</security>
      <performance>metrics</performance>
    </phases>
  </quality-assurance>
</execution-phase>
```

## 🤖 Agent Specialization System (ONE AGENT = ONE JOB)

### **Strict Responsibility Separation**

#### **Analysis & Design Specialists**
- `requirement-analyzer`: Requirements analysis only (design/implementation prohibited)
- `technical-designer`: Technical design only (implementation prohibited)
- `work-planner`: Work planning only (implementation prohibited)

#### **Implementation Specialists**
- `task-executor`: 1-2 files, simple logic
- `frontend-executor`: React/UI, complex frontend operations
- `backend-executor`: Node.js/API, complex backend operations

#### **Quality & Git Specialists**
- `quality-fixer`: Quality checks and fixes only
- `git-manager`: Git operations only (commit/push/merge/branch)
- `document-reviewer`: Document review only
- `document-fixer`: Document fixes only

### **Agent Selection Algorithm**
```xml
<agent-selection>
  <task-analysis>
    <file-count>{{ number }}</file-count>
    <complexity>{{ simple|medium|complex }}</complexity>
    <domain>{{ frontend|backend|fullstack|docs|git }}</domain>
  </task-analysis>
  
  <selection-rule>
    <condition>file-count <= 2 AND complexity == simple</condition>
    <agent>task-executor</agent>
  </selection-rule>
  
  <selection-rule>
    <condition>domain == frontend AND (file-count > 2 OR complexity > simple)</condition>
    <agent>frontend-executor</agent>
  </selection-rule>
  
  <selection-rule>
    <condition>domain == backend AND (file-count > 2 OR complexity > simple)</condition>
    <agent>backend-executor</agent>
  </selection-rule>
</agent-selection>
```

## 🔄 Atomic Commit Principles (1 COMMIT = 1 RESPONSIBILITY)

### **Atomicity Guarantee**
```xml
<atomic-commit-rules>
  <single-responsibility>
    <description>One logical change only</description>
    <max-files>3 (tight coupling exceptions)</max-files>
    <revert-safety>independently revertible</revert-safety>
  </single-responsibility>
  
  <separation-order>
    <sequence>
      <step>1. Database/Schema</step>
      <step>2. Backend API</step>
      <step>3. Frontend Components</step>
      <step>4. Documentation</step>
      <step>5. Tests</step>
      <step>6. Configuration</step>
    </sequence>
  </separation-order>
  
  <commit-format>
    <template>
      type: Brief description
      
      - Change detail 1
      - Change detail 2
      
      🤖 Generated with [Claude Code](https://claude.ai/code)
      Co-Authored-By: Claude &lt;noreply@anthropic.com&gt;
    </template>
  </commit-format>
</atomic-commit-rules>
```

### **Branch Strategy (Enforced)**
```xml
<branch-strategy>
  <main-protection>
    <direct-commit>absolutely prohibited</direct-commit>
    <enforcement>pre-commit hook</enforcement>
  </main-protection>
  
  <branch-naming>
    <feature>feature/{{ task-name }}</feature>
    <fix>fix/{{ bug-description }}</fix>
    <docs>docs/{{ document-type }}</docs>
    <hotfix>hotfix/{{ critical-issue }}</hotfix>
  </branch-naming>
  
  <workflow>
    <create>git checkout -b {{ branch-name }}</create>
    <implement>atomic commits</implement>
    <push>git push -u origin {{ branch-name }}</push>
    <merge>PR + 4-stage review</merge>
  </workflow>
</branch-strategy>
```

## 📊 Quality Assessment Framework

### **6-Phase Quality Assurance**
```xml
<quality-framework>
  <phase name="1-lint">
    <tool>biome check</tool>
    <criteria>zero lint errors</criteria>
    <auto-fix>enabled</auto-fix>
  </phase>
  
  <phase name="2-type-check">
    <tool>tsc --noEmit</tool>
    <criteria>zero type errors</criteria>
    <strict-mode>enabled</strict-mode>
  </phase>
  
  <phase name="3-test">
    <tool>npm test</tool>
    <criteria>100% test pass rate</criteria>
    <coverage-threshold>80%</coverage-threshold>
  </phase>
  
  <phase name="4-build">
    <tool>npm run build</tool>
    <criteria>successful compilation</criteria>
    <bundle-analysis>enabled</bundle-analysis>
  </phase>
  
  <phase name="5-security">
    <tool>npm audit</tool>
    <criteria>zero high/critical vulnerabilities</criteria>
    <auto-fix>enabled</auto-fix>
  </phase>
  
  <phase name="6-performance">
    <tool>lighthouse-ci</tool>
    <criteria>performance score >= 90</criteria>
    <metrics>FCP, LCP, CLS, FID</metrics>
  </phase>
</quality-framework>
```

### **4-Stage PR Review Process**
```xml
<pr-review-process>
  <stage name="1-quality">
    <reviewer>quality-fixer</reviewer>
    <focus>code quality, tests, build</focus>
    <gate>all quality checks pass</gate>
  </stage>
  
  <stage name="2-design">
    <reviewer>technical-designer</reviewer>
    <focus>architecture, design patterns</focus>
    <gate>design principles compliance</gate>
  </stage>
  
  <stage name="3-documentation">
    <reviewer>document-reviewer</reviewer>
    <focus>documentation completeness, accuracy</focus>
    <gate>documentation standards met</gate>
  </stage>
  
  <stage name="4-requirements">
    <reviewer>requirement-analyzer</reviewer>
    <focus>requirement fulfillment</focus>
    <gate>acceptance criteria met</gate>
  </stage>
  
  <final-approval>
    <condition>all 4 stages PASS</condition>
    <executor>git-manager</executor>
    <action>merge to main</action>
  </final-approval>
</pr-review-process>
```

## ⚡ Performance Optimization

### **Parallel Tool Execution**
```xml
<parallel-execution>
  <batch-operations>
    <git-status>git status</git-status>
    <git-diff>git diff</git-diff>
    <git-log>git log --oneline -10</git-log>
  </batch-operations>
  
  <quality-checks>
    <lint>npm run lint</lint>
    <type-check>tsc --noEmit</type-check>
    <test>npm test</test>
  </quality-checks>
  
  <file-operations>
    <read-multiple>concurrent file reads</read-multiple>
    <search-parallel>grep + glob simultaneous</search-parallel>
  </file-operations>
</parallel-execution>
```

### **Cost Optimization**
```xml
<cost-optimization>
  <context-management>
    <file-read-limit>2000 lines default</file-read-limit>
    <search-result-limit>50 matches max</search-result-limit>
    <batch-operations>group related operations</batch-operations>
  </context-management>
  
  <agent-efficiency>
    <single-responsibility>prevent scope creep</single-responsibility>
    <early-termination>stop on completion</early-termination>
    <result-caching>reuse previous analysis</result-caching>
  </agent-efficiency>
</cost-optimization>
```

## 🛡️ Security & Reliability

### **Security Checkpoints**
```xml
<security-framework>
  <code-scanning>
    <secrets>no hardcoded credentials</secrets>
    <dependencies>vulnerability scanning</dependencies>
    <permissions>least privilege principle</permissions>
  </code-scanning>
  
  <data-protection>
    <sensitive-data>no exposure in logs</sensitive-data>
    <encryption>sensitive data encrypted</encryption>
    <access-control>role-based permissions</access-control>
  </data-protection>
</security-framework>
```

### **Error Recovery System**
```xml
<error-recovery>
  <git-state-recovery>
    <uncommitted>auto-stash</uncommitted>
    <branch-confusion>checkout correction</branch-confusion>
    <merge-conflicts>guided resolution</merge-conflicts>
  </git-state-recovery>
  
  <build-failure-recovery>
    <dependency-issues>npm install --force</dependency-issues>
    <type-errors>incremental fixes</type-errors>
    <test-failures>isolate and fix</test-failures>
  </build-failure-recovery>
</error-recovery>
```

## 📁 File Structure Standards

### **Project Structure**
```
project/
├── .claude/
│   ├── settings.json
│   └── dev.log
├── docs/
│   ├── requirements/
│   ├── design/
│   ├── plans/
│   │   └── tasks/
│   └── adr/
├── scripts/
│   ├── quality-check.sh
│   ├── error-recovery.sh
│   └── init-project.sh
├── CLAUDE.md
├── CLAUDE-EMERGENCY.md
├── CLAUDE-TASK-CONTEXT.md
└── .mcp.json
```

## 🚨 Session Management

### **Session Start Protocol**
```xml
<session-start>
  <status-check>
    <git-status>current branch and changes</git-status>
    <task-context>read CLAUDE-TASK-CONTEXT.md</task-context>
    <recent-commits>last 5 commits review</recent-commits>
  </status-check>
  
  <environment-validation>
    <node-version>check compatibility</node-version>
    <dependencies>verify installation</dependencies>
    <build-status>last build result</build-status>
  </environment-validation>
</session-start>
```

### **Session End Protocol**
```xml
<session-end>
  <automatic-commit>
    <condition>uncommitted changes exist</condition>
    <message>
      session: Auto-commit session changes
      
      - {{ file list }}
      - Session completed: {{ timestamp }}
      
      🤖 Generated with [Claude Code](https://claude.ai/code)
      Co-Authored-By: Claude &lt;noreply@anthropic.com&gt;
    </message>
  </automatic-commit>
  
  <cleanup>
    <temp-files>remove temporary files</temp-files>
    <stale-branches>identify unused branches</stale-branches>
    <context-update>update CLAUDE-TASK-CONTEXT.md</context-update>
  </cleanup>
</session-end>
```

## 📊 Success Metrics and KPIs

### **Development Efficiency Indicators**
```xml
<efficiency-metrics>
  <task-completion>
    <average-time>per feature/fix</average-time>
    <first-time-right>% of commits without rework</first-time-right>
    <automation-ratio>% of automated tasks</automation-ratio>
  </task-completion>
  
  <quality-metrics>
    <defect-rate>bugs per 1000 lines</defect-rate>
    <test-coverage>% coverage maintained</test-coverage>
    <review-efficiency>avg review cycles</review-efficiency>
  </quality-metrics>
</efficiency-metrics>
```

### **System Reliability Indicators**
```xml
<reliability-metrics>
  <uptime>
    <build-success-rate>% successful builds</build-success-rate>
    <deployment-success>% successful deployments</deployment-success>
    <rollback-rate>% of deployments rolled back</rollback-rate>
  </uptime>
  
  <maintainability>
    <code-complexity>cyclomatic complexity</code-complexity>
    <technical-debt>sonarqube debt ratio</technical-debt>
    <documentation-coverage>% of code documented</documentation-coverage>
  </maintainability>
</reliability-metrics>
```

## 🔍 Self-Contradiction Detection System

### **Mandatory Pre-Completion Check**
```xml
<contradiction-check>
  <rule-compliance>
    <claude-md-rules>CLAUDE.md adherence verification</claude-md-rules>
    <atomic-commits>commit granularity verification</atomic-commits>
    <agent-boundaries>agent responsibility scope verification</agent-boundaries>
  </rule-compliance>
  
  <logical-consistency>
    <requirement-alignment>alignment with requirements</requirement-alignment>
    <design-implementation>design-implementation match</design-implementation>
    <test-coverage>test-functionality correspondence</test-coverage>
  </logical-consistency>
  
  <quality-gates>
    <measurable-outcomes>measurable effects achieved</measurable-outcomes>
    <success-criteria>success criteria met</success-criteria>
    <regression-check>impact on existing functionality</regression-check>
  </quality-gates>
</contradiction-check>
```

### **Contradiction Resolution Protocol**
```xml
<contradiction-resolution>
  <immediate-stop>
    <action>immediately halt work</action>
    <analysis>detailed contradiction analysis</analysis>
    <root-cause>root cause identification</root-cause>
  </immediate-stop>
  
  <resolution-strategy>
    <backtrack>return to last valid state</backtrack>
    <redesign>redesign if necessary</redesign>
    <reimplement>reimplement with corrected design</reimplement>
  </resolution-strategy>
  
  <validation>
    <recheck>contradiction check after fix</recheck>
    <integration-test>integration test execution</integration-test>
    <stakeholder-review>stakeholder review</stakeholder-review>
  </validation>
</contradiction-resolution>
```

---

## 🎯 Execution Guidelines

1. **New Task Reception**: Always execute 3-second check system
2. **Phase Execution**: Adhere to XML structured pipeline
3. **Agent Selection**: Follow ONE AGENT = ONE JOB principle
4. **Commit Time**: Enforce atomicity and quality gates
5. **Completion**: Execute self-contradiction detection system

**🔥 Failure is Not an Option**: Non-adherence to this system compromises project integrity and reliability.

**🎯 Success Key**: If rules are forgotten, immediately reload `CLAUDE.md`.