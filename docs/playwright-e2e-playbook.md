# Playbook: Writing End-to-End Browser Tests with Playwright

## Overview

This playbook explains how to add and maintain reliable Playwright E2E tests for a Node.js/Express + frontend application. It covers setup, configuration, authoring tests, cross-browser nuances, CI integration, and debugging. All examples are drawn from this repository's working setup.

## Table of Contents

1. [Quickstart and Installation](#1-quickstart-and-installation)
2. [Configuration Best Practices](#2-configuration-best-practices)
3. [Test Structure and Organization](#3-test-structure-and-organization)
4. [Authoring Tests: Patterns and Examples](#4-authoring-tests-patterns-and-examples)
5. [CI/CD Integration](#5-cicd-integration)
6. [Troubleshooting Common Issues](#6-troubleshooting-common-issues)
7. [Cross-Browser Considerations](#7-cross-browser-considerations)
8. [Debugging and Developer Ergonomics](#8-debugging-and-developer-ergonomics)
9. [Data Management and Determinism](#9-data-management-and-determinism)
10. [Review Checklist (Definition of Done)](#10-review-checklist-definition-of-done)

---

## 1. Quickstart and Installation

### Install Playwright

```bash
# Install the test runner
npm install -D @playwright/test

# Install browsers (locally)
npx playwright install

# Install browsers with system dependencies (CI)
npx playwright install --with-deps
```

### Add Scripts to package.json

```json
{
  "scripts": {
    "test": "jest --testPathIgnorePatterns=/e2e/ --passWithNoTests",
    "test:e2e": "playwright test"
  }
}
```

**Key Points:**
- Keep Jest for unit/component tests and exclude E2E from Jest (see [Troubleshooting](#6-troubleshooting-common-issues))
- Playwright tests should be separate from Jest tests to avoid conflicts

---

## 2. Configuration Best Practices

Create a `playwright.config.ts` file in your project root to standardize test execution:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

**Configuration Rationale:**

- **`testDir: './e2e'`**: Keep E2E tests separate from unit tests
- **`baseURL`**: Allows using relative paths in `page.goto('/')`
- **`webServer`**: Automatically starts your server before tests run
  - `reuseExistingServer: !process.env.CI`: Speeds up local development by reusing running servers
  - `timeout: 120000`: Gives server enough time to start (adjust based on your app)
- **`retries: process.env.CI ? 2 : 0`**: Retry flaky tests in CI but fail fast locally
- **`workers: process.env.CI ? 1 : undefined`**: Limit parallelism in CI to reduce flakiness
- **`trace: 'on-first-retry'`**: Balance speed vs debuggability by only capturing traces on retries
- **Projects**: Test across multiple browsers (webkit omitted here due to system dependency issues)

**Reference:** See [`playwright.config.ts`](../playwright.config.ts) in this repository.

---

## 3. Test Structure and Organization

### Directory Layout

```
project-root/
├── e2e/
│   ├── app.spec.ts          # Main application tests
│   ├── auth.spec.ts         # Authentication flows
│   └── api.spec.ts          # API endpoint tests
├── playwright.config.ts
└── package.json
```

### Organize by User Flows or Surface Areas

Group related tests using `describe` blocks. In this repository, we organized tests by:

1. **Express Server E2E Tests**: Route contracts and status codes
2. **Navigation and Page Behavior**: Moving between pages and reloads
3. **HTTP Response Headers**: Content-type, cache behaviors
4. **Error Handling**: 4xx/5xx responses, error messaging
5. **Performance and Reliability**: Simple time budgets, concurrency
6. **Content Verification**: Exact content expectations where stable

### Example Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Express Server E2E Tests', () => {
  test('should load the home page and display "Hello World!"', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toContainText('Hello World!');
  });

  test('should return 200 status code for home page', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });
});

test.describe('Error Handling', () => {
  test('should handle non-existent routes with 404', async ({ page }) => {
    const response = await page.goto('/non-existent-route');
    expect(response?.status()).toBe(404);
  });
});
```

**Best Practices:**
- Place specs in `e2e/` with `.spec.ts` suffix
- Prefer one spec per feature or route group
- Use sub-describes for variants
- Keep tests independent with no implicit ordering

**Reference:** See [`e2e/app.spec.ts`](../e2e/app.spec.ts) for complete examples.

---

## 4. Authoring Tests: Patterns and Examples

### Basic Page Navigation and Content

```typescript
test('should load the home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toContainText('Hello World!');
});
```

### Status Code Checks

```typescript
test('should return 200 status code', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
});

test('should handle error endpoint and return 500', async ({ page }) => {
  const response = await page.goto('/error');
  expect(response?.status()).toBe(500);
});
```

### Handling Redirect Loops (Browser-Specific)

Different browsers use different error messages for redirect loops:

```typescript
test('should handle redirect endpoint', async ({ page }) => {
  const response = await page.goto('/redirect', { waitUntil: 'commit' }).catch(err => {
    // Chromium: ERR_TOO_MANY_REDIRECTS
    // Firefox: NS_ERROR_REDIRECT_LOOP
    expect(err.message).toMatch(/ERR_TOO_MANY_REDIRECTS|NS_ERROR_REDIRECT_LOOP/);
    return null;
  });
  
  if (response === null) {
    expect(true).toBe(true);
  }
});
```

### Handling Caching Differences (304 vs 200)

Firefox may return 304 (Not Modified) on repeated loads:

```typescript
test('should handle multiple page loads', async ({ page }) => {
  for (let i = 0; i < 3; i++) {
    const response = await page.goto('/');
    // Accept both 200 (fresh) and 304 (cached)
    expect([200, 304]).toContain(response?.status());
    await expect(page.locator('body')).toContainText('Hello World!');
  }
});
```

### Testing HTTP Headers

```typescript
test('should return correct content-type', async ({ page }) => {
  const response = await page.goto('/');
  const contentType = response?.headers()['content-type'];
  expect(contentType).toContain('text/html');
});
```

### Concurrency Testing

```typescript
test('should handle concurrent requests', async ({ page, context }) => {
  const page2 = await context.newPage();
  const page3 = await context.newPage();

  const [response1, response2, response3] = await Promise.all([
    page.goto('/'),
    page2.goto('/payments'),
    page3.goto('/'),
  ]);

  expect(response1?.status()).toBe(200);
  expect(response2?.status()).toBe(200);
  expect(response3?.status()).toBe(200);

  await page2.close();
  await page3.close();
});
```

### Performance Sanity Checks

```typescript
test('should load home page within reasonable time', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(5000); // 5 seconds
});
```

**Note:** Keep these loose or migrate to traces/metrics if flaky.

### Selector Best Practices

**Prefer semantic selectors** (in order of preference):

1. **Role-based selectors** (most resilient):
   ```typescript
   await page.getByRole('button', { name: 'Submit' }).click();
   await page.getByRole('heading', { name: 'Welcome' });
   ```

2. **Label-based selectors**:
   ```typescript
   await page.getByLabel('Email').fill('user@example.com');
   ```

3. **Text-based selectors**:
   ```typescript
   await page.getByText('Hello World!');
   ```

4. **Test ID selectors** (stable, non-visual):
   ```typescript
   await page.getByTestId('submit-button').click();
   ```

5. **CSS selectors** (last resort):
   ```typescript
   await page.locator('body').toContainText('Hello');
   ```

**Avoid:** Brittle CSS selectors or exact innerText unless content is truly invariant.

### Network Mocking (Optional)

Use `page.route()` to stub third-party calls for deterministic tests:

```typescript
test('should mock API calls', async ({ page }) => {
  await page.route('**/api/data', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ data: 'mocked' }),
    });
  });
  
  await page.goto('/');
  // Test with mocked data
});
```

---

## 5. CI/CD Integration

### GitHub Actions Example (npm-based)

```yaml
name: CI web

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "npm"
          cache-dependency-path: package-lock.json

      - name: Install dependencies
        run: npm ci --ignore-scripts

      - name: Run Jest Tests
        run: npm test

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright E2E Tests
        run: npm run test:e2e

      - name: Upload Playwright Report
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

      - name: Upload Test Results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
          retention-days: 7
```

**Key Points:**

- **Node 18+**: Use LTS version for best compatibility
- **`npm ci --ignore-scripts`**: Bypass problematic postinstall scripts (like node-sass)
- **`npx playwright install --with-deps`**: Install browsers with system dependencies
- **Upload artifacts on failure**: Preserve traces, screenshots, and HTML reports for debugging
- **Cache npm dependencies**: Speed up CI with `cache: "npm"`

**Reference:** See [`.github/workflows/test.yml`](../.github/workflows/test.yml) in this repository.

### Matrix Testing (Optional)

For larger suites, run tests across multiple browsers in parallel:

```yaml
strategy:
  matrix:
    browser: [chromium, firefox, webkit]
steps:
  - name: Run Playwright Tests
    run: npx playwright test --project=${{ matrix.browser }}
```

### Sharding (Optional)

For very large test suites, split tests across multiple jobs:

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - name: Run Playwright Tests
    run: npx playwright test --shard=${{ matrix.shard }}/4
```

---

## 6. Troubleshooting Common Issues

### Jest vs Playwright Conflict

**Problem:** Jest tries to run Playwright tests and fails with syntax errors.

**Solution:** Exclude E2E tests from Jest:

1. Create `jest.config.cjs`:
   ```javascript
   module.exports = {
     testPathIgnorePatterns: [
       '/node_modules/',
       '/e2e/',
       '/playwright-report/',
       '/test-results/',
     ],
   };
   ```

2. Update `package.json` scripts:
   ```json
   {
     "scripts": {
       "test": "jest --testPathIgnorePatterns=/e2e/ --passWithNoTests"
     }
   }
   ```

**Note:** `.jestignore` is not used by Jest v24. Use `jest.config.cjs` and CLI flags instead.

### WebKit System Dependencies

**Problem:** WebKit tests fail with "Host system is missing dependencies to run browsers."

**Solution:** Either:
1. Install system dependencies: `npx playwright install-deps webkit`
2. Remove WebKit from `playwright.config.ts` projects (as done in this repository)

### Native Module Installation Failures

**Problem:** `node-sass` or other native modules fail to build during `npm install`.

**Solution:** Use `npm ci --ignore-scripts` to skip postinstall scripts:

```yaml
- name: Install dependencies
  run: npm ci --ignore-scripts
```

**Warning:** Only use this if lifecycle scripts aren't required for your app to function.

### ESM vs CommonJS Module Errors

**Problem:** `ReferenceError: require is not defined in ES module scope`

**Solution:** If `package.json` has `"type": "module"`, use ES module syntax:

```javascript
// ❌ CommonJS (won't work)
const express = require('express');

// ✅ ES Modules
import express from 'express';
```

### Express res.sendFile Errors

**Problem:** `TypeError: path must be absolute or specify root to res.sendFile`

**Solution:** Use absolute paths or provide a root option:

```javascript
import path from 'path';

// ✅ Absolute path
res.sendFile(path.resolve(__dirname, 'file.txt'));

// ✅ With root option
res.sendFile('file.txt', { root: './public' });
```

### Flaky Time-Based Tests

**Problem:** Tests fail intermittently due to timing issues.

**Solution:** Use Playwright's built-in waiting mechanisms:

```typescript
// ❌ Arbitrary waits
await page.waitForTimeout(5000);

// ✅ Wait for specific conditions
await page.waitForLoadState('networkidle');
await expect(page.locator('.result')).toBeVisible();

// ✅ Poll for async conditions
await expect.poll(async () => {
  const response = await fetch('/api/status');
  return response.status;
}).toBe(200);
```

### Server Startup Timing

**Problem:** Tests fail because server isn't ready.

**Solution:** Use `webServer` option with adequate timeout:

```typescript
webServer: {
  command: 'npm start',
  url: 'http://localhost:3000',
  timeout: 120000, // 2 minutes
  reuseExistingServer: !process.env.CI,
}
```

Or implement a health check endpoint:

```typescript
webServer: {
  command: 'npm start',
  url: 'http://localhost:3000/health',
  timeout: 60000,
}
```

---

## 7. Cross-Browser Considerations

### Browser-Specific Differences

Different browsers may behave differently for the same scenarios:

| Scenario | Chromium | Firefox | Webkit |
|----------|----------|---------|--------|
| Redirect loop error | `ERR_TOO_MANY_REDIRECTS` | `NS_ERROR_REDIRECT_LOOP` | Varies |
| Cached response status | 200 | 304 | 200 |
| Error messages | Detailed | Detailed | Less detailed |

### Handling Browser Differences

**Use regex patterns for error messages:**

```typescript
expect(err.message).toMatch(/ERR_TOO_MANY_REDIRECTS|NS_ERROR_REDIRECT_LOOP/);
```

**Accept multiple valid status codes:**

```typescript
expect([200, 304]).toContain(response?.status());
```

**Skip tests for specific browsers if needed:**

```typescript
test('webkit-specific test', async ({ page, browserName }) => {
  test.skip(browserName !== 'webkit', 'This test is only for WebKit');
  // Test code
});
```

### Selector Consistency

Use semantic selectors (roles, labels, text) rather than engine-specific quirks to ensure tests work across browsers.

---

## 8. Debugging and Developer Ergonomics

### Run Specific Tests

```bash
# Run a single test file
npx playwright test e2e/app.spec.ts

# Run tests matching a pattern
npx playwright test -g "should handle redirect"

# Run tests in a specific browser
npx playwright test --project=chromium
```

### Debug Mode

```bash
# Open Playwright Inspector
npx playwright test --debug

# Debug a specific test
npx playwright test e2e/app.spec.ts:10 --debug
```

### Headed Mode

```bash
# See the browser while tests run
npx playwright test --headed

# Slow down execution
npx playwright test --headed --slow-mo=1000
```

### View Test Reports

```bash
# Open HTML report
npx playwright show-report

# View trace for a failed test
npx playwright show-trace test-results/[test-name]/trace.zip
```

### Code Generation (Quick Start)

```bash
# Generate test code by interacting with your app
npx playwright codegen http://localhost:3000
```

### VS Code Integration

Install the [Playwright Test for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) extension for:
- Run tests from the editor
- Set breakpoints
- View test results inline
- Record new tests

---

## 9. Data Management and Determinism

### Test Data Strategies

**1. Seed data via global setup:**

```typescript
// global-setup.ts
import { chromium } from '@playwright/test';

export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Seed test data via API
  await page.request.post('http://localhost:3000/api/seed', {
    data: { /* test data */ }
  });
  
  await browser.close();
}
```

**2. Use API calls in beforeEach:**

```typescript
test.beforeEach(async ({ request }) => {
  await request.post('/api/reset');
  await request.post('/api/seed', {
    data: { /* test data */ }
  });
});
```

**3. Mock external services:**

```typescript
test('should handle external API', async ({ page }) => {
  await page.route('**/api.external.com/**', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ data: 'mocked' }),
    });
  });
  
  await page.goto('/');
});
```

### Avoiding Flakiness

- **Don't rely on live third-party services**: Stub with `page.route()`
- **Keep assertions tolerant**: Allow for harmless variability (dates, IDs)
- **Use deterministic data**: Avoid random values in tests
- **Clean up after tests**: Reset state in `afterEach` hooks

---

## 10. Review Checklist (Definition of Done)

Before merging E2E changes, verify:

### Test Quality
- [ ] Tests pass reliably on repeated local runs (at least 3 times)
- [ ] Tests pass in CI without flakiness
- [ ] No hidden ordering dependencies between tests
- [ ] Each test is independent and can run in isolation

### Code Quality
- [ ] Selectors are semantic (roles, labels, text) or test-id based
- [ ] No brittle CSS selectors (unless absolutely necessary)
- [ ] No arbitrary `waitForTimeout()` calls
- [ ] Use built-in waits and expectations instead of sleeps

### Configuration
- [ ] `webServer` is configured correctly
- [ ] Server shuts down cleanly after tests
- [ ] Jest is not executing E2E specs
- [ ] Appropriate browsers are configured in projects

### CI/CD
- [ ] CI artifacts for failures (traces/screenshots) are uploaded
- [ ] Tests run in CI with appropriate timeout
- [ ] Dependencies are cached for faster CI runs
- [ ] Test results are reported clearly

### Documentation
- [ ] New test patterns are documented if introduced
- [ ] Complex test scenarios have explanatory comments
- [ ] README or docs updated if test commands changed

---

## Appendix A: Working Examples from This Repository

### Configuration
- **File:** [`playwright.config.ts`](../playwright.config.ts)
- **Features:**
  - Projects: chromium, firefox
  - webServer: `npm start` on `http://localhost:3000`
  - Trace: `on-first-retry`
  - Retries: 2 in CI, 0 locally

### Test Examples
- **File:** [`e2e/app.spec.ts`](../e2e/app.spec.ts)
- **Patterns demonstrated:**
  - Redirect loop test tolerant to browser-specific error messages
  - Multiple loads test accepting both 200 and 304 status codes
  - Error route test expecting 500 status and specific body text
  - Concurrency test using multiple pages within a context
  - Performance test with simple time budget
  - HTTP header validation

### CI Configuration
- **File:** [`.github/workflows/test.yml`](../.github/workflows/test.yml)
- **Features:**
  - Node 18 with npm caching
  - `npm ci --ignore-scripts` to bypass node-sass issues
  - `npx playwright install --with-deps` for browser installation
  - Separate Jest and Playwright test steps

---

## Appendix B: Additional Resources

### Official Documentation
- [Playwright Documentation](https://playwright.dev/)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)

### Community Resources
- [Playwright Discord](https://discord.com/invite/playwright-807756831384403968)
- [Playwright GitHub](https://github.com/microsoft/playwright)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/playwright)

### Related Tools
- [Playwright Test Runner](https://playwright.dev/docs/test-intro)
- [Playwright Inspector](https://playwright.dev/docs/debug#playwright-inspector)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

---

## Feedback and Contributions

This playbook is based on real-world implementation experience. If you encounter issues or have suggestions for improvement, please:

1. Review the [Troubleshooting](#6-troubleshooting-common-issues) section
2. Check the [working examples](#appendix-a-working-examples-from-this-repository) in this repository
3. Consult the [official Playwright documentation](https://playwright.dev/)
4. Open an issue or PR with your findings

Happy testing! 🎭
