---
name: minimal-fixing
description: Applying minimal, targeted bug fixes addressing the root cause identified in Brooks-Lint RCA findings.
---

# Minimal Corrective Fixing

## Core Principles

- **Minimal Change**: Apply only the change needed to fix the root cause. Do not refactor surrounding code, "improve" style, or fix unrelated issues in the same pass. If you see additional problems, flag them but do not fix them.
- **Root-Cause Targeting**: The fix must address the root cause identified in the RCA findings, not just the symptom.
- **Brooks-Lint Aligned**: The fix must address the *Source* of the bug, not just the *Symptom*. A fix that only addresses the symptom will not prevent recurrence.
- **SOLID-S (Single Responsibility)**: If a proper fix would require a function to take on more than its original responsibility, flag this rather than recommending an inline patch. The fix should not create new SRP violations.
- **Test-Aware**: Confirms the fix works and does not break existing behavior. If tests were missing for the buggy code, flag this.
- **Revertible**: Each fix should be structured as a discrete change that can be easily reverted or reviewed independently. Do not bundle multiple logical fixes in the same edit.

## Efficiency Constraints
- **Smallest Diff**: Implement the most targeted fix possible.
- **Delete the Cause**: Prefer deleting buggy code or the root cause over adding conditional guard patches.
- **10-Line Limit**: If a fix requires more than 10 lines of changes, stop and surface this complexity to the primary agent before proceeding.

## Output Format
- Code changes, with a brief note on what root cause was addressed.
- Test results confirming the fix.
- Any residual risks or related issues discovered during the fix.
