import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password123');
    
    await page.click('button:has-text("Login")');
    
    await expect(page.locator('#statusText')).toContainText('Login successful', { timeout: 5000 });
  });

  test('should handle login with custom credentials', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    
    await page.click('button:has-text("Login")');
    
    await expect(page.locator('#statusText')).toContainText('Login successful', { timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password123');
    await page.click('button:has-text("Login")');
    
    await expect(page.locator('#statusText')).toContainText('Login successful', { timeout: 5000 });
    
    await page.click('button:has-text("Logout")');
    
    await expect(page.locator('#statusText')).toContainText('Logged out successfully', { timeout: 5000 });
  });

  test('should pre-fill username and password fields', async ({ page }) => {
    await expect(page.locator('#username')).toHaveValue('testuser');
    await expect(page.locator('#password')).toHaveValue('password123');
  });

  test('should store token in localStorage after login', async ({ page }) => {
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password123');
    await page.click('button:has-text("Login")');
    
    await expect(page.locator('#statusText')).toContainText('Login successful', { timeout: 5000 });
    
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
    expect(token).toContain('mock-jwt-token-');
  });

  test('should remove token from localStorage after logout', async ({ page }) => {
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password123');
    await page.click('button:has-text("Login")');
    
    await expect(page.locator('#statusText')).toContainText('Login successful', { timeout: 5000 });
    
    await page.click('button:has-text("Logout")');
    
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
