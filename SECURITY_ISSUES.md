# Security Issues Found in vulnerable-demo-app-1

This document lists all security vulnerabilities identified in this repository that need to be fixed.

## 1. SQL Injection Vulnerability

**File:** `src/python/accounts.py`
**Lines:** 16-25
**Severity:** Critical

The `find_accounts_advanced` function constructs SQL queries using string concatenation with user-supplied input, making it vulnerable to SQL injection attacks.

**Vulnerable Code:**
```python
query = (
    "SELECT id, email, created_at, role "
    "FROM " + table_name + " "
    "WHERE email LIKE '%" + email + "%' "
    "AND status = '" + status + "' "
    "AND role = '" + role + "' "
    "AND (email LIKE '%" + search + "%' OR CAST(id AS TEXT) LIKE '%" + search + "%') "
    "ORDER BY " + sort_by + " " + sort_dir + " "
    "LIMIT " + limit + " OFFSET " + offset + ";"
)
```

**Fix:** Use parameterized queries with psycopg2's parameter substitution to prevent SQL injection.

## 2. Command Injection Vulnerability

**File:** `src/index.php`
**Lines:** 6, 11
**Severity:** Critical

The PHP code uses backticks to execute shell commands with user-supplied input from `$POST["file"]`, allowing arbitrary command execution.

**Vulnerable Code:**
```php
$size = trim((string) `stat -c%s $filename`);
$filesize = getFilesize($POST["file"]);
```

**Fix:** Use PHP's built-in `filesize()` function properly or validate/sanitize input before using in shell commands. Also fix the typo: `$POST` should be `$_POST`.

## 3. Hardcoded JWT Tokens

**Files:** 
- `packages/app/src/index.js` (line 2)
- `packages/app/src/api.js` (line 3)
- `README.md` (line 4)

**Severity:** High

Multiple files contain hardcoded JWT tokens that should never be committed to source code.

**Vulnerable Code:**
```javascript
const companyJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
const personalJwtToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
```

**Fix:** Remove hardcoded tokens and use environment variables instead.

## 4. Hardcoded API Keys

**Files:**
- `src/services/pusher.js` (line 3)
- `src/services/sentry.js` (line 4)

**Severity:** High

API keys and DSNs are hardcoded in source files.

**Vulnerable Code:**
```javascript
new Pusher("edfjk5ffe67926a756t9", ...)
dsn: "https://examplePublicKey@o0.ingest.sentry.io/0"
```

**Fix:** Move API keys to environment variables.

## 5. Vulnerable Dependencies

**File:** `package.json`
**Severity:** Medium to High

The project uses multiple outdated dependencies with known security vulnerabilities:
- `express@4.16.3` (multiple CVEs)
- `node-sass@4.14.1` (deprecated, has vulnerabilities)
- `request@2.85.0` (deprecated, has vulnerabilities)
- Various Vue.js packages from 2018-2019

**Fix:** Update dependencies to their latest secure versions.

## Summary

Total Issues: 5 categories
- Critical: 2 (SQL Injection, Command Injection)
- High: 2 (Hardcoded JWT Tokens, Hardcoded API Keys)
- Medium-High: 1 (Vulnerable Dependencies)

All of these issues should be addressed to secure the application.
