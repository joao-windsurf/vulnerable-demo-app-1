# Playwright Testing Demo

A comprehensive demonstration of browser-based testing with Playwright, showcasing automated testing capabilities for modern web applications.

## Overview

This demo includes:
- **Complete test infrastructure** with Playwright configuration
- **Demo task manager application** (Express + vanilla JavaScript)
- **38 comprehensive tests** covering multiple testing scenarios
- **Test maintenance guide** for evolving applications

## Project Structure

```
playwright-demo/
├── demo-app/              # Demo application to test
│   ├── server.js          # Express server
│   └── public/            # Frontend files
│       ├── index.html
│       ├── styles.css
│       └── app.js
├── tests/                 # Test suites
│   ├── auth.spec.js       # Authentication tests
│   ├── tasks.spec.js      # Task management tests
│   ├── api.spec.js        # API integration tests
│   ├── visual.spec.js     # Visual/UI tests
│   └── accessibility.spec.js  # Accessibility tests
├── playwright.config.js   # Playwright configuration
└── package.json
```

## Getting Started

### Installation

```bash
cd playwright-demo
npm install
npx playwright install chromium
```

### Running Tests

```bash
# Run all tests (headless)
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# View test report
npm run test:report
```

### Running the Demo App

```bash
# Start the server (runs on http://localhost:3000)
npm run serve
```

## Test Suites

### 1. Authentication Tests (`auth.spec.js`)
Tests login/logout functionality and credential validation.

**Key scenarios:**
- Login page display and elements
- Successful login with valid credentials
- Error handling for invalid credentials
- Required field validation
- Logout functionality

**Demo credentials:**
- Admin: `admin` / `admin123`
- User: `user` / `user123`

### 2. Task Management Tests (`tasks.spec.js`)
Tests CRUD operations for tasks and statistics updates.

**Key scenarios:**
- Display task statistics
- Show existing tasks
- Add new tasks
- Toggle task completion
- Delete tasks
- Update statistics dynamically

### 3. API Integration Tests (`api.spec.js`)
Tests API calls and response handling.

**Key scenarios:**
- Successful login API calls
- Failed login handling
- Fetch todos after login
- Create new todos via API
- Update todos via API
- Delete todos via API
- API mocking and interception

### 4. Visual/UI Tests (`visual.spec.js`)
Tests styling, layout, and visual elements.

**Key scenarios:**
- Page title verification
- Styling validation
- Responsive layouts
- Hover effects
- Completed task styling
- Error message colors
- Input focus styling

### 5. Accessibility Tests (`accessibility.spec.js`)
Tests keyboard navigation and accessibility features.

**Key scenarios:**
- Form labels
- Keyboard navigation
- Button types
- Input placeholders
- Password field types
- Required field indicators
- Descriptive button text

## Maintaining Tests as Your App Evolves

### Common Scenarios and Solutions

#### 1. UI Changes (Selectors Break)

**Problem:** You changed a button ID from `#submit-btn` to `#login-submit`.

**Solution:**
```javascript
// Before
await page.click('#submit-btn');

// After
await page.click('#login-submit');
```

**Best Practice:** Use data-testid attributes for stability:
```html
<button data-testid="login-submit">Login</button>
```
```javascript
await page.click('[data-testid="login-submit"]');
```

#### 2. New Features Added

**Problem:** You added a "Remember Me" checkbox to login.

**Solution:** Add new test cases:
```javascript
test('should remember user when checkbox is checked', async ({ page }) => {
  await page.goto('/');
  await page.check('#remember-me');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin123');
  await page.click('button[type="submit"]');
  
  // Verify remember me functionality
  await expect(page.locator('#remember-me')).toBeChecked();
});
```

#### 3. API Changes

**Problem:** API endpoint changed from `/api/todos` to `/api/v2/tasks`.

**Solution:** Update API interception patterns:
```javascript
// Before
await page.waitForResponse(response => 
  response.url().includes('/api/todos')
);

// After
await page.waitForResponse(response => 
  response.url().includes('/api/v2/tasks')
);
```

#### 4. Timing Issues

**Problem:** Tests fail intermittently due to slow API responses.

**Solution:** Use proper waiting strategies:
```javascript
// Bad: Fixed timeouts
await page.waitForTimeout(1000);

// Good: Wait for specific conditions
await expect(page.locator('#user-info')).toBeVisible();
await page.waitForResponse(response => 
  response.url().includes('/api/todos')
);
```

#### 5. Test Data Isolation

**Problem:** Tests fail when run in parallel due to shared state.

**Solution:** Use unique identifiers:
```javascript
// Good: Unique task names
const taskTitle = `Test Task ${Date.now()}`;
await page.fill('#task-title', taskTitle);
```

### Debugging Failed Tests

#### 1. View Screenshots and Videos

Failed tests automatically capture screenshots and videos:
```
test-results/
├── test-name-chromium/
│   ├── test-failed-1.png
│   └── video.webm
```

#### 2. Run in Debug Mode

```bash
npm run test:debug
```

This opens Playwright Inspector for step-by-step debugging.

#### 3. Run in Headed Mode

```bash
npm run test:headed
```

Watch tests execute in a real browser.

#### 4. Use UI Mode

```bash
npm run test:ui
```

Interactive mode with time-travel debugging.

### Best Practices

#### 1. Use Descriptive Test Names

```javascript
// Good
test('should display error message when login fails with invalid credentials', async ({ page }) => {
  // ...
});

// Bad
test('login test', async ({ page }) => {
  // ...
});
```

#### 2. Keep Tests Independent

Each test should work in isolation:
```javascript
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Reset state for each test
});
```

#### 3. Use Page Object Model for Complex Apps

```javascript
// pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

#### 4. Group Related Tests

```javascript
test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // Common setup for task tests
  });

  test('should add task', async ({ page }) => { /* ... */ });
  test('should delete task', async ({ page }) => { /* ... */ });
});
```

#### 5. Use Fixtures for Reusable Setup

```javascript
// fixtures.js
const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await use(page);
  },
});
```

## Configuration

### Playwright Config (`playwright.config.js`)

Key settings:
- **testDir**: `./tests` - Location of test files
- **fullyParallel**: `true` - Run tests in parallel
- **retries**: `2` in CI, `0` locally
- **reporter**: HTML, list, and JSON reports
- **baseURL**: `http://localhost:3000`
- **webServer**: Auto-starts demo app before tests

### Customizing Configuration

```javascript
// Add more browsers
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
],

// Add mobile testing
projects: [
  { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
],
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: |
          cd playwright-demo
          npm ci
      - name: Install Playwright Browsers
        run: |
          cd playwright-demo
          npx playwright install --with-deps chromium
      - name: Run Playwright tests
        run: |
          cd playwright-demo
          npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-demo/playwright-report/
```

## Troubleshooting

### Tests Fail Locally But Pass in CI

- Check Node.js versions match
- Ensure all dependencies are installed
- Clear `node_modules` and reinstall

### Flaky Tests

- Add proper wait conditions
- Increase timeout for slow operations
- Use `test.describe.serial()` for dependent tests

### Browser Not Found

```bash
npx playwright install chromium
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Guide](https://playwright.dev/docs/debug)

## Demo Application Details

### API Endpoints

- `POST /api/login` - Authenticate user
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `GET /api/users` - Get all users

### Tech Stack

- **Backend**: Express.js
- **Frontend**: Vanilla JavaScript
- **Testing**: Playwright
- **Styling**: Custom CSS

## Contributing

When adding new tests:
1. Follow existing test structure
2. Use descriptive test names
3. Add comments for complex logic
4. Ensure tests are independent
5. Update this README if needed

## License

MIT
