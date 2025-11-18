import { test, expect } from '@playwright/test';

test.describe('Security Features', () => {
  test('should handle Auth0 mock authentication', async ({ page }) => {
    await page.goto('/');
    
    await page.route('**/api/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          token: 'mock-auth0-token',
          user: { username: 'testuser', role: 'user' }
        })
      });
    });
    
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password123');
    await page.click('button:has-text("Login")');
    
    await expect(page.locator('#statusText')).toContainText('Login successful', { timeout: 5000 });
  });

  test('should handle Sentry error tracking mock', async ({ page }) => {
    await page.goto('/');
    
    let sentryRequestMade = false;
    await page.route('**/api/sentry-test', async (route) => {
      sentryRequestMade = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Sentry integration is configured',
          dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0'
        })
      });
    });
    
    await page.click('button:has-text("Test Sentry")');
    await expect(page.locator('#statusText')).toContainText('Sentry test', { timeout: 5000 });
    expect(sentryRequestMade).toBe(true);
  });

  test('should handle Pusher real-time features mock', async ({ page }) => {
    await page.goto('/');
    
    let pusherRequestMade = false;
    await page.route('**/api/pusher-test', async (route) => {
      pusherRequestMade = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Pusher integration is configured',
          key: 'edfjk5ffe67926a756t9'
        })
      });
    });
    
    await page.click('button:has-text("Test Pusher")');
    await expect(page.locator('#statusText')).toContainText('Pusher test', { timeout: 5000 });
    expect(pusherRequestMade).toBe(true);
  });

  test('should verify SQL injection vulnerability endpoint exists', async ({ request }) => {
    const response = await request.get('/api/accounts?search=test');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.accounts).toBeDefined();
  });

  test('should handle authentication token storage securely', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password123');
    await page.click('button:has-text("Login")');
    
    await expect(page.locator('#statusText')).toContainText('Login successful', { timeout: 5000 });
    
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
    expect(token).toMatch(/^mock-jwt-token-\d+$/);
  });

  test('should not expose sensitive data in error responses', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: {
        username: '',
        password: ''
      }
    });
    
    const data = await response.json();
    expect(data.message).not.toContain('database');
    expect(data.message).not.toContain('sql');
    expect(data.message).not.toContain('stack trace');
    expect(data.message).not.toContain('internal error');
  });
});
