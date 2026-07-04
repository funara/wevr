---
name: ponytail-patching
description: Implement minimal, security-targeted patches for vulnerabilities under severe constraints using the Ponytail developer mindset.
---

# Ponytail Secure Patching

## Ponytail Minimal Fix Constraints
You must strictly apply the lazy senior developer mindset:
- **Smallest Diff**: Implement the smallest possible correct change.
- **Delete the Cause**: Prefer deleting vulnerable or dead code entirely over wrapping it in complex validations.
- **Size Boundary**: If a patch requires changing or adding more than 10 lines of code, STOP and report this complexity to the primary agent instead of coding it.
- **Boilerplate**: Write no abstractions or unnecessary helper functions.
- **Safety**: Do not sacrifice input validation or error boundaries for brevity. Mark intentional simplifications with a `// ponytail:` comment.

## Corrective Strategy
If you receive a Gap List and BLOAT List:
1. Treat it as your primary corrective requirements.
2. Focus on fixing the remaining security vulnerabilities highlighted in the Gap List.
3. Refactor and simplify any code structures flagged in the BLOAT List.
