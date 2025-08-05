# Agent System Specification

## Core Principle: ONE AGENT = ONE JOB

This document defines the strict agent specialization system that ensures efficient, predictable, and maintainable development workflows.

## Agent Categories

### Analysis & Design Agents

#### **requirement-analyzer**
- **Primary Responsibility**: Requirements analysis only
- **Strict Prohibitions**: Design decisions, implementation, code writing
- **Deliverables**: 
  - User stories with acceptance criteria
  - Technical constraints documentation
  - Success metrics definition
- **Completion Signal**: "Requirements analysis complete. Proceeding to design phase."

#### **technical-designer**  
- **Primary Responsibility**: Technical design only
- **Strict Prohibitions**: Requirements analysis, implementation, code writing
- **Deliverables**:
  - Architecture Decision Records (ADRs)
  - Data model specifications
  - API design documents
  - Security considerations
- **Completion Signal**: "Technical design complete. Proceeding to planning phase."

#### **work-planner**
- **Primary Responsibility**: Work planning and task breakdown only
- **Strict Prohibitions**: Requirements analysis, design, implementation
- **Deliverables**:
  - Task breakdown structure
  - Dependency mapping
  - Risk assessment
  - Timeline estimation
- **Completion Signal**: "Implementation planning complete. Proceeding to execution phase."

### Implementation Agents

#### **task-executor**
- **Scope**: 1-2 files, simple logic operations
- **Use Cases**: 
  - Single function modifications
  - Simple bug fixes
  - Configuration updates
  - Small utility additions
- **Complexity Limit**: Simple operations only
- **File Limit**: Maximum 2 files per task

#### **frontend-executor**
- **Scope**: React/UI components, complex frontend operations
- **Use Cases**:
  - React component development
  - State management implementation
  - UI/UX feature development
  - Frontend routing and navigation
- **Prerequisites**: 3+ files OR medium/complex operations
- **Domain**: Frontend-specific tasks only

#### **backend-executor**
- **Scope**: Node.js/API development, complex backend operations
- **Use Cases**:
  - API endpoint development
  - Database operations
  - Server-side business logic
  - Authentication and authorization
- **Prerequisites**: 3+ files OR medium/complex operations  
- **Domain**: Backend-specific tasks only

### Quality & Git Agents

#### **quality-fixer**
- **Primary Responsibility**: Quality checks and automated fixes only
- **Capabilities**:
  - Run all 6 quality phases
  - Apply automated fixes where possible
  - Generate quality reports
- **Escalation**: If unable to fix, escalate to technical-designer
- **Strict Prohibition**: Manual code implementation

#### **git-manager**
- **Primary Responsibility**: Git operations only
- **Capabilities**:
  - Branch management
  - Commit operations
  - Merge conflict resolution
  - PR creation and management
- **Strict Prohibitions**: Code review, quality assessment, implementation

#### **document-reviewer**
- **Primary Responsibility**: Document review only
- **Capabilities**:
  - Documentation completeness assessment
  - Consistency checking
  - Standards compliance verification
- **Strict Prohibitions**: Document editing, content creation

#### **document-fixer**
- **Primary Responsibility**: Document fixes and updates only
- **Capabilities**:
  - Apply review feedback
  - Update documentation content
  - Maintain documentation standards
- **Prerequisites**: Must have review feedback from document-reviewer

## Agent Selection Algorithm

### Automated Selection Rules

```xml
<agent-selection>
  <criteria>
    <file-count>{{number}}</file-count>
    <complexity>{{simple|medium|complex}}</complexity>
    <domain>{{frontend|backend|fullstack|docs|git|quality}}</domain>
  </criteria>
  
  <selection-rules>
    <!-- Simple Tasks -->
    <rule priority="1">
      <condition>file-count <= 2 AND complexity = simple</condition>
      <agent>task-executor</agent>
    </rule>
    
    <!-- Frontend Tasks -->
    <rule priority="2">
      <condition>domain = frontend AND (file-count > 2 OR complexity > simple)</condition>
      <agent>frontend-executor</agent>
    </rule>
    
    <!-- Backend Tasks -->
    <rule priority="3">
      <condition>domain = backend AND (file-count > 2 OR complexity > simple)</condition>
      <agent>backend-executor</agent>
    </rule>
    
    <!-- Quality Tasks -->
    <rule priority="4">
      <condition>domain = quality</condition>
      <agent>quality-fixer</agent>
    </rule>
    
    <!-- Git Tasks -->
    <rule priority="5">
      <condition>domain = git</condition>
      <agent>git-manager</agent>
    </rule>
    
    <!-- Documentation Tasks -->
    <rule priority="6">
      <condition>domain = docs AND action = review</condition>
      <agent>document-reviewer</agent>
    </rule>
    
    <rule priority="7">
      <condition>domain = docs AND action = fix</condition>
      <agent>document-fixer</agent>
    </rule>
  </selection-rules>
</agent-selection>
```

### Manual Override Conditions
Agent selection can be manually overridden only in these cases:
1. **Emergency Situations**: Critical production issues
2. **Learning/Training**: Educational purposes with explicit documentation
3. **Experimentation**: POC development with temporary scope

## Strict Prohibitions

### Agent Boundary Violations
- ❌ **Cross-Domain Work**: Frontend agents doing backend work
- ❌ **Role Mixing**: Implementation agents doing design work
- ❌ **Scope Creep**: Simple task agents handling complex operations
- ❌ **Unauthorized Escalation**: Agents exceeding their defined capabilities

### Responsibility Overlap
- ❌ **Multiple Agents per Task**: One task = one primary agent
- ❌ **Shared Accountability**: Each agent owns their deliverables
- ❌ **Concurrent Modifications**: Agents working on same files simultaneously

### Quality Bypassing
- ❌ **Direct Main Commits**: Only git-manager can merge to main
- ❌ **Quality Skip**: Implementation agents bypassing quality-fixer
- ❌ **Review Bypass**: Skipping designated review agents

## Escalation Protocols

### When Agents Should Escalate

#### **task-executor** → **frontend-executor/backend-executor**
- Task complexity increases beyond simple operations
- File count exceeds 2 files
- Domain-specific expertise required

#### **quality-fixer** → **technical-designer**
- Automated fixes fail repeatedly
- Architectural changes needed for quality compliance
- Design patterns need modification

#### **Implementation agents** → **git-manager**
- Merge conflicts arise
- Branch strategy needs adjustment
- PR management required

### Escalation Process
1. **Documentation**: Record why escalation is needed
2. **Handoff**: Provide complete context to receiving agent
3. **Confirmation**: Receiving agent acknowledges responsibility
4. **Tracking**: Update task context with agent change

## Performance Metrics

### Agent Efficiency Tracking
- **Task Completion Time**: Average time per agent type
- **Success Rate**: Percentage of tasks completed without escalation
- **Quality Score**: Quality gate pass rate by agent
- **Rework Rate**: Percentage of tasks requiring rework

### Specialization Benefits
- **Expertise**: Deep knowledge in specific domains
- **Consistency**: Predictable outcomes and quality
- **Scalability**: Parallel work without conflicts
- **Maintainability**: Clear ownership and accountability

## Agent Communication Protocols

### Inter-Agent Handoffs
```
[AGENT_NAME] → [NEXT_AGENT]:
- Task: [TASK_DESCRIPTION]
- Status: [CURRENT_STATUS]
- Deliverables: [COMPLETED_ITEMS]
- Context: [RELEVANT_INFORMATION]
- Next Steps: [EXPECTED_ACTIONS]
```

### Status Reporting
Each agent must provide clear completion signals:
- **Requirements Phase**: "Requirements analysis complete. Proceeding to design phase."
- **Design Phase**: "Technical design complete. Proceeding to planning phase."
- **Planning Phase**: "Implementation planning complete. Proceeding to execution phase."
- **Implementation Phase**: "Implementation complete. All quality gates passed. Ready for review."

## Exception Handling

### Agent Unavailability
If specialized agent is unavailable:
1. **Queue Task**: Wait for agent availability (preferred)
2. **Cross-Train**: Temporary capability expansion with documentation
3. **External Resource**: Use external consultant with same specialization

### Emergency Overrides
Only in production emergencies:
- Document override reason
- Limit scope to minimum necessary changes
- Schedule proper implementation with correct agent
- Review and refactor post-emergency

---

**Enforcement**: This system is mandatory. Violations compromise project integrity and must be corrected immediately.