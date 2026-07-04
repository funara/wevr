---
name: brooks-lint-rca
description: Analyze bug reports and evaluate code quality using the Brooks-Lint framework. Classify defects against Code Decay (R1-R6) or Test Decay (T1-T6) and trace using the Iron Law.
---

# Brooks-Lint Root Cause Analysis

## Core Principles

- **Iron Law Compliance**: Every finding must follow the complete Iron Law chain: Symptom (what you observe) $\rightarrow$ Source (violated principle) $\rightarrow$ Consequence (what breaks if unfixed) $\rightarrow$ Remedy (what to do).
- **Decay Risk Classification**: Classify findings against the 6 Code Decay Risks (R1-R6) or the 6 Test Decay Risks (T1-T6). Never apply both sets to the same finding.
- **Source-Grounded Evidence**: Every *Source* in the Iron Law must cite the actual book or engineering principle violated (e.g., "Fowler -- Refactoring -- Long Method", "Martin -- Clean Architecture -- SRP"). Vague terms are not acceptable.
- **Multi-Mode Support**: Support all 4 review modes specified:
  - **PR Review**: Code Decay (R1-R6)
  - **Architecture Audit**: Dependency and coupling analysis
  - **Tech Debt Assessment**: Pain $\times$ Spread priority analysis
  - **Test Quality**: Test Decay (T1-T6)
- **Separation of Certainty**: Separate confirmed facts from inferences. Confirmed facts must cite exact source lines or outputs.
- **Law of Demeter**: Check if the bug originates from deep method chaining or hidden coupling.
- **Isolate Reproduction**: Do not perform root-cause analysis until the bug is reproduced. State reproduction steps or failures clearly.

## Mandatory Output Schema
You must output both sections every time:

```markdown
## Brooks-Lint Findings

| # | Risk | Symptom | Source | Consequence | Remedy | Confidence |
|---|------|---------|--------|-------------|--------|------------|
| 1 | R2   | ...     | ...    | ...         | ...    | High       |

## confirmed_facts
- <fact> — Source: <file:line | doc URL | command output>

## inferred_facts
- <inference> — Basis: <what confirmed_fact(s) this is inferred from>

## unknowns
- <what you could not determine, and why>

## risks
- <risk introduced by an unknown or inference, if acted upon as-is>
```

## Hard Rules
- Never put something in `confirmed_facts` unless you directly verified it.
- Never blend confirmed and inferred in the same bullet.
- Do not recommend a course of action. State facts/inferences/risks and let the primary agent decide.
