import { test, expect } from '@playwright/test';

test.describe('API Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should fetch data successfully', async ({ page }) => {
    await page.click('button:has-text("Fetch Data")');
    
    await expect(page.locator('#statusText')).toContainText('Data fetched', { timeout: 5000 });
    await expect(page.locator('#statusText')).toContainText('Item 1', { timeout: 5000 });
  });

  test('should test Auth0 integration', async ({ page }) => {
    await page.click('button:has-text("Test Auth0")');
    
    await expect(page.locator('#statusText')).toContainText('Auth0 integration tested', { timeout: 5000 });
  });

  test('should test Sentry integration', async ({ page }) => {
    await page.click('button:has-text("Test Sentry")');
    
    await expect(page.locator('#statusText')).toContainText('Sentry test', { timeout: 5000 });
    await expect(page.locator('#statusText')).toContainText('Sentry integration is configured', { timeout: 5000 });
  });

  test('should test Pusher integration', async ({ page }) => {
    await page.click('button:has-text("Test Pusher")');
    
    await expect(page.locator('#statusText')).toContainText('Pusher test', { timeout: 5000 });
    await expect(page.locator('#statusText')).toContainText('Pusher integration is configured', { timeout: 5000 });
  });

  test('should display Sentry DSN in response', async ({ page }) => {
    await page.click('button:has-text("Test Sentry")');
    
    await expect(page.locator('#statusText')).toContainText('Sentry integration is configured', { timeout: 5000 });
    await expect(page.locator('#statusText')).toContainText('examplePublicKey', { timeout: 5000 });
  });

  test('should display Pusher key in response', async ({ page }) => {
    await page.click('button:has-text("Test Pusher")');
    
    await expect(page.locator('#statusText')).toContainText('Pusher integration is configured', { timeout: 5000 });
    await expect(page.locator('#statusText')).toContainText('edfjk5ffe67926a756t9', { timeout: 5000 });
  });
});
