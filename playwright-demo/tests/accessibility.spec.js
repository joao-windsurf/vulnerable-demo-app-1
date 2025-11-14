const { test, expect } = require('@playwright/test');

test.describe('Accessibility Tests', () => {
  test('should have proper form labels', async ({ page }) => {
    await page.goto('/');
    
    const usernameLabel = page.locator('label[for="username"]');
    await expect(usernameLabel).toBeVisible();
    await expect(usernameLabel).toContainText('Username');
    
    const passwordLabel = page.locator('label[for="password"]');
    await expect(passwordLabel).toBeVisible();
    await expect(passwordLabel).toContainText('Password');
  });

  test('should support keyboard navigation on login form', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#username')).toBeFocused();
    
    await page.keyboard.type('admin');
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#password')).toBeFocused();
    
    await page.keyboard.type('admin123');
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#login-form button[type="submit"]')).toBeFocused();
    
    await page.keyboard.press('Enter');
    
    await expect(page.locator('#user-info')).toBeVisible();
  });

  test('should support keyboard navigation in dashboard', async ({ page }) => {
    await page.goto('/');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('#user-info')).toBeVisible();
    
    await page.keyboard.press('Tab');
    
    let focusedElement = await page.evaluate(() => document.activeElement.id);
    expect(['logout-btn', 'add-task-btn']).toContain(focusedElement);
  });

  test('should have proper button types', async ({ page }) => {
    await page.goto('/');
    
    const submitButton = page.locator('#login-form button[type="submit"]');
    await expect(submitButton).toHaveAttribute('type', 'submit');
    
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('#user-info')).toBeVisible();
    
    await page.click('#add-task-btn');
    
    const cancelButton = page.locator('#cancel-task-btn');
    await expect(cancelButton).toHaveAttribute('type', 'button');
  });

  test('should have proper input placeholders', async ({ page }) => {
    await page.goto('/');
    
    const usernameInput = page.locator('#username');
    await expect(usernameInput).toHaveAttribute('placeholder', 'Enter username');
    
    const passwordInput = page.locator('#password');
    await expect(passwordInput).toHaveAttribute('placeholder', 'Enter password');
  });

  test('should have proper password input type', async ({ page }) => {
    await page.goto('/');
    
    const passwordInput = page.locator('#password');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should provide visual feedback for required fields', async ({ page }) => {
    await page.goto('/');
    
    const usernameInput = page.locator('#username');
    await expect(usernameInput).toHaveAttribute('required', '');
    
    const passwordInput = page.locator('#password');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('should have descriptive button text', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('#login-form button[type="submit"]')).toContainText('Login');
    
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('#login-form button[type="submit"]');
    
    await expect(page.locator('#logout-btn')).toContainText('Logout');
    await expect(page.locator('#add-task-btn')).toContainText('Add New Task');
  });
});
