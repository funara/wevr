---
name: summary-reporting
description: Format raw facts, outcomes, RCA findings, and validation results into formal execution and summary reports.
---

# Summary & Execution Reporting

## Core Principles

- **Fidelity to Sources**: Every claim in the report must trace back verbatim to a source output (e.g. Tracer findings, Patcher changes, Auditor verdict, Debugger diagnosis). No claim or interpretation may originate from the reporter.
- **Audience-First**: Tailor detail level and vocabulary for the target reader (technical lead, maintainer, end-user) if specified. Default to technical summary.
- **DRY for Docs**: Present findings exactly once; use cross-references instead of repeating data across sections.
- **Priority Ordering**: Order findings by severity (blocking failures/confirmed vulnerabilities first, then open risks/suspected vulnerabilities, then informational notes/bloat).
- **Stateless formatting**: Do not remember context across runs. Do not make inferences or assumptions.
- **Target Output Directory**: Write ONLY to the `docs/reports/` directory.

## Hard Rules
- Do NOT make inferences or assume facts. If input is missing or incomplete, write `TBD` or `N/A`.
- Do NOT add analysis, recommendations, or opinions beyond what was provided.
- Do NOT run bash commands.

## Standard Formats

### Format A: Compose Completion Report
```markdown
# Report: <subject>

## For: <audience>

## Outcome
<PASS/FAIL or completion status, as given>

## Details
<compressed from input, no added interpretation>
```

### Format B: Brooks-Lint Diagnosis Report (Debugger)
```markdown
# Diagnosis Report: <subject>

## For: <audience>

## Decay Risk Classification
<R1-R6 or T1-T6 risk(s) identified>

## Findings
### Finding 1: <decay risk> — <brief title>
**Symptom:** ...
**Source:** ...
**Consequence:** ...
**Remedy:** ...

### Finding 2: ...
```

### Format C: Security & Quality Audit Report (Analyze)
```markdown
# Security & Quality Audit Report: <Date/Subject>

## Executive Summary
- **Auditor Verdict:** <PASS/FAIL>
- **Confirmed Vulnerabilities:** <count>
- **Suspected Vulnerabilities:** <count>
- **Patches Applied:** <summary of Patcher changes, or "None">

## Vulnerability Findings
### Confirmed Vulnerabilities
<verbatim from Tracer confirmed_vulns — OWASP category, location, data flow>

### Suspected Vulnerabilities
<verbatim from Tracer suspected_vulns>

### Quality & Decay Risks
<verbatim from Tracer quality & decay risks>

## Patches Applied
<verbatim diff summary from Patcher, or "N/A — audit only mode">

## Auditor Verdict Detail
- **Verdict:** <PASS/FAIL>
- **Gap List:** <verbatim from Auditor — files/lines still vulnerable, or "None">
- **BLOAT List:** <verbatim from Auditor — over-engineered constructs, or "None">
```
