import { test, expect } from '@playwright/test';

test.describe('Admin -Agregar item a la base de datos', () => {

  const adminLogin = async (page: any) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: /admin sign in/i })).toBeVisible();
    await page.getByPlaceholder('Username').fill('admin');
    await page.getByPlaceholder('Password').fill('admin123');
    
    await Promise.all([
      page.waitForURL(/\/admin$/),
      page.getByRole('button', { name: /sign in/i }).click()
    ]);
    
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Panel de administración/i })).toBeVisible();
  };

  test('deberia agregar un item a la base de datos', async ({ page }) => {
    await adminLogin(page);

    const addItemButton = page.getByRole('button', { name: /Agregar item/i });
    await expect(addItemButton).toBeVisible();
    await addItemButton.click();

    await expect(page.locator('div.fixed.inset-0')).toBeVisible();
    const modalHeading = page.getByText(/Crear nuevo item/i);
    await expect(modalHeading).toBeVisible();

    const itemName = `Test Item ${Date.now()}`;
    await page.getByPlaceholder('Nombre').fill(itemName);
    await page.getByPlaceholder('Categoría').fill('uncategorized'); 
    await page.getByPlaceholder('Sizes (S,M,L)').fill('S,M,L');
    await page.getByPlaceholder('Precio por día').fill('99.99');
    await page.getByRole('button', { name: /Crear/i }).click();

    await expect(modalHeading).not.toBeVisible();

    const row = page.locator('tbody tr').filter({ hasText: itemName });
    await expect(row.getByText('uncategorized')).toBeVisible();
    await expect(row.getByText('0.0')).toBeVisible();
    await expect(row.getByText('$99.99')).toBeVisible();
  });

  test('deberia mostrar un error si el nombre esta vacio', async ({ page }) => {
    await adminLogin(page);

    await page.getByRole('button', { name: /Agregar item/i }).click();
    await expect(page.locator('div.fixed.inset-0')).toBeVisible();
    const modalHeading = page.getByText(/Crear nuevo item/i);
    await expect(modalHeading).toBeVisible();

    await page.getByPlaceholder('Categoría').fill('uncategorized');
    await page.getByPlaceholder('Precio por día').fill('50');

    await page.getByRole('button', { name: /Crear/i }).click();

    await expect(modalHeading).toBeVisible();
  });

  test('deberia agregar un item con solo nombre y precio (datos minimos)', async ({ page }) => {
    await adminLogin(page);

    await page.getByRole('button', { name: /Agregar item/i }).click();
    await expect(page.locator('div.fixed.inset-0')).toBeVisible();
    const modalHeading = page.getByText(/Crear nuevo item/i);
    await expect(modalHeading).toBeVisible();

    const itemName = `Minimal Item ${Date.now()}`;
    await page.getByPlaceholder('Nombre').fill(itemName);
    await page.getByPlaceholder('Precio por día').fill('25.50');

    await page.getByRole('button', { name: /Crear/i }).click();

    await expect(modalHeading).not.toBeVisible();

    const row = page.locator('tbody tr').filter({ hasText: itemName });
    await expect(row).toBeVisible();
  });

});
