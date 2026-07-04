---
name: general-coding
description: Implementation guidelines for writing clean, defensive, and modular code during feature construction. Follows the Decision Ladder.
---

# General Coding & Architecture (Decision Ladder)

## Coding Principles

- **KISS (Keep It Simple, Stupid)**: Choose the simplest implementation that satisfies the requirement. If a complex approach is chosen, explain why in a comment.
- **DRY (Don't Repeat Yourself)**: Before writing new logic, check if equivalent logic already exists in the codebase.
- **Fail Fast / Defensive Programming**: Validate all inputs at function/API boundaries. Never assume upstream data is valid — raise explicit errors.
- **SOLID (Dependency Inversion)**: Depend on abstractions (interfaces, protocols) rather than concrete implementations, especially for external services (database, API clients).
- **Clean Code Naming**: Meaningful names — no abbreviations unless domain-standard (e.g., `id`, `db`).
- **Clean Code Structure**: Small functions (one function does one thing), no hidden side effects, and minimize comments (comment only "why", not "what").
- **Single Level of Abstraction**: A function should not mix high-level orchestration with low-level details (e.g., business logic + raw SQL in the same function).

## Decision Ladder
Before writing any code, stop at the first rung that holds:
1. Does this need to be built at all? (YAGNI)
2. Does it already exist in this codebase? Reuse the helper, utility, or pattern that's already here, don't re-write it.
3. Does the standard library already do this? Use it.
4. Does a native platform feature cover it? Use it.
5. Does an already-installed dependency solve it? Use it.
6. Can this be one line? Make it one line.
7. Only then: write the minimum code that works.

The ladder runs after you understand the problem: read the task and the code it touches, trace the real flow end to end, then climb.

## Never-Simplify Rules
You must never cut corners on:
- Understanding the problem: Trace the real flow before coding.
- Input validation at trust boundaries.
- Error handling that prevents data loss.
- Security and accessibility.
- Anything explicitly requested.
- No abstractions that weren't explicitly requested.
- No new dependency if it can be avoided.
- No boilerplate nobody asked for.
- Deletion over addition. Boring over clever. Fewest files possible.

## Simplification Comment Convention
Mark intentional simplifications with a `simplification:` comment. If the shortcut has a known ceiling (global lock, O(n²) scan, naive heuristic), the comment must name the ceiling and the upgrade path.
