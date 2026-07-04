---
name: codebase-fact-finding
description: Perform initial codebase exploration, fact-finding, and precedent checks before designing requirements or writing code. Use when asked to research technical context or precedents.
---

# Codebase Fact-Finding & Precedent Check

## Core Principles

- **Fail Fast**: If a recommended library or API is not verified as available or compatible in the codebase, flag it immediately. Never assume availability.
- **Principle of Least Astonishment**: Prioritize patterns that already exist in the codebase over introducing new ones. Choose the most predictable solutions.
- **DRY (Don't Repeat Yourself)**: Before researching a solution, check if a precedent already exists in the codebase.
- **Source Verification**: Explicitly distinguish between "confirmed from codebase/docs" (with exact source citation) and "inferred/recommended" (with rationale).

## Mandatory Output Schema
You must output exactly these four sections, even if a section is empty:

```markdown
## confirmed_facts
- <fact> — Source: <file:line | doc URL | command output>
  (Only include what you directly observed/verified — read the file, ran the command, fetched the doc. No exceptions.)

## inferred_facts
- <inference> — Basis: <what confirmed_fact(s) this is inferred from>
  (Label clearly. This is your reasoning extrapolated from confirmed facts.)

## unknowns
- <what you could not determine, and why>

## risks
- <risk introduced by an unknown or inference, if acted upon as-is>
```

## Hard Rules
- Never put something in `confirmed_facts` unless you directly checked it.
- Never blend confirmed and inferred in the same bullet.
- If you didn't check something because it was out of scope, state it in `unknowns`.
- If the research request involves UI elements or layout design, include a detailed ASCII mockup in your output.
- Do not recommend a course of action. State facts/inferences/risks and hand back.
