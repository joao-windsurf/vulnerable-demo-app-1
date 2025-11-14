const { test, expect } = require('@playwright/test');

test.describe('Visual and UI Tests', () => {
  test('should have correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Playwright Demo App - Task Manager');
  });

  test('should display login page with proper styling', async ({ page }) => {
    await page.goto('/');
    
    const loginCard = page.locator('#login-page .card');
    await expect(loginCard).toBeVisible();
    
    const backgroundColor = await loginCard.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(backgroundColor).toBe('rgb(255, 255, 255)');
  });

  test('should have responsive navbar after login', async ({ page }) => {
    await page.goto('/');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    const navbar = page.locator('.navbar');
    await expect(navbar).toBeVisible();
    
    const navContent = page.locator('.nav-content');
    const display = await navContent.evaluate(el => 
      window.getComputedStyle(el).display
    );
    expect(display).toBe('flex');
  });

  test('should display stat cards in grid layout', async ({ page }) => {
    await page.goto('/');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    const stats = page.locator('.stats');
    await expect(stats).toBeVisible();
    
    const statCards = page.locator('.stat-card');
    await expect(statCards).toHaveCount(3);
    
    for (let i = 0; i < 3; i++) {
      await expect(statCards.nth(i)).toBeVisible();
    }
  });

  test('should apply hover effects on buttons', async ({ page }) => {
    await page.goto('/');
    
    const loginButton = page.locator('#login-form button[type="submit"]');
    await expect(loginButton).toBeVisible();
    
    const initialCursor = await loginButton.evaluate(el => 
      window.getComputedStyle(el).cursor
    );
    expect(initialCursor).toBe('pointer');
  });

  test('should show completed tasks with different styling', async ({ page }) => {
    await page.goto('/');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    const taskTitle = `Visual Task ${Date.now()}`;
    await page.click('#add-task-btn');
    await page.fill('#task-title', taskTitle);
    await page.click('#new-task-form button[type="submit"]');
    
    const taskItem = page.locator('.task-item').filter({ hasText: taskTitle });
    await taskItem.locator('.task-checkbox').check();
    await page.waitForTimeout(500);
    
    await expect(taskItem).toHaveClass(/completed/);
    
    const taskTitleElement = taskItem.locator('.task-title');
    const textDecoration = await taskTitleElement.evaluate(el => 
      window.getComputedStyle(el).textDecoration
    );
    expect(textDecoration).toContain('line-through');
  });

  test('should display error message in red color', async ({ page }) => {
    await page.goto('/');
    await page.fill('#username', 'wrong');
    await page.fill('#password', 'wrong');
    await page.click('button[type="submit"]');
    
    const errorMessage = page.locator('#login-error');
    await expect(errorMessage).toBeVisible();
    
    const color = await errorMessage.evaluate(el => 
      window.getComputedStyle(el).color
    );
    expect(color).toBe('rgb(220, 53, 69)');
  });

  test('should have proper input focus styling', async ({ page }) => {
    await page.goto('/');
    
    const usernameInput = page.locator('#username');
    
    const borderColorBefore = await usernameInput.evaluate(el => 
      window.getComputedStyle(el).borderColor
    );
    
    await usernameInput.focus();
    await page.waitForTimeout(100);
    
    const borderColorAfter = await usernameInput.evaluate(el => 
      window.getComputedStyle(el).borderColor
    );
    
    expect(borderColorAfter).not.toBe(borderColorBefore);
  });
});
