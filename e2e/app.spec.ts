import { test, expect } from '@playwright/test';

test.describe('Express Server E2E Tests', () => {
  test('should load the home page and display "Hello World!"', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toContainText('Hello World!');
  });

  test('should return 200 status code for home page', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('should handle redirect endpoint', async ({ page }) => {
    const response = await page.goto('/redirect', { waitUntil: 'commit' }).catch(err => {
      expect(err.message).toMatch(/ERR_TOO_MANY_REDIRECTS|NS_ERROR_REDIRECT_LOOP/);
      return null;
    });
    if (response === null) {
      expect(true).toBe(true);
    }
  });

  test('should handle error endpoint and return 500', async ({ page }) => {
    const response = await page.goto('/error');
    expect(response?.status()).toBe(500);
  });

  test('should return fake Stripe API key from payments endpoint', async ({ page }) => {
    await page.goto('/payments');
    await expect(page.locator('body')).toContainText('sk_live_fakestripeapikeyleaked12');
  });

  test('should return 200 status for payments endpoint', async ({ page }) => {
    const response = await page.goto('/payments');
    expect(response?.status()).toBe(200);
  });

  test('should handle file endpoint with parameter', async ({ page }) => {
    const response = await page.goto('/file/test.txt');
    expect(response?.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('Navigation and Page Behavior', () => {
  test('should navigate between different routes', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toContainText('Hello World!');
    
    await page.goto('/payments');
    await expect(page.locator('body')).toContainText('sk_live_fakestripeapikeyleaked12');
  });

  test('should handle multiple page loads', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      const response = await page.goto('/');
      expect([200, 304]).toContain(response?.status());
      await expect(page.locator('body')).toContainText('Hello World!');
    }
  });
});

test.describe('HTTP Response Headers', () => {
  test('should return correct content-type for home page', async ({ page }) => {
    const response = await page.goto('/');
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('text/html');
  });

  test('should return correct content-type for payments endpoint', async ({ page }) => {
    const response = await page.goto('/payments');
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('text/html');
  });
});

test.describe('Error Handling', () => {
  test('should display error message on error endpoint', async ({ page }) => {
    await page.goto('/error');
    await expect(page.locator('body')).toContainText('Something broke!');
  });

  test('should handle non-existent routes with 404', async ({ page }) => {
    const response = await page.goto('/non-existent-route');
    expect(response?.status()).toBe(404);
  });

  test('should handle invalid file requests', async ({ page }) => {
    const response = await page.goto('/file/../../../etc/passwd');
    expect(response?.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('Performance and Reliability', () => {
  test('should load home page within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle concurrent requests', async ({ page, context }) => {
    const page2 = await context.newPage();
    const page3 = await context.newPage();

    const [response1, response2, response3] = await Promise.all([
      page.goto('/'),
      page2.goto('/payments'),
      page3.goto('/'),
    ]);

    expect(response1?.status()).toBe(200);
    expect(response2?.status()).toBe(200);
    expect(response3?.status()).toBe(200);

    await page2.close();
    await page3.close();
  });
});

test.describe('Content Verification', () => {
  test('should verify exact text content on home page', async ({ page }) => {
    await page.goto('/');
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.trim()).toBe('Hello World!');
  });

  test('should verify exact API key on payments page', async ({ page }) => {
    await page.goto('/payments');
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.trim()).toBe('sk_live_fakestripeapikeyleaked12');
  });
});
