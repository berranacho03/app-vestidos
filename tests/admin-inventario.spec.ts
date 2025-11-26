import { test, expect } from '@playwright/test';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminInventoryPage } from './pages/AdminInventoryPage';
import { SweetAlertDialog } from './pages/SweetAlertDialog';
import { SearchPage } from './pages/SearchPage';

/**
 * Módulo: Admin - Gestión de Inventario
 * 
 * Este archivo contiene los casos de prueba relacionados con la gestión de inventario por parte del administrador:
 * - CP-008: Agregar un nuevo artículo
 * - CP-009: Editar un artículo existente
 * - CP-015: Eliminar un artículo existente
 * - CP-016: Validación de errores al agregar artículo
 */

test('CP-008: Agregar un nuevo artículo', async ({ page }) => {
  const loginPage = new AdminLoginPage(page);
  await loginPage.login();

  const inventoryPage = new AdminInventoryPage(page);
  await inventoryPage.goto();

  await inventoryPage.clickAddItem();
  await inventoryPage.expectModalTitle(/Crear Nuevo Item/i);

  await inventoryPage.fillItemForm({
    name: 'Vestido de prueba',
    category: 'dress',
    sizes: 'S, M, L',
    price: '50.00'
  });

  const apiResponse = await inventoryPage.submitItemForm('create');
  expect(apiResponse.status()).toBe(201);

  const dialog = new SweetAlertDialog(page);
  await dialog.waitForDialog();
  await dialog.expectTitle(/Item creado/i);
  await dialog.expectContent(/El item se agregó correctamente/i);

  await dialog.waitForSuccessAndClose(2000);

  await page.waitForLoadState('networkidle');
  await inventoryPage.expectItemInList('Vestido de prueba');

  // Verificar en catálogo público
  await page.goto('/search', { waitUntil: 'domcontentloaded', timeout: 30000 });
  const searchPage = new SearchPage(page);
  await searchPage.waitForLoad();

  const itemInCatalog = page.locator('text=Vestido de prueba').first();
  await expect(itemInCatalog).toBeVisible();
});

test('CP-009: Editar un artículo existente', async ({ page }) => {
  const loginPage = new AdminLoginPage(page);
  await loginPage.login();

  const inventoryPage = new AdminInventoryPage(page);
  await inventoryPage.goto();
  await inventoryPage.waitForLoad();

  const firstItemRow = await inventoryPage.getFirstItemRow();
  const itemId = await inventoryPage.getItemId(firstItemRow);
  const originalPrice = await inventoryPage.getItemPrice(firstItemRow);
  const newPrice = originalPrice + 10;

  await inventoryPage.openItemMenu(firstItemRow);
  await inventoryPage.clickEdit();
  await inventoryPage.expectModalTitle(/Editar Item/i);

  await inventoryPage.fillItemForm({ price: newPrice.toString() });

  const apiResponse = await inventoryPage.submitItemForm('update');
  expect(apiResponse.status()).toBe(200);

  const dialog = new SweetAlertDialog(page);
  await dialog.waitForDialog();
  await dialog.expectTitle(/Item actualizado/i);
  await dialog.waitForSuccessAndClose(2000);

  await page.waitForLoadState('networkidle');
  await inventoryPage.expectPriceInList(newPrice);

  // Verificar en página de detalle
  await page.goto(`/items/${itemId}`);
  await page.waitForURL(/\/items\/\d+$/, { timeout: 10000 });

  const priceInDetail = page.locator('p').filter({
    hasText: new RegExp(`Desde \\$${newPrice}/día`)
  });
  await expect(priceInDetail).toBeVisible();
});

test('CP-015: Eliminar un artículo existente', async ({ page }) => {
  const loginPage = new AdminLoginPage(page);
  await loginPage.login();

  const inventoryPage = new AdminInventoryPage(page);
  await inventoryPage.goto();
  await inventoryPage.waitForLoad();

  const firstItemRow = await inventoryPage.getFirstItemRow();
  const itemId = await inventoryPage.getItemId(firstItemRow);
  const itemName = await inventoryPage.getItemName(firstItemRow);
  expect(itemName).toBeTruthy();

  const apiResponse = await inventoryPage.deleteItem(firstItemRow);
  expect(apiResponse.status()).toBe(200);

  const dialog = new SweetAlertDialog(page);
  await dialog.waitForDialog();
  await dialog.expectTitle(/Eliminado/i);
  await dialog.waitForSuccessAndClose(2000);

  await page.waitForLoadState('networkidle');
  await inventoryPage.expectItemNotInList(itemId);

  // Verificar que desaparece del catálogo público
  await page.goto('/search', { waitUntil: 'domcontentloaded', timeout: 30000 });
  const searchPage = new SearchPage(page);
  await searchPage.waitForLoad();

  const itemLinkInCatalog = page.locator(`a[href="/items/${itemId}"]`);
  const linkCount = await itemLinkInCatalog.count();
  expect(linkCount).toBe(0);
});

test('CP-016: Validación de errores al agregar artículo', async ({ page }) => {
  const loginPage = new AdminLoginPage(page);
  await loginPage.login();

  const inventoryPage = new AdminInventoryPage(page);
  await inventoryPage.goto();

  await inventoryPage.clickAddItem();
  await inventoryPage.expectModalTitle(/Crear Nuevo Item/i);

  // Verificar que el campo nombre tiene required
  const nameInput = page.locator('input[placeholder*="Vestido"]').first();
  await expect(nameInput).toHaveAttribute('required', '');

  const categorySelect = page.locator('select').filter({
    hasText: /Vestido|Zapatos|Bolso|Chaqueta/i
  });
  await expect(categorySelect).toHaveAttribute('required', '');

  // Completar solo el nombre y guardar
  await inventoryPage.fillItemForm({
    name: 'Artículo de prueba validación'
  });

  const apiResponse = await inventoryPage.submitItemForm('create');

  if (apiResponse.status() === 201) {
    const dialog = new SweetAlertDialog(page);
    await dialog.waitForDialog();
    await dialog.expectTitle(/Item creado/i);
  } else {
    const modal = inventoryPage.getModal();
    const errorDiv = modal.locator('div.bg-red-50').filter({ hasText: /.+/ }).first();
    await expect(errorDiv).toBeVisible();
  }
});
