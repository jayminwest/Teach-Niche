---
description: Universal entry point - delegates to appropriate workflow for teach-niche
argument-hint: <requirement>
allowed-tools: Read, Glob, Grep, Task, AskUserQuestion
---

# `/do` - Universal Workflow Entry Point (teach-niche-v0)

Single command interface for all workflows in teach-niche. Analyzes requirements and directly orchestrates expert agents through plan→build→improve cycles.

## CRITICAL: Orchestration-First Approach

**IMPORTANT: Delegate as much as possible to subagents. Even reading and writing single files MUST be delegated to subagents.**

This command exists to orchestrate workflows—not to do work directly. Your role is classification, pattern selection, orchestration, and reporting.

## Purpose

The `/do` command is the universal orchestrator for teach-niche workflows. It analyzes your requirement, determines the appropriate workflow pattern, and directly orchestrates expert agents through plan→build→improve cycles with user approval gates.

## How It Works

1. **Parse Requirement**: Extract what you need done
2. **Classify Type**: Determine workflow (Phase 1 foundation or Phase 2 specialist)
3. **Route to Handler**:
   - For expert implementations: Spawn plan-agent → user approval → build-agent → improve-agent
   - For questions: Spawn question-agent
4. **Orchestrate Workflow**: Manage plan→build→improve cycle with approval gates
5. **Report Results**: Synthesize and present outcomes

## CRITICAL: Execution Control Rules

**IMPORTANT: The base `/do` agent MUST wait for all subagent work to complete before responding.**

### Rule 1: Never Use Background Execution for Task Tool

**Task tool calls MUST NOT use `run_in_background: true`.**

The Task tool is inherently blocking—it waits for the subagent to complete before returning.

**Correct Task Usage:**
```
Task(
  subagent_type: "do-management-plan-agent",
  prompt: |
    USER_PROMPT: {requirement}
)
```

### Rule 2: Wait for ALL Task Results Before Responding

**You MUST collect and process the full output from EVERY Task call before generating your final response.**

1. **Wait** for the Task call to return
2. **Capture** the full output from the subagent
3. **Process** the results (synthesize, extract file paths, etc.)
4. **Only then** generate Step 5 report

### Rule 3: Parallel Execution Must Still Block

**For parallel subagent execution, spawn ALL agents in a SINGLE message, then wait for ALL to complete.**

### Rule 4: Orchestration Sequence for Expert Implementations

**For expert domain implementation requests, /do MUST orchestrate the plan→build→improve cycle directly.**

**Orchestration Pattern:**
```
# Step 1: Plan Phase
Use Task(subagent_type: "<domain>-plan-agent", prompt: "USER_PROMPT: {requirement}")
[WAIT for plan-agent to complete]
[EXTRACT spec_path from output]

# Step 2: User Approval Gate
Use AskUserQuestion(
  question: "Plan complete. Spec saved to {spec_path}. Proceed with implementation?",
  options: ["Yes, continue to build", "No, stop here - I'll review first"]
)
[WAIT for user response]

# Step 3: Build Phase (if approved)
Use Task(subagent_type: "<domain>-build-agent", prompt: "PATH_TO_SPEC: {spec_path}")
[WAIT for build-agent to complete]
[EXTRACT files modified from output]

# Step 4: Improve Phase
Use Task(subagent_type: "<domain>-improve-agent", prompt: "Review recent changes")
[WAIT for improve-agent to complete]

# Step 5: Synthesize and Report
```

## Workflow

### Step 1: Parse Arguments

Extract requirement from `$ARGUMENTS`:
- Capture the core requirement description

### Step 2: Classify Requirement

Analyze the requirement to determine type and pattern. **Expert domains take priority**.

---

#### Expert Domain Requests (Phase 1 Foundation - ACTIVE)

**Do-Management Expert**
- Keywords: "/do routing", "classification logic", "routing table", "orchestration patterns", "execution control"
- Locations: .claude/commands/do.md, CLAUDE.md
- Indicators: /do command modifications, routing updates
- Examples: "Add payment domain to /do routing", "Update classification for Stripe keywords"

**Agent-Authoring Expert**
- Keywords: "create agent", "new expert", "agent config", "domain", "specialist", "expertise.yaml"
- Locations: .claude/agents/experts/
- Indicators: Expert domain creation, agent configuration
- Examples: "Create payment expert domain", "Setup video-security agents for teach-niche"

---

#### Phase 2 Specialist Domains (ACTIVE)

**Payment Expert (High Confidence):**
- Verbs: create, configure, process, handle, calculate, verify
- Objects: payment, checkout, payout, subscription, webhook, fee, stripe, connect
- Locations: app/api/checkout-lesson/, app/api/webhooks/stripe/, app/api/stripe/*, lib/stripe.ts
- Examples:
  - "Create Stripe checkout session for lesson"
  - "Handle charge.refunded webhook event"
  - "Fix fee calculation duplication"
  - "Add transaction audit logging"

**Video-Security Expert (High Confidence):**
- Verbs: generate, verify, secure, protect, log, detect
- Objects: video, signed URL, access, enrollment, RLS, preview, DRM, abuse
- Locations: lib/video-utils.ts, app/api/get-video-url/, app/api/secure-video-bucket/, components/video-player.tsx
- Examples:
  - "Reduce signed URL expiry to 5 minutes"
  - "Replace LIKE RLS with enrollment JOIN"
  - "Implement video access logging"
  - "Fix x-preview-request header vulnerability"

**Auth Expert (High Confidence):**
- Verbs: protect, guard, authenticate, authorize, verify, sync
- Objects: role, permission, middleware, session, admin, instructor, student, RLS
- Locations: lib/auth-utils.ts, middleware.ts, app/auth/*, supabase/migrations/*_rls*.sql
- Examples:
  - "Create requireInstructor role guard"
  - "Add middleware protection for /admin routes"
  - "Implement session sync on role changes"
  - "Bootstrap first admin user"

**Database Expert (High Confidence):**
- Verbs: migrate, generate, consolidate, version, query, optimize
- Objects: schema, migration, types, supabase, postgres, table, RLS
- Locations: supabase/migrations/, types/supabase.ts, lib/supabase/server-utils.ts
- Examples:
  - "Generate TypeScript types from schema"
  - "Consolidate migrations into baseline"
  - "Add schema versioning table"
  - "Create test mock from schema"

**Expert Question Detection:**
- Phrasing: "How do I...", "What is the pattern for...", "Explain...", "Why..."
- Action: Route to `<domain>-question-agent` instead of `<domain>-plan-agent`

---

#### Pattern Classification (After Domain Identified)

**Implementation Request:**
- Verbs: fix, add, create, implement, update, configure, refactor
- Objects: Concrete things to build/change
- Pattern: Use Pattern A (Plan→Build→Improve)

**Question Request:**
- Phrasing: "How do I...", "What is...", "Why...", "Explain...", "When should I..."
- Pattern: Use Pattern B (Question-Agent)

**Ambiguous** → Ask user for clarification

### Step 3: Determine Handler Type

**Pattern A: Expert Implementation (Plan→Build→Improve)**
- Triggers: Expert domain + implementation request
- Examples: "Create payment expert domain", "Add Stripe webhook handler"
- Flow: Spawn plan-agent → user approval → build-agent → improve-agent

**Pattern B: Expert Question (Direct Answer)**
- Triggers: Expert domain + question phrasing
- Examples: "How do I configure Stripe Connect?", "What tools for database expert?"
- Flow: Spawn question-agent → report answer

### Step 4: Execute Pattern

---

#### Pattern A: Expert Implementation (Plan→Build→Improve)

**Used for:** Expert domain implementation requests

**Phase 1 - Plan:**
```
Use Task tool:
  subagent_type: "<domain>-plan-agent"
  prompt: |
    USER_PROMPT: {requirement}

    Analyze this requirement and create a specification.
    Save spec to: .claude/.cache/specs/{domain}/{slug}-spec.md
    Return the spec path when complete.
```

Capture `spec_path` from plan-agent output.

**Phase 2 - User Approval:**
```
Use AskUserQuestion:
  question: "Plan complete. Specification saved to {spec_path}. Ready to proceed with implementation?"
  options:
    - "Yes, continue to build" (Recommended)
    - "No, stop here - I'll review the spec first"
```

**If user selects "No, stop here":**
- Skip to Step 5 (Report) with status: "Plan Complete - User Review Requested"
- Include spec location in report
- Suggest resume command: `/do "build from {spec_path}"`
- Exit gracefully (this is NOT an error)

**If user selects "Yes, continue to build":**
- Proceed to Phase 3

**Phase 3 - Build:**
```
Use Task tool:
  subagent_type: "<domain>-build-agent"
  prompt: |
    PATH_TO_SPEC: {spec_path}

    Read the specification and implement the changes.
    Report files modified when complete.
```

Capture `files_modified` from build-agent output.

**Phase 4 - Improve (Optional):**
```
Use Task tool:
  subagent_type: "<domain>-improve-agent"
  prompt: |
    Review recent {domain} changes and update expert knowledge.

    Analyze git history, extract learnings, update expertise.yaml
    Report expertise updates when complete.
```

**Error Handling for Improve:**
If improve-agent fails:
- Log the error
- Set `improve_status: "Skipped - Error"`
- Continue to Step 5 (workflow is still successful)

**Domains Using This Pattern (Phase 1 + Phase 2):**
- do-management
- agent-authoring
- payment
- video-security
- auth
- database

---

#### Pattern B: Expert Question (Direct Answer)

**Used for:** Expert domain questions (no implementation)

```
Use Task tool:
  subagent_type: "<domain>-question-agent"
  prompt: |
    USER_PROMPT: {requirement}

    Provide an informed answer based on {domain} expertise.
```

Capture answer from question-agent output.
Proceed to Step 5 (Report).

**Domains Using This Pattern:**
- All expert domains (Phase 1 + Phase 2 when created)

---

### Step 5: Wait and Collect Results

**CRITICAL: MUST wait for all Task calls to complete before proceeding.**

For Pattern A (Expert Implementation):
- Wait for plan-agent → extract spec_path
- Wait for user approval → get decision
- Wait for build-agent → extract files_modified
- Wait for improve-agent → extract expertise_updates (or log failure)

For Pattern B (Question):
- Wait for question-agent → extract answer

**Validation Checkpoint:**
Before proceeding to Step 6, verify:
- [ ] All spawned agents returned results
- [ ] Results are non-empty (or error is logged)
- [ ] No pending Task calls
- [ ] Handler output captured

### Step 6: Report Results

#### Report Format: Pattern A (Expert Implementation)

**If user declined at approval gate:**
```markdown
## `/do` - Plan Complete, Awaiting Review

**Requirement:** {requirement}
**Domain:** {expert-domain}
**Status:** Plan Complete - User Review Requested

### Specification

Plan saved to: {spec_path}

Review the specification and when ready, resume with:
```
/do "build from {spec_path}"
```

### Next Steps

1. Review the spec at {spec_path}
2. Edit if needed
3. Resume build with command above
```

**If full workflow completed:**
```markdown
## `/do` - Complete

**Requirement:** {requirement}
**Domain:** {expert-domain}
**Status:** Success

### Workflow Stages

| Stage | Status | Key Output |
|-------|--------|------------|
| Plan | ✓ Complete | {spec_path} |
| Build | ✓ Complete | {file_count} files modified |
| Improve | ✓ Complete | Expert knowledge updated |

### Files Modified

{list from build-agent output with absolute paths}

### Expertise Updated

{summary from improve-agent, or "Skipped - Error" if failed}

### Specification

The plan specification is saved at: {spec_path}

### Next Steps

{context-specific suggestions based on what was done}
```

#### Report Format: Pattern B (Expert Question)

```markdown
## `/do` - Complete

**Requirement:** {requirement}
**Domain:** {expert-domain}
**Type:** Question

### Answer

{answer from question-agent}

### Related

{any related topics, files, or examples from question-agent}
```

## Classification Logic

### Expert Domain Indicators (teach-niche Phase 1 - ACTIVE)

**Do-Management Expert (High Confidence):**
- Verbs: add, update, route, classify, improve, refactor
- Objects: /do routing, classification logic, orchestration, approval gates
- Locations: .claude/commands/do.md, CLAUDE.md
- Examples: "Add payment domain to /do", "Update routing for Stripe keywords"

**Agent-Authoring Expert (High Confidence):**
- Verbs: create, configure, setup, scaffold, generate
- Objects: agent, expert, domain, specialist, expertise.yaml
- Locations: .claude/agents/experts/
- Examples: "Create payment expert domain", "Setup video-security agents"

**Payment Expert (High Confidence):**
- Verbs: create, configure, process, handle, calculate
- Objects: payment, checkout, payout, webhook, fee, stripe, connect
- Locations: app/api/stripe/*, lib/stripe.ts
- Examples: "Fix fee calculation duplication", "Add charge.refunded webhook"

**Video-Security Expert (High Confidence):**
- Verbs: generate, verify, secure, protect, log
- Objects: video, signed URL, access, enrollment, RLS, preview
- Locations: lib/video-utils.ts, app/api/get-video-url/
- Examples: "Reduce signed URL expiry", "Implement access logging"

**Auth Expert (High Confidence):**
- Verbs: protect, guard, authenticate, authorize
- Objects: role, permission, middleware, session, RLS
- Locations: lib/auth-utils.ts, middleware.ts
- Examples: "Create role guards", "Add middleware protection"

**Database Expert (High Confidence):**
- Verbs: migrate, generate, consolidate, version
- Objects: schema, migration, types, supabase, table
- Locations: supabase/migrations/, types/supabase.ts
- Examples: "Generate types from schema", "Consolidate migrations"

**Expert Question Detection:**
- Phrasing: "How do I...", "What is the pattern for...", "Explain...", "Why..."
- Action: Route to `<domain>-question-agent` instead of `<domain>-plan-agent`

## Examples

### Expert Domain - Implementation (Pattern A)

**Agent authoring implementation:**
```bash
/do "Create payment expert domain for Stripe Connect"

# /do executes Pattern A with agent-authoring domain:
# 1. agent-authoring-plan-agent → creates spec
# 2. User approval gate
# 3. agent-authoring-build-agent → creates 5 files
# 4. agent-authoring-improve-agent → updates expertise
```

**Do-management implementation:**
```bash
/do "Add payment keywords to /do routing"

# /do executes Pattern A with do-management domain:
# 1. do-management-plan-agent → plans routing update
# 2. User approval gate
# 3. do-management-build-agent → updates do.md, CLAUDE.md, expertise.yaml
# 4. do-management-improve-agent → learns routing pattern
```

---

### Expert Domain - Questions (Pattern B)

**Agent authoring question:**
```bash
/do "How do I create a payment expert domain?"

# /do executes Pattern B:
# agent-authoring-question-agent returns answer
```

**Do-management question:**
```bash
/do "What keywords route to payment expert?"

# /do executes Pattern B:
# do-management-question-agent returns routing info
```

---

### Phase 2 Specialists - Implementation (Pattern A)

**Payment flows:**
```bash
/do "Fix fee calculation duplication across routes"
# payment-plan-agent → user approval → payment-build-agent → payment-improve-agent

/do "Add charge.refunded webhook handler"
# payment-plan-agent → expand webhook coverage spec
```

**Video security:**
```bash
/do "Reduce signed URL expiry to prevent sharing"
# video-security-plan-agent → 5-minute URLs with progressive refresh

/do "Implement video access logging"
# video-security-plan-agent → video_access_logs table + abuse detection
```

**Auth patterns:**
```bash
/do "Create middleware guards for /admin routes"
# auth-plan-agent → middleware route protection

/do "Bootstrap first admin user"
# auth-plan-agent → admin creation migration
```

**Database schema:**
```bash
/do "Automate TypeScript type generation from schema"
# database-plan-agent → types:generate npm script

/do "Consolidate migrations into baseline schema"
# database-plan-agent → migration consolidation workflow
```

---

### Phase 2 Specialists - Questions (Pattern B)

```bash
/do "How do I handle Stripe webhooks?"
# payment-question-agent → webhook patterns with idempotency

/do "How long should signed URLs last?"
# video-security-question-agent → 5-minute expiry + progressive refresh

/do "How do I protect admin routes?"
# auth-question-agent → middleware + role guard patterns

/do "How do I generate TypeScript types?"
# database-question-agent → supabase gen types workflow
```

---

### User Declining at Approval Gate

```bash
/do "Create video-security expert domain"

# Workflow:
# 1. agent-authoring-plan-agent creates spec
# 2. AskUserQuestion: "Proceed with build?"
# 3. User selects: "No, stop here - I'll review first"
# 4. /do reports:
#    "Plan Complete - User Review Requested"
#    "Spec at: .claude/.cache/specs/agent-authoring/video-security-expert-spec.md"
# 5. Exit gracefully (NOT an error)
```

## Implementation Notes

**Current State:**
- 6 expert domains active: do-management, agent-authoring, payment, video-security, auth, database
- 2 orchestration patterns: Expert Implementation (A), Expert Question (B)
- Flat orchestration: /do directly spawns expert agents (no coordinator layer)
- Classification uses keyword matching with fallback to user questions

**Execution Control:**
- Task tool calls are inherently blocking (wait for subagent completion)
- No `run_in_background` parameter for Task tool
- /do MUST collect full output before responding
- Orchestration patterns enforce sequential dependencies (plan→approval→build→improve)

**teach-niche Context:**
- Next.js 15 + Supabase + Stripe Connect stack
- Phase 1: Foundation (do-management + agent-authoring)
- Phase 2: Specialists ACTIVE (payment, video-security, auth, database)
- Scout reconnaissance findings embedded in Phase 2 domain expertise

**Future Enhancements:**
- Build resumption: `/do "build from {spec_path}"` pattern
- Classification confidence scoring
- Additional specialist domains as patterns emerge
