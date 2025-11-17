import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {

  test('deberia iniciar sesion exitosamente con credenciales correctas', async ({ page }) => {
    await page.goto('/admin/login');
    
    await expect(page.getByRole('heading', { name: /admin sign in/i })).toBeVisible();
    
    await page.getByPlaceholder('Username').fill('admin');
    await page.getByPlaceholder('Password').fill('admin123');
    
    await Promise.all([
      page.waitForURL(/\/admin$/),
      page.getByRole('button', { name: /sign in/i }).click()
    ]);
    
    await expect(page.getByRole('heading', { name: /Panel de administración/i })).toBeVisible({ timeout: 10000 });
  });

  test('deberia fallar con contraseña incorrecta', async ({ page }) => {
    await page.goto('/admin/login');
    
    await expect(page.getByRole('heading', { name: /admin sign in/i })).toBeVisible();
    
    await page.getByPlaceholder('Username').fill('admin');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.locator('body')).toContainText(/Invalid credentials/i);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('deberia fallar con campos vacios', async ({ page }) => {
    await page.goto('/admin/login');
    
    await expect(page.getByRole('heading', { name: /admin sign in/i })).toBeVisible();
    
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.locator('body')).toContainText(/Invalid credentials/i);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  //este test no funciona porque en el codigo permite acceder con cualquier nombre de usuario, pero se debe cambiar para que falle.
  test('deberia fallar con nombre de usuario incorrecto', async ({ page }) => {
    await page.goto('/admin/login');
    
    await expect(page.getByRole('heading', { name: /admin sign in/i })).toBeVisible();
    
    await page.getByPlaceholder('Username').fill('wronguser');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.locator('body')).toContainText(/Invalid credentials/i);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

});

