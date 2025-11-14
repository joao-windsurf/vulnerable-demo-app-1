const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page with correct elements', async ({ page }) => {
    await expect(page.locator('#login-page h1')).toContainText('Task Manager Login');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#login-form button[type="submit"]')).toContainText('Login');
    await expect(page.locator('.help-text')).toContainText('Demo credentials');
  });

  test('should successfully login with admin credentials', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('#user-info')).toContainText('Welcome, admin (admin)');
    await expect(page.locator('.navbar')).toBeVisible();
    await expect(page.locator('h2')).toContainText('My Tasks');
  });

  test('should successfully login with user credentials', async ({ page }) => {
    await page.fill('#username', 'user');
    await page.fill('#password', 'user123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('#user-info')).toContainText('Welcome, user (user)');
    await expect(page.locator('.navbar')).toBeVisible();
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    await page.fill('#username', 'invalid');
    await page.fill('#password', 'wrong');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('#login-error')).toContainText('Invalid credentials');
    await expect(page.locator('#login-page')).toHaveClass(/active/);
  });

  test('should require username and password fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    const usernameInput = page.locator('#username');
    await expect(usernameInput).toHaveAttribute('required', '');
    
    const passwordInput = page.locator('#password');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('should logout successfully', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('#user-info')).toBeVisible();
    
    await page.click('#logout-btn');
    
    await expect(page.locator('#login-page')).toHaveClass(/active/);
    await expect(page.locator('#login-page h1')).toContainText('Task Manager Login');
  });
});
