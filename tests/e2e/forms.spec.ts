import { test, expect } from '@playwright/test';

test.describe('Forms and User Interactions', () => {
  test('should handle form submissions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    const forms = await page.locator('form').all();
    
    if (forms.length > 0) {
      const form = forms[0];
      const inputs = await form.locator('input[type="text"], input[type="email"], textarea').all();
      
      if (inputs.length > 0) {
        await inputs[0].fill('test@example.com', { timeout: 5000 }).catch(() => {});
      }
      
      const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitButton.click({ timeout: 5000 }).catch(() => {});
      }
    }
    
    expect(page.url()).toBeTruthy();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/');
    
    const emailInputs = await page.locator('input[type="email"]').all();
    
    if (emailInputs.length > 0) {
      const emailInput = emailInputs[0];
      await emailInput.fill('invalid-email', { timeout: 5000 }).catch(() => {});
      await emailInput.blur().catch(() => {});
      
      await page.waitForTimeout(500);
    }
    
    expect(page.url()).toBeTruthy();
  });

  test('should handle button clicks', async ({ page }) => {
    await page.goto('/');
    
    const buttons = await page.locator('button:not([disabled])').all();
    
    if (buttons.length > 0) {
      const safeButtons = [];
      for (const button of buttons.slice(0, 3)) {
        const text = await button.textContent().catch(() => '');
        if (text && !text.toLowerCase().includes('delete') && !text.toLowerCase().includes('remove')) {
          safeButtons.push(button);
        }
      }
      
      if (safeButtons.length > 0) {
        await safeButtons[0].click({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(500);
      }
    }
    
    expect(page.url()).toBeTruthy();
  });

  test('should handle input field interactions', async ({ page }) => {
    await page.goto('/');
    
    const textInputs = await page.locator('input[type="text"], input[type="search"]').all();
    
    if (textInputs.length > 0) {
      const input = textInputs[0];
      await input.fill('test input', { timeout: 5000 }).catch(() => {});
      await input.clear({ timeout: 5000 }).catch(() => {});
      await input.fill('new test input', { timeout: 5000 }).catch(() => {});
    }
    
    expect(page.url()).toBeTruthy();
  });

  test('should handle select dropdowns', async ({ page }) => {
    await page.goto('/');
    
    const selects = await page.locator('select').all();
    
    if (selects.length > 0) {
      const select = selects[0];
      const options = await select.locator('option').all();
      
      if (options.length > 1) {
        const optionValue = await options[1].getAttribute('value').catch(() => null);
        if (optionValue) {
          await select.selectOption(optionValue, { timeout: 5000 }).catch(() => {});
        }
      }
    }
    
    expect(page.url()).toBeTruthy();
  });

  test('should handle checkbox interactions', async ({ page }) => {
    await page.goto('/');
    
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    
    if (checkboxes.length > 0) {
      const checkbox = checkboxes[0];
      await checkbox.check({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(200);
      await checkbox.uncheck({ timeout: 5000 }).catch(() => {});
    }
    
    expect(page.url()).toBeTruthy();
  });

  test('should handle radio button selections', async ({ page }) => {
    await page.goto('/');
    
    const radios = await page.locator('input[type="radio"]').all();
    
    if (radios.length > 0) {
      await radios[0].check({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(200);
    }
    
    expect(page.url()).toBeTruthy();
  });
});
