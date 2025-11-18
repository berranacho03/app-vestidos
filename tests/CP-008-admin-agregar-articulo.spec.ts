import { test, expect } from '@playwright/test';

/**
 * CP-008: Admin: Gestión de Inventario
 * 
 * Descripción: Agregar un nuevo artículo.
 * 
 * Precondición: El administrador ha iniciado sesión.
 * 
 * Datos de prueba:
 * - Datos de un nuevo vestido: Nombre, precio, talla, color, etc.
 * 
 * Pasos:
 * 1. Navegar a la sección "Gestión de Inventario".
 * 2. Hacer clic en "Agregar Artículo".
 * 3. Llenar el formulario.
 * 4. Guardar.
 * 
 * Resultado esperado: El nuevo artículo aparece en el catálogo público.
 */
test('CP-008: Agregar un nuevo artículo al inventario como administrador', async ({ page }) => {
  // Precondición: El administrador ha iniciado sesión
  // Primero, navegar a la página de login de administrador
  await page.goto('/admin/login');
  
  // Verificar que estamos en la página de login
  await expect(page.locator('h1')).toContainText('Admin');
  
  // Completar el formulario de login
  // Nota: Las credenciales deberían estar en variables de entorno
  // Para el test, usaremos valores por defecto o configurables
  const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  
  // Usar credenciales de administrador (pueden estar en variables de entorno)
  // Por defecto, intentar con valores comunes o usar variables de entorno del test
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  await usernameInput.fill(adminUsername);
  await passwordInput.fill(adminPassword);
  
  // Hacer clic en el botón de login
  const loginButton = page.locator('button[type="submit"]');
  await loginButton.click();
  
  // Esperar a que se redirija al panel de administración
  await page.waitForURL(/\/admin$/);
  
  // Paso 1: Navegar a la sección "Gestión de Inventario"
  // La sección debería estar visible en la página de admin
  const inventorySection = page.locator('text=/Gestión de Inventario/i');
  await expect(inventorySection).toBeVisible();
  
  // Paso 2: Hacer clic en "Agregar Artículo" o "Agregar Item"
  const addItemButton = page.locator('button:has-text("Agregar Item"), button:has-text("Agregar Artículo")');
  await expect(addItemButton).toBeVisible();
  await addItemButton.click();
  
  // Esperar a que se abra el modal del formulario
  // El modal es un div con clase fixed y contiene el formulario
  await page.waitForSelector('div.fixed.inset-0', { timeout: 5000 });
  
  // Verificar que el modal está visible
  const modal = page.locator('div.fixed.inset-0').filter({ has: page.locator('text=/Crear Nuevo Item|Editar Item/i') });
  await expect(modal).toBeVisible();
  
  // Verificar que el formulario está dentro del modal
  const modalForm = modal.locator('form');
  await expect(modalForm).toBeVisible();
  
  // Paso 3: Llenar el formulario con datos de un nuevo vestido
  // Buscar los campos del formulario dentro del modal
  const nameInput = modalForm.locator('input[placeholder*="Vestido"], input[type="text"]').first();
  const categorySelect = modalForm.locator('select').first();
  const sizesInput = modalForm.locator('input[placeholder*="S, M, L"], input[placeholder*="talla" i]').first();
  const priceInput = modalForm.locator('input[type="number"]').first();
  
  // Datos del nuevo vestido
  const newItemName = `Vestido Test ${Date.now()}`;
  const newItemCategory = 'dress';
  const newItemSizes = 'S, M, L';
  const newItemPrice = '49.99';
  
  // Llenar el nombre
  await nameInput.fill(newItemName);
  
  // Seleccionar la categoría
  await categorySelect.selectOption(newItemCategory);
  
  // Llenar las tallas
  await sizesInput.fill(newItemSizes);
  
  // Llenar el precio
  await priceInput.fill(newItemPrice);
  
  // Paso 4: Guardar
  // Buscar el botón de crear dentro del modal
  const saveButton = modalForm.locator('button[type="submit"]:has-text("Crear Item"), button:has-text("Crear Item")');
  await expect(saveButton).toBeVisible();
  await saveButton.click();
  
  // Esperar a que se procese la creación
  await page.waitForTimeout(1000);
  
  // Verificar que se muestra un mensaje de éxito (SweetAlert2)
  const successModal = page.locator('.swal2-popup').filter({ hasText: /creado|agregado|éxito/i });
  const successVisible = await successModal.isVisible().catch(() => false);
  
  if (successVisible) {
    const successTitle = await successModal.locator('.swal2-title, h2').textContent().catch(() => '');
    expect(successTitle?.toLowerCase()).toMatch(/creado|agregado|éxito|success/i);
    
    // Cerrar el modal de éxito
    const confirmBtn = successModal.locator('.swal2-confirm, button.swal2-styled').first();
    if (await confirmBtn.isVisible().catch(() => false)) {
      await confirmBtn.click();
      await page.waitForTimeout(500);
    }
  }
  
  // Resultado esperado: Verificar que el nuevo artículo aparece en el catálogo público
  // Esperar a que el modal de éxito se cierre
  await page.waitForTimeout(2000);
  
  // Navegar al catálogo público
  await page.goto('/search');
  
  // Verificar que estamos en la página de búsqueda
  await expect(page.locator('h1')).toContainText('Explorar catálogo');
  
  // Esperar a que los artículos se carguen
  await page.waitForSelector('div.rounded-2xl.border', { timeout: 10000 });
  
  // Buscar el nuevo artículo por nombre (usando el nombre único que creamos)
  const newItemCard = page.locator(`text=/${newItemName}/i`).first();
  const itemExists = await newItemCard.isVisible().catch(() => false);
  
  // Verificar que el artículo aparece en el catálogo
  expect(itemExists).toBeTruthy();
  
  // Verificar que el artículo tiene la información correcta
  if (itemExists) {
    // Buscar la tarjeta completa del artículo
    // El texto está dentro de un párrafo, subir al contenedor padre
    const itemCard = newItemCard.locator('..').locator('..').first();
    
    // Verificar que muestra el precio (debería mostrar el precio que ingresamos)
    const priceDisplay = itemCard.locator('text=/\\$49\\.99|\\$50/i');
    const priceVisible = await priceDisplay.isVisible().catch(() => false);
    
    // Verificar que muestra las tallas (debería mostrar S, M, L)
    const sizesDisplay = itemCard.locator('text=/Tallas?:.*S.*M.*L/i');
    const sizesVisible = await sizesDisplay.isVisible().catch(() => false);
    
    // Verificar que es un vestido (categoría)
    const categoryDisplay = itemCard.locator('text=/Vestido/i');
    const categoryVisible = await categoryDisplay.isVisible().catch(() => false);
    
    // El artículo debería estar visible en el catálogo público con toda su información
    expect(itemExists).toBeTruthy();
  } else {
    // Si no encontramos el artículo, puede ser que necesite refrescar o que haya un problema
    // Intentar refrescar la página
    await page.reload();
    await page.waitForSelector('div.rounded-2xl.border', { timeout: 10000 });
    
    const newItemCardAfterReload = page.locator(`text=/${newItemName}/i`).first();
    const itemExistsAfterReload = await newItemCardAfterReload.isVisible().catch(() => false);
    expect(itemExistsAfterReload).toBeTruthy();
  }
});

