const { test, expect } = require('@playwright/test');

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page.locator('#user-info')).toBeVisible();
  });

  test('should display task statistics', async ({ page }) => {
    await expect(page.locator('#total-tasks')).toBeVisible();
    await expect(page.locator('#completed-tasks')).toBeVisible();
    await expect(page.locator('#pending-tasks')).toBeVisible();
    
    const totalTasks = await page.locator('#total-tasks').textContent();
    expect(parseInt(totalTasks)).toBeGreaterThanOrEqual(0);
  });

  test('should display existing tasks', async ({ page }) => {
    await expect(page.locator('.tasks-list')).toBeVisible();
    
    const taskItems = page.locator('.task-item');
    const count = await taskItems.count();
    
    if (count > 0) {
      await expect(taskItems.first()).toBeVisible();
      await expect(taskItems.first().locator('.task-title')).toBeVisible();
      await expect(taskItems.first().locator('.task-checkbox')).toBeVisible();
    }
  });

  test('should show add task form when clicking add button', async ({ page }) => {
    await expect(page.locator('#add-task-form')).not.toBeVisible();
    
    await page.click('#add-task-btn');
    
    await expect(page.locator('#add-task-form')).toBeVisible();
    await expect(page.locator('#task-title')).toBeVisible();
    await expect(page.locator('#task-title')).toBeFocused();
  });

  test('should add a new task successfully', async ({ page }) => {
    const taskTitle = `Test Task ${Date.now()}`;
    
    await page.click('#add-task-btn');
    await page.fill('#task-title', taskTitle);
    await page.click('#new-task-form button[type="submit"]');
    
    await expect(page.locator('#add-task-form')).not.toBeVisible();
    
    await expect(page.locator('.task-item').filter({ hasText: taskTitle })).toBeVisible();
  });

  test('should cancel adding a task', async ({ page }) => {
    await page.click('#add-task-btn');
    await expect(page.locator('#add-task-form')).toBeVisible();
    
    await page.fill('#task-title', 'This should be cancelled');
    await page.click('#cancel-task-btn');
    
    await expect(page.locator('#add-task-form')).not.toBeVisible();
  });

  test('should toggle task completion status', async ({ page }) => {
    const taskTitle = `Toggle Task ${Date.now()}`;
    
    await page.click('#add-task-btn');
    await page.fill('#task-title', taskTitle);
    await page.click('#new-task-form button[type="submit"]');
    
    const taskItem = page.locator('.task-item').filter({ hasText: taskTitle });
    await expect(taskItem).toBeVisible();
    
    const checkbox = taskItem.locator('.task-checkbox');
    await expect(checkbox).not.toBeChecked();
    
    await checkbox.check();
    await page.waitForTimeout(500);
    
    await expect(taskItem).toHaveClass(/completed/);
    await expect(checkbox).toBeChecked();
    
    await checkbox.uncheck();
    await page.waitForTimeout(500);
    
    await expect(taskItem).not.toHaveClass(/completed/);
  });

  test('should delete a task with confirmation', async ({ page }) => {
    const taskTitle = `Delete Task ${Date.now()}`;
    
    await page.click('#add-task-btn');
    await page.fill('#task-title', taskTitle);
    await page.click('#new-task-form button[type="submit"]');
    
    const taskItem = page.locator('.task-item').filter({ hasText: taskTitle });
    await expect(taskItem).toBeVisible();
    
    page.on('dialog', dialog => dialog.accept());
    
    await taskItem.locator('.btn-danger').click();
    
    await expect(taskItem).not.toBeVisible();
  });

  test('should update statistics when adding tasks', async ({ page }) => {
    await page.waitForTimeout(500);
    const initialTotal = parseInt(await page.locator('#total-tasks').textContent());
    const initialPending = parseInt(await page.locator('#pending-tasks').textContent());
    
    const taskTitle = `Stats Task ${Date.now()}`;
    await page.click('#add-task-btn');
    await page.fill('#task-title', taskTitle);
    await page.click('#new-task-form button[type="submit"]');
    
    await page.waitForTimeout(1000);
    
    const newTotal = parseInt(await page.locator('#total-tasks').textContent());
    const newPending = parseInt(await page.locator('#pending-tasks').textContent());
    
    expect(newTotal).toBeGreaterThanOrEqual(initialTotal + 1);
    expect(newPending).toBeGreaterThanOrEqual(initialPending + 1);
  });

  test('should update statistics when completing tasks', async ({ page }) => {
    const taskTitle = `Complete Stats Task ${Date.now()}`;
    
    await page.click('#add-task-btn');
    await page.fill('#task-title', taskTitle);
    await page.click('#new-task-form button[type="submit"]');
    
    await page.waitForTimeout(1000);
    
    const taskItem = page.locator('.task-item').filter({ hasText: taskTitle });
    await expect(taskItem).toBeVisible();
    await expect(taskItem).not.toHaveClass(/completed/);
    
    await taskItem.locator('.task-checkbox').check();
    
    await page.waitForTimeout(1000);
    
    await expect(taskItem).toHaveClass(/completed/);
    
    const completedCount = parseInt(await page.locator('#completed-tasks').textContent());
    expect(completedCount).toBeGreaterThan(0);
  });
});
