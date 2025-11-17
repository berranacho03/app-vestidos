import { test, expect } from '@playwright/test';

test('basic test - check if playwright works', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});

test('check local server', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/localhost:3000/);
});






