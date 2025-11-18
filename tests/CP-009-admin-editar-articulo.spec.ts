import { test, expect } from '@playwright/test';

/**
 * CP-009: Admin: Gestión de Inventario
 * 
 * Descripción: Editar un artículo existente.
 * 
 * Precondición: El administrador ha iniciado sesión y un artículo existe en el inventario.
 * 
 * Datos de prueba:
 * - Artículo: Vestido Elegance #01
 * - Cambio: Aumentar el precio
 * 
 * Pasos:
 * 1. Navegar a "Gestión de Inventario".
 * 2. Seleccionar el "Vestido Elegance #01".
 * 3. Modificar el precio.
 * 4. Guardar.
 * 
 * Resultado esperado: El precio se actualiza correctamente en la página de detalle del artículo.
 */
test('CP-009: Editar un artículo existente y actualizar el precio', async ({ page }) => {
  // Precondición: El administrador ha iniciado sesión
  await page.goto('/admin/login');
  await expect(page.locator('h1')).toContainText('Admin');
  
  const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  await usernameInput.fill(adminUsername);
  await passwordInput.fill(adminPassword);
  
  const loginButton = page.locator('button[type="submit"]');
  await loginButton.click();
  await page.waitForURL(/\/admin$/);
  
  // Paso 1: Navegar a "Gestión de Inventario"
  const inventorySection = page.locator('text=/Gestión de Inventario/i');
  await expect(inventorySection).toBeVisible();
  
  // Esperar a que la tabla de inventario se cargue
  await page.waitForSelector('table, div.rounded-2xl.border', { timeout: 10000 });
  
  // Paso 2: Seleccionar el "Vestido Elegance #01"
  // Buscar el artículo en la tabla o lista
  let editButton = page.locator('text=/Vestido Elegance #01|Elegance/i').locator('..').locator('..').locator('button').first();
  
  // Si no encontramos el artículo específico, buscar el primer artículo disponible
  const articleExists = await editButton.count() > 0;
  
  if (!articleExists) {
    // Buscar el botón de menú de opciones (tres puntos) del primer artículo
    const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await menuButton.click();
    await page.waitForTimeout(500);
    
    // Buscar el botón de "Editar"
    editButton = page.locator('button:has-text("Editar"), text=/Editar/i').first();
  } else {
    // Si encontramos el artículo, hacer clic en el menú de opciones
    const menuButton = editButton;
    await menuButton.click();
    await page.waitForTimeout(500);
    
    // Buscar el botón de "Editar"
    editButton = page.locator('button:has-text("Editar"), text=/Editar/i').first();
  }
  
  await expect(editButton).toBeVisible();
  await editButton.click();
  
  // Esperar a que se abra el modal de edición
  await page.waitForSelector('div.fixed.inset-0', { timeout: 5000 });
  
  const modal = page.locator('div.fixed.inset-0').filter({ has: page.locator('text=/Editar Item/i') });
  await expect(modal).toBeVisible();
  
  const modalForm = modal.locator('form');
  await expect(modalForm).toBeVisible();
  
  // Obtener el precio actual
  const priceInput = modalForm.locator('input[type="number"]').first();
  const currentPrice = await priceInput.inputValue();
  const currentPriceNum = parseFloat(currentPrice) || 0;
  
  // Paso 3: Modificar el precio (aumentarlo)
  const newPrice = (currentPriceNum + 10).toFixed(2);
  await priceInput.clear();
  await priceInput.fill(newPrice);
  
  // Verificar que el precio se actualizó
  const updatedPrice = await priceInput.inputValue();
  expect(parseFloat(updatedPrice)).toBeCloseTo(parseFloat(newPrice), 2);
  
  // Paso 4: Guardar
  const saveButton = modalForm.locator('button[type="submit"]:has-text("Actualizar Item"), button:has-text("Actualizar")');
  await expect(saveButton).toBeVisible();
  await saveButton.click();
  
  // Esperar a que se procese la actualización
  await page.waitForTimeout(1000);
  
  // Verificar que se muestra un mensaje de éxito
  const successModal = page.locator('.swal2-popup').filter({ hasText: /actualizado|éxito/i });
  const successVisible = await successModal.isVisible().catch(() => false);
  
  if (successVisible) {
    const successTitle = await successModal.locator('.swal2-title, h2').textContent().catch(() => '');
    expect(successTitle?.toLowerCase()).toMatch(/actualizado|éxito|success/i);
    
    // Cerrar el modal de éxito
    const confirmBtn = successModal.locator('.swal2-confirm, button.swal2-styled').first();
    if (await confirmBtn.isVisible().catch(() => false)) {
      await confirmBtn.click();
      await page.waitForTimeout(500);
    }
  }
  
  // Resultado esperado: Verificar que el precio se actualiza correctamente en la página de detalle
  // Obtener el ID del artículo (puede estar en la URL o en la tabla)
  // Buscar el artículo en la tabla para obtener su ID o nombre
  const articleName = page.locator('text=/Vestido Elegance #01|Elegance/i').first();
  const articleLink = articleName.locator('..').locator('a[href^="/items/"]').first();
  
  // Si no hay enlace directo, buscar en la tabla y obtener el ID
  let itemId: string | null = null;
  const itemRow = page.locator('tr, div.rounded-2xl').filter({ hasText: /Vestido Elegance #01|Elegance/i }).first();
  const itemIdElement = itemRow.locator('span, div').filter({ hasText: /^\d+$/ }).first();
  const itemIdExists = await itemIdElement.count() > 0;
  
  if (itemIdExists) {
    itemId = await itemIdElement.textContent();
  }
  
  // Si encontramos un enlace, usarlo; si no, construir la URL con el ID
  if (await articleLink.count() > 0) {
    const href = await articleLink.getAttribute('href');
    if (href) {
      await page.goto(href);
    }
  } else if (itemId) {
    await page.goto(`/items/${itemId}`);
  } else {
    // Buscar cualquier artículo para verificar el precio
    const anyArticleLink = page.locator('a[href^="/items/"]').first();
    if (await anyArticleLink.count() > 0) {
      const href = await anyArticleLink.getAttribute('href');
      if (href) {
        await page.goto(href);
      }
    }
  }
  
  // Verificar que estamos en la página de detalle
  await page.waitForURL(/\/items\/\d+$/);
  
  // Verificar que el precio se actualizó
  const priceDisplay = page.locator('text=/Desde.*\\$.*día|\\$.*día/i');
  await expect(priceDisplay).toBeVisible();
  
  const priceText = await priceDisplay.textContent();
  const displayedPrice = priceText?.match(/\$(\d+\.?\d*)/)?.[1];
  
  if (displayedPrice) {
    const displayedPriceNum = parseFloat(displayedPrice);
    expect(displayedPriceNum).toBeCloseTo(parseFloat(newPrice), 2);
  }
});




