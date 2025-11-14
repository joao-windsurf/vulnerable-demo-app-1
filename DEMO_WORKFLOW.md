# Aikido + Devin Demo Workflow

This document describes the complete workflow for demonstrating how Aikido identifies security vulnerabilities and Devin fixes them automatically.

## Overview

This demo showcases an end-to-end security remediation workflow:
1. A repository contains multiple security vulnerabilities
2. Aikido Security Platform identifies these vulnerabilities
3. Devin AI agent connects to Aikido and automatically fixes the issues
4. A pull request is created with all security fixes

## Repository Setup

### Forked Repository
- **Original**: `Aikido-demo-apps/vulnerable-demo-app-1`
- **Fork**: `joao-windsurf/vulnerable-demo-app-1`
- **Branch with fixes**: `devin/1763140639-fix-security-vulnerabilities`

### Aikido MCP Server
The Aikido MCP (Model Context Protocol) server has been set up to enable Devin to interact with the Aikido Security API.

**Location**: `/home/ubuntu/repos/aikido-mcp-server`

**Setup**:
```bash
cd /home/ubuntu/repos/aikido-mcp-server
npm install
npm run build
```

**Configuration**:
The MCP server requires Aikido OAuth2 credentials:
- `AIKIDO_CLIENT_ID` - Your Aikido client ID
- `AIKIDO_CLIENT_SECRET` - Your Aikido client secret

Get credentials from: https://app.aikido.dev/settings/api

## Security Vulnerabilities Identified

The repository contained the following critical security issues:

### 1. SQL Injection (Critical)
**File**: `src/python/accounts.py`

**Issue**: String concatenation used to build SQL queries, allowing SQL injection attacks.

**Fix**: Implemented parameterized queries with input validation and whitelisting.

### 2. Command Injection (Critical)
**File**: `src/index.php`

**Issue**: Shell command execution using backticks with user-supplied input.

**Fix**: Removed shell execution, using PHP's built-in `filesize()` function with proper validation.

### 3. Hardcoded JWT Tokens (High)
**Files**: 
- `packages/app/src/index.js`
- `packages/app/src/api.js`
- `README.md`

**Issue**: JWT tokens hardcoded in source code.

**Fix**: Replaced with environment variables (`COMPANY_JWT_TOKEN`, `PERSONAL_JWT_TOKEN`).

### 4. Hardcoded API Keys (High)
**Files**:
- `src/services/pusher.js`
- `src/services/sentry.js`

**Issue**: API keys and DSNs hardcoded in source code.

**Fix**: Moved to environment variables (`PUSHER_KEY`, `SENTRY_DSN`).

### 5. Additional Improvements
- Fixed typo: `mehod` → `method` in fetch calls
- Added comprehensive security documentation

## Demo Steps

### Step 1: Show Vulnerabilities in Aikido Dashboard
1. Navigate to https://app.aikido.dev
2. Select the `vulnerable-demo-app-1` repository
3. Show the identified security issues in the Aikido dashboard

### Step 2: Provide Repository to Devin
Give Devin the repository URL:
```
https://github.com/joao-windsurf/vulnerable-demo-app-1
```

### Step 3: Devin Analyzes and Fixes Issues
Devin will:
1. Clone the repository
2. Analyze the codebase for security vulnerabilities
3. Create a new branch for fixes
4. Implement security fixes for all identified issues
5. Commit and push the changes
6. Create a pull request

### Step 4: Review the Pull Request
The PR includes:
- All security fixes implemented
- Detailed documentation of vulnerabilities
- Before/after code comparisons
- Testing recommendations

**PR URL**: https://github.com/joao-windsurf/vulnerable-demo-app-1/pull/new/devin/1763140639-fix-security-vulnerabilities

### Step 5: Verify Fixes in Aikido
After merging the PR:
1. Aikido will rescan the repository
2. Verify that all security issues are resolved
3. Show the improved security score

## Files Modified

1. `src/python/accounts.py` - SQL injection fix
2. `src/index.php` - Command injection fix
3. `packages/app/src/index.js` - JWT token fix
4. `packages/app/src/api.js` - JWT token fix
5. `src/services/pusher.js` - API key fix
6. `src/services/sentry.js` - DSN fix
7. `README.md` - Removed hardcoded token
8. `SECURITY_ISSUES.md` - Added (documentation)

## Environment Variables Required

After merging the fixes, the following environment variables need to be configured:

```bash
# JWT Tokens
COMPANY_JWT_TOKEN=your-company-jwt-token
PERSONAL_JWT_TOKEN=your-personal-jwt-token

# API Keys
PUSHER_KEY=your-pusher-key
SENTRY_DSN=your-sentry-dsn

# Database (already using env vars)
PGHOST=your-postgres-host
PGDATABASE=your-database-name
PGUSER=your-database-user
PGPASSWORD=your-database-password
```

## Key Takeaways

1. **Automated Security Remediation**: Devin can automatically fix security vulnerabilities identified by Aikido
2. **Comprehensive Fixes**: All critical and high-severity issues are addressed
3. **Best Practices**: Fixes follow security best practices (parameterized queries, environment variables, input validation)
4. **Documentation**: Complete documentation of issues and fixes for audit trails
5. **Seamless Integration**: Aikido MCP server enables direct integration between security scanning and automated remediation

## Next Steps

1. Merge the pull request
2. Configure environment variables in your deployment environment
3. Verify all tests pass
4. Monitor Aikido dashboard for any new issues
5. Set up automated scanning and remediation workflow

## Resources

- **Aikido Security**: https://app.aikido.dev
- **Aikido MCP Server**: https://github.com/bitterpanda63/aikido-mcp-server
- **Repository**: https://github.com/joao-windsurf/vulnerable-demo-app-1
- **Security Issues Documentation**: See `SECURITY_ISSUES.md` in the repository
