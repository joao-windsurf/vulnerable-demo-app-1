import { test, expect } from '@playwright/test';

test.describe('Integration Tests', () => {
  test('should handle complete user flow: login, fetch data, logout', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('#statusText')).toContainText('Ready');
    
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password123');
    await page.click('button:has-text("Login")');
    await expect(page.locator('#statusText')).toContainText('Login successful', { timeout: 5000 });
    
    await page.click('button:has-text("Fetch Data")');
    await expect(page.locator('#statusText')).toContainText('Data fetched', { timeout: 5000 });
    
    await page.click('button:has-text("Logout")');
    await expect(page.locator('#statusText')).toContainText('Logged out successfully', { timeout: 5000 });
  });

  test('should test all third-party integrations', async ({ page }) => {
    await page.goto('/');
    
    await page.click('button:has-text("Test Auth0")');
    await expect(page.locator('#statusText')).toContainText('Auth0 integration tested', { timeout: 5000 });
    
    await page.click('button:has-text("Test Sentry")');
    await expect(page.locator('#statusText')).toContainText('Sentry integration is configured', { timeout: 5000 });
    
    await page.click('button:has-text("Test Pusher")');
    await expect(page.locator('#statusText')).toContainText('Pusher integration is configured', { timeout: 5000 });
  });

  test('should handle multiple API calls in sequence', async ({ page }) => {
    await page.goto('/');
    
    await page.click('button:has-text("Fetch Data")');
    await expect(page.locator('#statusText')).toContainText('Data fetched', { timeout: 5000 });
    
    await page.click('button:has-text("Test Sentry")');
    await expect(page.locator('#statusText')).toContainText('Sentry test', { timeout: 5000 });
    
    await page.click('button:has-text("Test Pusher")');
    await expect(page.locator('#statusText')).toContainText('Pusher test', { timeout: 5000 });
  });

  test('should maintain state across page interactions', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("Login")');
    await expect(page.locator('#statusText')).toContainText('Login successful', { timeout: 5000 });
    
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
    
    await page.click('button:has-text("Fetch Data")');
    await expect(page.locator('#statusText')).toContainText('Data fetched', { timeout: 5000 });
    
    const tokenAfterFetch = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenAfterFetch).toBe(token);
  });

  test('should handle rapid button clicks gracefully', async ({ page }) => {
    await page.goto('/');
    
    await page.click('button:has-text("Fetch Data")');
    await page.click('button:has-text("Test Auth0")');
    await page.click('button:has-text("Test Sentry")');
    
    await page.waitForTimeout(2000);
    
    const statusText = await page.locator('#statusText').textContent();
    expect(statusText).toBeTruthy();
  });
});
