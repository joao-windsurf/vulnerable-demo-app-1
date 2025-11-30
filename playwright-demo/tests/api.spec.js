const { test, expect } = require('@playwright/test');

test.describe('API Integration Tests', () => {
  test('should make successful login API call', async ({ page }) => {
    await page.goto('/');
    
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/login') && response.status() === 200
    );
    
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    const response = await responsePromise;
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.username).toBe('admin');
    expect(data.token).toBeDefined();
  });

  test('should handle failed login API call', async ({ page }) => {
    await page.goto('/');
    
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/login')
    );
    
    await page.fill('#username', 'invalid');
    await page.fill('#password', 'wrong');
    await page.click('button[type="submit"]');
    
    const response = await responsePromise;
    expect(response.status()).toBe(401);
    
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test('should fetch todos after login', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    
    const todosPromise = page.waitForResponse(response => 
      response.url().includes('/api/todos') && response.request().method() === 'GET'
    );
    
    await page.click('button[type="submit"]');
    
    const response = await todosPromise;
    expect(response.status()).toBe(200);
    
    const todos = await response.json();
    expect(Array.isArray(todos)).toBe(true);
  });

  test('should create new todo via API', async ({ page }) => {
    await page.goto('/');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('#user-info')).toBeVisible();
    
    const createPromise = page.waitForResponse(response => 
      response.url().includes('/api/todos') && response.request().method() === 'POST'
    );
    
    await page.click('#add-task-btn');
    await page.fill('#task-title', 'API Test Task');
    await page.click('#new-task-form button[type="submit"]');
    
    const response = await createPromise;
    expect(response.status()).toBe(200);
    
    const newTodo = await response.json();
    expect(newTodo.title).toBe('API Test Task');
    expect(newTodo.completed).toBe(false);
  });

  test('should update todo via API', async ({ page }) => {
    await page.goto('/');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('#user-info')).toBeVisible();
    
    const taskTitle = `Update API Task ${Date.now()}`;
    await page.click('#add-task-btn');
    await page.fill('#task-title', taskTitle);
    await page.click('#new-task-form button[type="submit"]');
    
    await page.waitForTimeout(500);
    
    const updatePromise = page.waitForResponse(response => 
      response.url().includes('/api/todos/') && response.request().method() === 'PUT'
    );
    
    const taskItem = page.locator('.task-item').filter({ hasText: taskTitle });
    await taskItem.locator('.task-checkbox').check();
    
    const response = await updatePromise;
    expect(response.status()).toBe(200);
    
    const updatedTodo = await response.json();
    expect(updatedTodo.completed).toBe(true);
  });

  test('should delete todo via API', async ({ page }) => {
    await page.goto('/');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('#user-info')).toBeVisible();
    
    const taskTitle = `Delete API Task ${Date.now()}`;
    await page.click('#add-task-btn');
    await page.fill('#task-title', taskTitle);
    await page.click('#new-task-form button[type="submit"]');
    
    await page.waitForTimeout(500);
    
    page.on('dialog', dialog => dialog.accept());
    
    const deletePromise = page.waitForResponse(response => 
      response.url().includes('/api/todos/') && response.request().method() === 'DELETE'
    );
    
    const taskItem = page.locator('.task-item').filter({ hasText: taskTitle });
    await taskItem.locator('.btn-danger').click();
    
    const response = await deletePromise;
    expect(response.status()).toBe(200);
  });

  test('should intercept and mock API responses', async ({ page, context }) => {
    await page.goto('/');
    
    await context.route('**/api/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id: 999, username: 'mocked', email: 'mock@test.com', role: 'user' },
          token: 'mocked_token_123'
        })
      });
    });
    
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('#login-form button[type="submit"]');
    
    await expect(page.locator('#user-info')).toContainText('mocked');
  });
});
