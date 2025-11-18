import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Aikido Demo App/);
    await expect(page.locator('h1')).toContainText('Aikido Demo Application');
  });

  test('should display welcome message', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('p')).toContainText('Welcome to the Aikido security demonstration application');
  });

  test('should have authentication section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h2').filter({ hasText: 'Authentication' })).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('should have API features section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h2').filter({ hasText: 'API Features' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fetch Data' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Test Auth0' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Test Sentry' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Test Pusher' })).toBeVisible();
  });

  test('should display status section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#status')).toBeVisible();
    await expect(page.locator('#statusText')).toContainText('Ready');
  });
});
