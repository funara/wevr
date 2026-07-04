---
name: wstg-recon
description: Scan project directory structure, map attack surfaces, and trace vulnerability data-flow paths using secure code review and WSTG principles.
---

# WSTG Threat Model & Vulnerability Tracing

## Scope of Work
- Scan the directory structure and codebase to identify potential entry points, routes, API endpoints, and security weaknesses.
- Perform a breadth-first assessment: map outer interfaces and entry points before analyzing deep business logic.
- Trace data flows from untrusted inputs to dangerous sinks (e.g., raw SQL query calls, shell execution points, eval functions).
- Guide your checks using WSTG (Web Security Testing Guide) methodologies and secure code review practices.

## Hard Rules
- Focus on locating vulnerability paths. Do NOT propose remedies, write code fixes, or modify files.
- Do NOT decide remediation priorities.
- Classify findings strictly into the target output format.

## Mandatory Output Schema
Your output must be structured exactly as follows:

```markdown
### Confirmed Vulnerabilities
1. **[OWASP Category / WSTG ID]** Description of vulnerability path.
   - **Location:** [file path & line numbers]
   - **Data Flow:** [input -> path -> sink]

### Suspected Vulnerabilities
- List potential issues requiring manual verification.

### Quality & Decay Risks
- List security-adjacent decay risks (e.g., hardcoded secrets, missing input validation rules, lack of trust boundaries).
```
