---
name: security-remediation
description: Standard code patterns and recipes for safely fixing common OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, SSRF, broken auth) without introducing bloat.
---

# Secure Remediation Patterns

## Vulnerability Remediation Recipes

### 1. SQL Injection (SQLi)
- **Remedy**: Always parameterize query bindings. Never concatenate or interpolate user input directly into query strings.
- **Example (Bad)**:
  `db.execute("SELECT * FROM users WHERE name = '" + input + "'")`
- **Example (Good)**:
  `db.execute("SELECT * FROM users WHERE name = ?", [input])`

### 2. Cross-Site Scripting (XSS)
- **Remedy**: Contextually encode all dynamic data output to HTML. Prioritize framework default binding mechanisms (e.g. JSX expression, textContent) over direct DOM injection.
- **Example (Bad)**:
  `element.innerHTML = userInput`
- **Example (Good)**:
  `element.textContent = userInput`

### 3. Server-Side Request Forgery (SSRF)
- **Remedy**: Implement a strict IP/Domain allow-list for external fetches. Block resolve paths pointing to internal private metadata or loopback addresses.
- **Forbidden Ranges**: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.169.254`.

### 4. Broken Object Level Authorization (BOLA / IDOR)
- **Remedy**: Check that the authenticated session user actually owns the resource identifier requested before executing read, update, or delete commands.
- **Example (Bad)**:
  `db.getInvoice(req.params.id)`
- **Example (Good)**:
  `invoice = db.getInvoice(req.params.id); if (invoice.userId !== req.session.userId) throw new UnauthorizedError();`

## General Safety Checklist
- Never log raw passwords, access tokens, or sensitive API keys.
- Ensure all error messages returned to the API client are generic and do not expose internal stack traces or database configurations.
