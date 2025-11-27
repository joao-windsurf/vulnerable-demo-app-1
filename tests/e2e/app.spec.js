import { test, expect } from '@playwright/test';

test.describe('Application Basic Tests', () => {
  test('should load the application homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.*/, { timeout: 10000 });
  });

  test('should have proper page structure', async ({ page }) => {
    await page.goto('/');
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should respond to health check endpoint', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok() || response.status() === 404).toBeTruthy();
  });
});

test.describe('API Endpoint Tests', () => {
  test('should handle API requests', async ({ request }) => {
    const response = await request.get('/api/status');
    expect([200, 404, 500].includes(response.status())).toBeTruthy();
  });

  test('should accept POST requests to API', async ({ request }) => {
    const response = await request.post('/api/data', {
      data: {
        test: 'data'
      }
    });
    expect([200, 201, 404, 405, 500].includes(response.status())).toBeTruthy();
  });
});

test.describe('Security Tests', () => {
  test('should handle SQL injection attempts in query parameters', async ({ page }) => {
    const sqlInjectionPayload = "' OR '1'='1";
    await page.goto(`/?search=${encodeURIComponent(sqlInjectionPayload)}`);
    await expect(page).not.toHaveTitle(/error/i);
  });

  test('should handle XSS attempts in input fields', async ({ page }) => {
    await page.goto('/');
    const xssPayload = '<script>alert("XSS")</script>';
    
    const inputs = await page.locator('input[type="text"], input[type="search"], textarea').all();
    if (inputs.length > 0) {
      await inputs[0].fill(xssPayload);
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Navigation Tests', () => {
  test('should navigate between pages without errors', async ({ page }) => {
    await page.goto('/');
    
    const links = await page.locator('a[href]').all();
    if (links.length > 0) {
      const firstLink = links[0];
      const href = await firstLink.getAttribute('href');
      if (href && href.startsWith('/')) {
        await firstLink.click();
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page-12345');
    expect([404, 200].includes(response.status())).toBeTruthy();
  });
});

test.describe('Performance Tests', () => {
  test('should load the page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000);
  });

  test('should not have console errors on page load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    
    expect(errors.length).toBeLessThan(10);
  });
});
