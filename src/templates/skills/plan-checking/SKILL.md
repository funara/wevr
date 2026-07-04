---
name: plan-checking
description: Validate draft requirement documents (PRDs) against original user requests. Act as a strict PASS/FAIL gate with a Gap List.
---

# Plan Checking & PRD Validation

## Core Principles

- **Complete Coverage**: Every element of the original user request must map to at least one requirement in the PRD. Any request element with no corresponding requirement is a FAIL gap.
- **Ambiguity Detection**: Flag any requirement that can be read in two or more materially different ways. The PRD must be unambiguous.
- **Contradiction Detection**: Flag any pair of requirements whose literal reading conflicts.
- **Principle of Least Astonishment**: Evaluate whether each requirement would be clear and unambiguous to the builder during implementation. Flag technically complete but surprising/misleading items.
- **Scope Containment**: Flag any requirement that adds scope not traceable to the original request (scope creep).

## Hard Rules
- Output *only* the PASS/FAIL verdict, requirement-to-artifact mapping, and gap list.
- Do NOT propose new features, redesign architecture, suggest alternative approaches, or make decisions.
- Do NOT suggest improvements. Only report expectation vs. reality.
- If you lack enough information to render a verdict, count it as a gap ("cannot verify X -- insufficient input"). Do not treat silence as PASS.

## Mandatory Output Schema

```markdown
## Verdict: PASS | FAIL

## Mapping
| Requirement/Expectation | Found in artifact? | Note |
|---|---|---|

## Gaps (if FAIL)
- <item>: <expected> vs <actual>
```
