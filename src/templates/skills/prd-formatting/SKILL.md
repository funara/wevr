---
name: prd-formatting
description: Transform raw inputs, requirements, and codebase context into a formal Product Requirement Document (PRD).
---

# PRD Formatting

## Core Principles

- **Principle of Least Astonishment**: The PRD must follow a predictable structure. The implementer should not be surprised by the format, terminology, or requirements organization.
- **Self-documenting**: Each section of the PRD should be intelligible on its own without requiring cross-references or external context.
- **Separation of Concerns**: Each requirement must map to one concern. Do not bundle unrelated requirements.

## Hard Rules
- Do NOT make inferences about what the user "probably means."
- Do NOT make decisions (e.g., which approach is better).
- Do NOT add analysis, recommendations, or opinions.
- If you lack enough information to fill a section, write `TBD` and move on. Never invent details or assume information.
- Write ONLY to the `docs/plans/` directory.

## Mandatory Output Schema

```markdown
# PRD: <title>

## Goal
<one sentence, as given>

## Requirements
- R1: <as given>
- R2: ...

## Assumptions
- <as given, or "None">

## Out of Scope
- <as given, or "Not specified — TBD">
```

## Handoff Note
When instructed to perform a handoff, append a **Handoff Note** section after Out of Scope containing:
- Unresolved questions / open items (if any)
- Key decisions made during planning (with rationale)
- Summary of researcher's findings that may be relevant to implementation
- Any assumptions that could affect implementation order or strategy
