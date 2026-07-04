# Wevr

[![npm version](https://img.shields.io/npm/v/wevr)](https://www.npmjs.com/package/wevr)
[![npm downloads](https://img.shields.io/npm/dm/wevr)](https://www.npmjs.com/package/wevr)
[![License](https://img.shields.io/npm/l/wevr)](https://github.com/funara/wevr/blob/main/LICENSE)

** Plan - Build - Review ** -- opinionated engineering workflow installer for [OpenCode](https://opencode.ai).

## TL;DR

Wevr installs an opinionated, strict AI-agent workflow (Compose, Debug, and Analyze) with 14 specialized subagents into **OpenCode**. It enforces structured phases (Explore -> Plan -> Build), interactive guardrail gates, and test verification without ad-hoc delegation.

## Quick Start

Get up and running in 3 simple steps:

1. **Install globally:**
```bash
npm install -g wevr
```

2. **Initialize and configure agents:**
```bash
wevr init
```
*(Select LLM models for reasoning, precision, and fast tiers when prompted)*

3. **Launch OpenCode with Wevr:**
```bash
wevr
```

---

## What is Wevr?

Wevr installs **3 primary agents + 14 subagents** into OpenCode -- each primary agent owns its exclusive subagents, scoped permissions, and enforced workflow rules. No shared subagents. No ad-hoc delegation.

| Primary Agent | Purpose | Subagents |
|---|---|---|
| **Compose** | Feature work -- Explore -> Plan -> Build | Researcher, Plan-Writer, Plan-Checker, Coder, Tester, Reviewer, Compose-Reporter |
| **Debug** | Bug investigation -- Investigate -> Fix -> Report | Inspector, Fixer, Debug-Reporter |
| **Analyze** | Security audit -- Trace -> Patch -> Audit | Tracer, Patcher, Auditor, Analyze-Reporter |

---

### Parallel Subagent Swarming

To optimize wall-clock execution time, Wevr's primary agents are empowered to **swarm multiple subagents concurrently** (e.g. running multiple researchers, inspectors, tracers, coders, fixers, patchers, testers, or auditors in parallel) for independent directories, files, or API endpoints. This enables non-linear workflow execution and leverages OpenCode's concurrent process engine.

---

## Agent Workflows

### Compose -- Feature Work

Compose is the **single entry point for all feature work**. It runs 3 strict, one-directional phases. Phase direction is one-way -- no going back without explicit user instruction.

```
You describe a feature / idea
        |
        v
  +-----------------------------------------+
  |  EXPLORE PHASE  (mandatory start)       |
  |                                         |
  |  Delegate: Researcher                   |
  |  -> deep codebase + web fact-finding    |
  |  -> confirmed-inferred facts / risks    |
  |                                         |
  |  Compose internally assesses:          |
  |  Is this feature simple or complex?     |
  +----------+------------------------------+
             |
    +--------+---------------+
    | Simple feature         |  Complex feature
    v                        v
GUARDRAIL GATE 1a      GUARDRAIL GATE 1b
"Build directly?"        "Write a PRD?"
    |                        |
    | Yes                    | Yes
    |                        v
    |          +------------------------------+
    |          |  PLAN PHASE                  |
    |          |                              |
    |          |  Plan-Writer -> docs/plans/  |
    |          |  Plan-Checker validates PRD  |
    |          |  PASS/FAIL + gap list only   |
    |          |                              |
    |          |  FAIL -> surface gaps to you |
    |          |  (max 5 loops)               |
    |          |                              |
    |          |  PASS -> GUARDRAIL GATE 2    |
    |          |  "Build from this PRD?"      |
    |          +-------------+----------------+
    |                        | Yes
    +----------+-------------+
               v
  +--------------------------------------------+
  |  BUILD PHASE                               |
  |                                            |
  |  Coder -> implements from PRD / request    |
  |     |                                      |
  |     v                                      |
  |  Tester -> PASS/FAIL/BLOCKED               |
  |     | FAIL -> back to Coder (max 5 loops)  |
  |     | PASS v                               |
  |     v                                      |
  |  Reviewer -> PASS/FAIL + gap list          |
  |     | FAIL -> back to Coder (max 5 loops)  |
  |     | PASS v                               |
  |     v                                      |
  |  Compose-Reporter -> docs/reports/         |
  +--------------------------------------------+
               |
               v
         You review result
               |
  Compose resets -> asks: New feature? Debug? Iterate?
```

**Key rules:**
- Compose has **no read/write/bash permissions** -- all work delegated to subagents
- Phase transition only via guardrail gates -- no skipping
- `Coder -> Coder` loops without Tester verification are forbidden
- 5 consecutive FAILs from Tester or Reviewer -> surfaces to you

---

### Debug -- Bug Investigation

Debug is a **standalone primary agent** -- does not depend on Compose. Trigger it directly from the Debug tab whenever you find a bug.

```
You report a bug / defect
        |
        v
GUARDRAIL GATE 1 (question tool):
"Ready to investigate?"
        | Yes
        v
  +---------------------------------------------+
  |  INVESTIGATE PHASE  (Inspector subagent)    |
  |                                             |
  |  Review mode (Debug selects):            |
  |  - PR Review        -> classify R1-R6       |
  |  - Architecture     -> dependency analysis  |
  |  - Tech Debt        -> Pain x Spread score  |
  |  - Test Quality     -> classify T1-T6       |
  |                                             |
  |  Output: Iron Law chain per finding         |
  |  Symptom -> Source -> Consequence -> Remedy |
  +----------+----------------------------------+
             |
    Root cause identified?
    +--------+--------+
    | Yes             | No / unknowns remain
    v                 v
GUARDRAIL GATE 2 (question tool):
"Ready to apply fix?"
    | Yes             Halt -- surface to you
    v                 with specific questions
  +-------------+
  |  FIX PHASE  | (Fixer subagent)
  +------+------+
         |
         v
  +--------------------------------------+
  |  REPORT PHASE                        |
  |                                      |
  |  Delegate: Debug-Reporter            |
  |  -> Iron Law diagnosis report        |
  |  -> saved to docs/reports/           |
  +--------------------------------------+
         |
         v
   You review the diagnosis + fix
         |
  Debug resets -> asks (question tool): Finished? Iterate?
```

**Key rules:**
- Debug has **no read/write/bash permissions** -- all delegated to subagents
- Executes only after Gate 1 (Investigation) and Gate 2 (Fix) user confirmations
- Never delegates Fixer without Inspector confirming root cause first
- If unknowns remain after investigation -> halts and prompts you, does not guess

---

### Analyze -- Security Audit

Analyze is a **standalone primary agent** -- does not depend on Compose or Debug. Trigger it directly from the Analyze tab to audit any codebase for security vulnerabilities and quality decay.

```
You trigger a security audit
        |
        v
GUARDRAIL GATE 1 (question tool):
"Ready to start scan?"
        | Yes
        v
  +---------------------------------------------------+
  |  TRACE PHASE  (Tracer subagent)                   |
  |                                                   |
  |  -> WSTG-guided breadth-first recon               |
  |  -> trace data flows: input -> path -> sink       |
  |                                                   |
  |  Output:                                          |
  |  - Confirmed Vulnerabilities  (OWASP category,    |
  |    location, data flow)                           |
  |  - Suspected Vulnerabilities  (manual verify)     |
  |  - Quality & Decay Risks      (e.g. hardcoded     |
  |    secrets, missing input validation)             |
  +----------+----------------------------------------+
             |
             v
      GUARDRAIL GATE 2 (question tool):
      "Audit findings ready. How to proceed?"
      +-- "Patch all confirmed findings"    -> PATCH PHASE
      +-- "Select specific findings"        -> PATCH PHASE (you pick)
      +-- "Audit only -- no patches"         -> AUDIT PHASE (skip PATCH)
      +-- "Re-investigate attack surface"  -> re-delegate Tracer
             |
             v
  +--------------------------------------------------+
  |  PATCH PHASE  (skipped if audit-only)            |
  |                                                  |
  |  Delegate: Patcher                               |
  |  -> Ponytail mindset: smallest correct diff      |
  |  -> prefer deleting the cause over wrapping it   |
  |  -> escalates to you if patch > 10 lines         |
  +----------+---------------------------------------+
             |
             v
  +--------------------------------------------------+
  |  AUDIT PHASE  (max 5 loops)                      |
  |                                                  |
  |  Delegate: Auditor                               |
  |  -> verify patch resolved vulnerabilities        |
  |  -> security regression check                    |
  |  |  (Auditor subagent)                           |
  |                                                  |
  |  PASS -> proceed to report                       |
  |  FAIL -> re-delegate Patcher with Gap + BLOAT    |
  |         lists verbatim (max 5 loops, then you)   |
  |                                                  |
  |  Delegate: Analyze-Reporter                        |
  |  -> security audit report -> docs/reports/       |
  +--------------------------------------------------+
             |
             v
        You review the audit report
             |
  Analyze resets -> asks (question tool): Finished? Iterate?
```

**Key rules:**
- Analyze has **no read/write/bash permissions** -- all delegated to subagents
- Never starts scanning/tracing without Gate 1 user confirmation
- Never patches without a GUARDRAIL GATE 2 user confirmation after TRACE
- 5 consecutive AUDIT FAILs -> surfaces to you

---

## Subagent Reference

Each subagent belongs to exactly one primary agent and cannot be invoked by anyone else:

| Primary | Phase | Subagent | Model Tier | Role |
|---------|-------|----------|------------|------|
| Compose | EXPLORE | Researcher | Reasoning | Fact-finding: confirmed_facts / inferred_facts / unknowns / risks |
| Compose | PLAN | Plan-Writer | Fast | **Formatter** -- writes PRD to `docs/plans/`, missing input = TBD |
| Compose | PLAN | Plan-Checker | Reasoning | **Gate** -- PASS/FAIL + gap list only, no suggestions |
| Compose | BUILD | Coder | Fast | Implements code from PRD |
| Compose | BUILD | Tester | Precision | PASS/FAIL/BLOCKED + coverage gaps only |
| Compose | BUILD | Reviewer | Precision | **Gate** -- PASS/FAIL + gap list only, no suggestions |
| Compose | BUILD | Compose-Reporter | Fast | **Formatter** -- completion report to `docs/reports/` |
| Debug | INVESTIGATE | Inspector | Reasoning | Brooks-Lint RCA (Iron Law + 6 decay risks + 4 review modes) |
| Debug | FIX | Fixer | Fast | Minimal, root-cause-targeted fix |
| Debug | REPORT | Debug-Reporter | Fast | **Formatter** -- Iron Law diagnosis report to `docs/reports/` |
| Analyze | TRACE | Tracer | Precision | WSTG recon + vuln path tracing, no remedies |
| Analyze | PATCH | Patcher | Fast | Minimal, security-targeted fix (Ponytail, max 10 lines) |
| Analyze | AUDIT | Auditor | Precision | **Gate** -- PASS/FAIL + Gap List + BLOAT List only |
| Analyze | AUDIT | Analyze-Reporter | Fast | **Formatter** -- security audit report to `docs/reports/` |

---

## Flow Rules

| Rule | Detail |
|------|--------|
| **Mandatory starts** | Compose always starts in EXPLORE. Analyze always starts in TRACE. No skipping. |
| **Guardrail gates** | Compose: Gate 1 (EXPLORE->PLAN/BUILD), Gate 2 (PLAN->BUILD). Analyze: Gate after TRACE. All require user confirmation. |
| **Gate agents** | Plan-Checker, Reviewer, Auditor -- PASS/FAIL + gap list only. No suggestions, no decisions. |
| **Formatter agents** | Plan-Writer, Compose-Reporter, Debug-Reporter, Analyze-Reporter -- stateless. Missing input = TBD/NA. Never invent content. |
| **Fact-finding agents** | Researcher, Inspector, Tracer -- facts/inferences/risks only. No recommendations. |
| **Build gate order** | Coder -> Tester -> Reviewer -> Compose-Reporter. No skipping. No Coder->Coder without verification. |
| **FAIL loops** | Plan-Checker FAIL: max 5 loops. Build FAIL (Tester/Reviewer): max 5 loops. Analyze AUDIT FAIL: max 5 loops. All surface to you after limit. |
| **Output directories** | PRDs -> `docs/plans/`. Reports (Compose-Reporter, Debug-Reporter, Analyze-Reporter) -> `docs/reports/`. Enforced by permissions. |
| **Independence** | Debug and Analyze are fully standalone -- triggered directly, do not flow through Compose. |

---

## Brooks-Lint Methodology (Debug)

The Debug pipeline uses the [Brooks-Lint](https://hyhmrright.github.io/brooks-lint/guide.html) framework:

- **Iron Law** per finding: Symptom -> Source -> Consequence -> Remedy
- **6 Decay Risks (R1-R6)**: Cognitive Overload, Change Propagation, Knowledge Duplication, Accidental Complexity, Dependency Disorder, Domain Model Distortion
- **4 Review Modes**: PR Review (R1-R6), Architecture Audit, Tech Debt Assessment (Pain x Spread), Test Quality (T1-T6)
- **T1-T6 Test Risks**: Test Obscurity, Brittleness, Duplication, Mock Abuse, Coverage Illusion, Architecture Mismatch

## Principle Hierarchy

All agents resolve conflicts using this priority order (defined in `hierarchy.txt`):

1. **PRD / Spec** -- explicit requirement text
2. **Verdict** -- Reviewer / Plan-Checker / Auditor PASS/FAIL
3. **Engineering principles** -- Fail Fast, Single Responsibility
4. **Heuristics** -- KISS, DRY, SOLID, Law of Demeter
5. **Local optimization** -- style preference

---

## Install

```sh
npm install -g wevr
```

## Usage

### `wevr`

The everyday command. Runs three steps in sequence:

1. **Update check** -- compares local version against npm registry; prompts to `npm install -g wevr` if a new version is available
2. **Doctor check** -- verifies installation health; prompts to repair with `wevr init` if any checks fail
3. **Launch** -- spawns `opencode`

### `wevr init`

Prompts you to select models for three agent tiers (reasoning, precision, and fast), then:

- Asks whether to install the wevr-squeeze plugin (can decline)
- Builds a complete `opencode.jsonc` config with the chosen models injected into the right agents
- Backs up any existing config to `opencode.jsonc.bak.*`
- Writes the new config to `~/.config/opencode/opencode.jsonc`
- Copies all 18 agent prompt files into `~/.config/opencode/prompts/`
- Copies `wevr-flow` and `wevr-squeeze` plugins into `~/.config/opencode/plugins/`
- Writes a `package.json` declaring `@opencode-ai/plugin` as a dependency

### `wevr doctor`

Checks installation health and reports pass/fail for each component:

- `opencode.jsonc` exists
- All 18 prompt files present
- Both plugin files present
- `wevr-contrast` theme configured
- `package.json` with `@opencode-ai/plugin` dependency
- squeeze binary available
- Config is valid JSON

Exits with code `0` if all pass, `1` if any fail.

### `wevr update`

Checks the npm registry for a newer version of wevr and prompts to automatically install the upgrade globally. If an update is successfully completed, the running CLI process exits to let you start fresh on the new version.

### `wevr uninstall`

Restores your previous configuration:

- Finds the latest timestamped backup and restores it to `opencode.jsonc`
- Restores `tui.json` from the latest backup (returning the TUI theme to its pre-Wevr state)
- Removes `prompts/`, `plugins/`, `bin/`, and `themes/wevr-contrast.json` directories and files
- Preserves `opencode.jsonc` and `package.json`

---

## Bundled Package

### `wevr-flow`

Provides subagents with cross-session context access:

- `parent_session_messages` -- read the parent session's transcript
- `session_messages(sessionId)` -- read any session by ID
- `session_messages_batch(sessionIds)` -- read multiple sessions in one call

### `wevr-squeeze`

Hooks into tool execution to rewrite bash commands through the `squeeze` binary, filtering verbose output and saving **60-90% of tokens** across all agents.

Both plugins and their dependency declaration are installed automatically by `wevr init` -- no extra user action required. On OpenCode's first launch, the bundled Bun runtime installs `@opencode-ai/plugin` from the generated `package.json`.

### Themes & Colors

Wevr comes with a pre-configured OLED high-contrast dark theme called **`wevr-contrast`** that is automatically applied to your OpenCode terminal interface.
