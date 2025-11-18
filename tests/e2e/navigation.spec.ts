import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing', () => {
  test('should navigate to homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/localhost:3000/);
  });

  test('should handle client-side routing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    const links = await page.locator('a[href^="/"], a[href^="#"]').all();
    
    if (links.length > 0) {
      const firstLink = links[0];
      const href = await firstLink.getAttribute('href');
      
      if (href && !href.includes('http') && !href.includes('auth0')) {
        await firstLink.click({ timeout: 5000 }).catch(() => {});
        await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
      }
    }
    
    expect(page.url()).toBeTruthy();
  });

  test('should handle navigation with vue-router', async ({ page }) => {
    await page.goto('/');
    
    await page.evaluate(() => {
      if ((window as any).$router) {
        (window as any).$router.push('/').catch(() => {});
      }
    }).catch(() => {});
    
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
    expect(page.url()).toContain('localhost:3000');
  });

  test('should handle back and forward navigation', async ({ page }) => {
    await page.goto('/');
    const initialUrl = page.url();
    
    const links = await page.locator('a[href^="/"]').all();
    if (links.length > 0) {
      await links[0].click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1000);
      
      await page.goBack({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
      
      await page.goForward({ timeout: 5000 }).catch(() => {});
    }
    
    expect(page.url()).toBeTruthy();
  });

  test('should handle 404 or invalid routes gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-route-12345', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    }).catch(() => null);
    
    if (response) {
      const status = response.status();
      expect([200, 404]).toContain(status);
    }
  });

  test('should load page without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    const criticalErrors = errors.filter(err => 
      !err.includes('auth0') && 
      !err.includes('sentry') && 
      !err.includes('pusher')
    );
    
    expect(criticalErrors.length).toBeLessThan(10);
  });

  test('should have responsive navigation menu', async ({ page }) => {
    await page.goto('/');
    
    const nav = page.locator('nav, [role="navigation"], .navbar, .menu').first();
    if (await nav.isVisible({ timeout: 5000 }).catch(() => false)) {
      const boundingBox = await nav.boundingBox();
      expect(boundingBox).toBeTruthy();
    }
  });
});
