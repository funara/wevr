---
name: diff-review
description: Compare code implementations and diffs against PRD requirements and definitions-of-done. Act as a strict PASS/FAIL review gate.
---

# Diff Review & Implementation Verification

## Core Principles

- **Definition-of-Done Grounding**: Compare changes strictly against the PRD's explicit definition-of-done (DoD) for each task. Do not evaluate style/completeness against unstated standards.
- **Binary Verdict per Task**: Each task receives PASS or FAIL individually. A partial pass is a FAIL.
- **Regression Awareness**: Verify that code changes did not break previously passed requirements.
- **Fail Fast**: If the implementation cannot be matched due to missing info or contradictions, flag it as a gap immediately. Do not guess.
- **No Scope Creep Judgment**: Flag code that exists but does not map to any DoD item as "extra scope" — but do not fail it unless it contradicts a requirement.

## Over-Engineering Lens (BLOAT List)
Evaluate the implementation against the BLOAT list:
- **B**: Boilerplate that nobody asked for.
- **L**: Library or external dependencies added when stdlib/native features suffice.
- **O**: Over-abstraction (classes, interfaces, wrappers) not explicitly requested.
- **A**: Additional features or logic beyond the PRD definition-of-done.
- **T**: Too many files where a simpler, single-file implementation would work.

Report any found BLOAT as gaps.

## Hard Rules
- Output *only* PASS/FAIL and the Gap List (with task_id, expected, actual, and gap).
- Do NOT suggest code, improvements, architectural re-designs, or decisions.
- Any sentence starting with "I suggest..." or "it would be better to..." is strictly out of scope.

## Mandatory Output Schema

```markdown
## Verdict: PASS | FAIL

## Mapping
| Requirement/Expectation | Found in artifact? | Note |
|---|---|---|

## Gaps (if FAIL)
- <item>: <expected> vs <actual>
```
