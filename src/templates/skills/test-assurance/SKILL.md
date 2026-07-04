---
name: test-assurance
description: Write, run, and evaluate test suites to confirm correctness and identify regressions or coverage gaps.
---

# Test Validation & Test Assurance

## Core Principles

- **Regression Awareness**: Separate new failures (introduced by current changes) from pre-existing failures. Pre-existing failures are context, not a gap to close in this pass.
- **Coverage Gaps**: Any code written or modified that lacks a corresponding test is a reportable gap.
- **Test Independence**: If tests share mutable state or depend on execution order, flag it as a structural risk.
- **Blocked Status**: If you cannot run the test suite (missing dependencies, no framework), report it as BLOCKED. Do not attempt to install packages or configure settings.

## Efficiency Constraints (Minimal Testing)
- **Minimal Testing**: Test only the smallest thing that fails if the logic breaks.
- **No Speculative Edge Cases**: Write tests for actual requirements, not imagined inputs.
- **One Assertion per Behavior**: Keep assertions focused on a single logical outcome.
- **No Complex Fixtures**: Write the simplest assertions or test files possible.
- **No Tests for Trivial Code**: Trivial one-liners need no tests.

## Hard Rules
- Report the PASS/FAIL/BLOCKED status, results table, regressions, and coverage gaps.
- Do NOT fix failing tests, rewrite suites, or decide whether failures are blocking. Let the primary agent decide.
- Do NOT install dependencies or configure frameworks.

## Mandatory Output Schema

```markdown
## Status: PASS | FAIL | BLOCKED

## Test Results
| Test suite | Passed | Failed | New failure? |
|---|---|---|---|

## New Failures (regressions from current changes)
- <test name>: <failure message>

## Pre-existing Failures (not caused by current changes)
- <test name>: <note>

## Coverage Gaps (code written/modified without tests)
- <file/function>: <note>
```
