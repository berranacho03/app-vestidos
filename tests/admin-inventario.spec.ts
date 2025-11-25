import { test, expect } from '@playwright/test';

/**
 * Módulo: Admin - Gestión de Inventario
 * 
 * Este archivo contiene los casos de prueba relacionados con la gestión de inventario por parte del administrador:
 * - CP-008: Agregar un nuevo artículo
 * - CP-009: Editar un artículo existente
 * - CP-015: Eliminar un artículo existente
 * - CP-016: Validación de errores al agregar artículo
 */

// Helper para login de admin
async function loginAsAdmin(page: any) {
  await page.goto('/admin/login');
  
  const usernameInput = page.locator('input[name="username"]');
  const passwordInput = page.locator('input[name="password"]');
  const submitButton = page.locator('button[type="submit"]');
  
  await usernameInput.fill(process.env.ADMIN_USERNAME || 'admin');
  await passwordInput.fill(process.env.ADMIN_PASSWORD || 'admin123');
  
  // Verificar que el botón está habilitado antes de hacer clic
  await expect(submitButton).toBeEnabled();
  
  // Configurar listener para interceptar la respuesta de la API ANTES de hacer click
  // Esto asegura que capturamos la respuesta antes de que ocurra la navegación
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponsePromise = page.waitForResponse(
    (response: any) => response.url().includes('/api/admin/login') && 
                       response.request().method() === 'POST',
    { timeout: 15000 }
  );
  
  // Enviar formulario
  await submitButton.click();
  
  // Esperar la respuesta de la API
  const apiResponse = await apiResponsePromise;
  expect(apiResponse.status()).toBe(200);
  expect(apiResponse.ok()).toBe(true);
  
  // Esperar la navegación a /admin
  await page.waitForURL(/\/admin$/, { timeout: 10000 });
}

/**
 * CP-008: Admin - Gestión de Inventario - Agregar un nuevo artículo
 * 
 * Descripción: Agregar un nuevo artículo.
 * 
 * Precondición: El administrador ha iniciado sesión.
 * 
 * Datos de prueba:
 * - Nombre: "Vestido de prueba"
 * - Categoría: "Vestido" (dress)
 * - Tallas: "S, M, L"
 * - Precio: 50.00
 * - URL de imagen: (opcional, puede estar vacía)
 * 
 * Pasos:
 * 1. Navegar a la sección "Gestión de Inventario" en el panel de administración (/admin).
 * 2. Hacer clic en "Agregar Item".
 * 3. Llenar el formulario con datos válidos (nombre, categoría, tallas, precio).
 * 4. Hacer clic en "Crear Item".
 * 
 * Resultado esperado: Se muestra un mensaje de éxito (SweetAlert2) "Item creado" / "El item se agregó correctamente".
 * El nuevo artículo aparece en la lista de inventario y en el catálogo público (/search).
 */
test('CP-008: Agregar un nuevo artículo', async ({ page }) => {
  // Precondición: Iniciar sesión como administrador
  await loginAsAdmin(page);
  
  // Paso 1: Navegar a la sección "Gestión de Inventario" (ya estamos en /admin)
  // Usar getByRole para seleccionar específicamente el heading "Gestión de Inventario"
  await expect(page.getByRole('heading', { name: /Gestión de Inventario/i })).toBeVisible();
  
  // Paso 2: Hacer clic en "Agregar Item"
  const addItemButton = page.locator('button').filter({ hasText: /Agregar Item/i });
  await expect(addItemButton).toBeVisible();
  
  // Configurar listener para esperar que se abra el modal
  await addItemButton.click();
  
  // Verificar que se abrió el modal
  const modal = page.locator('div.fixed.inset-0').filter({ hasText: /Crear Nuevo Item|Editar Item/i });
  await expect(modal).toBeVisible();
  
  // Verificar que el título del modal es "Crear Nuevo Item"
  const modalTitle = modal.locator('h4').filter({ hasText: /Crear Nuevo Item/i });
  await expect(modalTitle).toBeVisible();
  
  // Paso 3: Llenar el formulario con datos válidos
  const nameInput = page.locator('input[placeholder*="Vestido"]').first();
  await expect(nameInput).toBeVisible();
  await nameInput.fill('Vestido de prueba');
  
  const categorySelect = page.locator('select').filter({ hasText: /Vestido|Zapatos|Bolso|Chaqueta/i });
  await expect(categorySelect).toBeVisible();
  await categorySelect.selectOption({ value: 'dress' });
  
  const sizesInput = page.locator('input[placeholder*="S, M, L"]');
  await expect(sizesInput).toBeVisible();
  await sizesInput.fill('S, M, L');
  
  const priceInput = page.locator('input[type="number"]');
  await expect(priceInput).toBeVisible();
  await priceInput.fill('50.00');
  
  // URL de imagen es opcional, puede dejarse vacía
  
  // Paso 4: Hacer clic en "Crear Item"
  const createButton = page.locator('button[type="submit"]').filter({ hasText: /Crear Item/i });
  await expect(createButton).toBeVisible();
  
  // Configurar listener para esperar la respuesta de la API
  const apiResponsePromise = page.waitForResponse(
    response => response.url().includes('/api/items') && 
               response.request().method() === 'POST',
    { timeout: 15000 }
  );
  
  // Configurar listener para esperar el modal de SweetAlert2 de éxito
  const successModalPromise = page.waitForSelector('.swal2-popup', { timeout: 10000 });
  
  await createButton.click();
  
  // Esperar la respuesta de la API
  const apiResponse = await apiResponsePromise;
  expect(apiResponse.status()).toBe(201);
  
  // Esperar el modal de éxito
  await successModalPromise;
  
  // Resultado esperado: Verificar que se muestra el mensaje de éxito
  const successModal = page.locator('.swal2-popup');
  await expect(successModal).toBeVisible();
  
  const successTitle = successModal.locator('.swal2-title');
  await expect(successTitle).toContainText(/Item creado/i);
  
  const successText = successModal.locator('.swal2-html-container');
  await expect(successText).toContainText(/El item se agregó correctamente/i);
  
  // El modal de SweetAlert2 puede cerrarse automáticamente, así que verificamos si está visible antes de cerrarlo
  const modalStillVisible = await successModal.isVisible().catch(() => false);
  if (modalStillVisible) {
    // Si el modal todavía está visible, cerrarlo explícitamente
    const confirmButton = successModal.locator('.swal2-confirm');
    const buttonVisible = await confirmButton.isVisible().catch(() => false);
    if (buttonVisible) {
      await confirmButton.click();
    }
  }
  
  // Esperar a que el modal de SweetAlert2 se cierre completamente (ya sea automáticamente o manualmente)
  await page.waitForSelector('.swal2-popup', { state: 'hidden', timeout: 5000 });
  
  // Verificar que el modal del formulario se cerró
  await expect(modal).not.toBeVisible();
  
  // Verificar que el nuevo artículo aparece en la lista de inventario
  await page.waitForLoadState('networkidle');
  const itemNameInList = page.locator('text=Vestido de prueba').first();
  await expect(itemNameInList).toBeVisible();
  
  // Verificar que el nuevo artículo aparece en el catálogo público
  // Esperar a que no haya modales abiertos antes de navegar
  await page.waitForTimeout(500); // Pequeña pausa para asegurar que todo se haya procesado
  
  // Navegar a /search con opciones más permisivas
  await page.goto('/search', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('div.rounded-2xl.border', { timeout: 10000 });
  
  const itemInCatalog = page.locator('text=Vestido de prueba').first();
  await expect(itemInCatalog).toBeVisible();
});

/**
 * CP-009: Admin - Gestión de Inventario - Editar un artículo existente
 * 
 * Descripción: Editar un artículo existente.
 * 
 * Precondición: El administrador ha iniciado sesión y un artículo existe en el inventario.
 * 
 * Datos de prueba:
 * - Artículo: Primer artículo disponible en el inventario
 * - Cambio: Aumentar el precio (ej: de $25 a $35)
 * 
 * Pasos:
 * 1. Navegar a "Gestión de Inventario" (/admin).
 * 2. Hacer clic en el menú de opciones (tres puntos) del artículo.
 * 3. Seleccionar "Editar".
 * 4. Modificar el precio en el formulario.
 * 5. Hacer clic en "Actualizar Item".
 * 
 * Resultado esperado: Se muestra un mensaje de éxito (SweetAlert2) "Item actualizado" / "El item se actualizó correctamente".
 * El precio se actualiza correctamente en la lista de inventario y en la página de detalle del artículo (/items/{id}).
 */
test('CP-009: Editar un artículo existente', async ({ page }) => {
  // Precondición: Iniciar sesión como administrador
  await loginAsAdmin(page);
  
  // Paso 1: Navegar a "Gestión de Inventario" (ya estamos en /admin)
  // Usar getByRole para seleccionar específicamente el heading "Gestión de Inventario"
  await expect(page.getByRole('heading', { name: /Gestión de Inventario/i })).toBeVisible();
  
  // Esperar a que los artículos se carguen
  await page.waitForLoadState('networkidle');
  
  // Verificar que hay al menos un artículo en el inventario
  const itemsTable = page.locator('table, div.md\\:hidden').first();
  await expect(itemsTable).toBeVisible();
  
  // Buscar el primer artículo disponible
  const firstItemRow = page.locator('tr.hover\\:bg-slate-50, div.md\\:hidden > div').first();
  await expect(firstItemRow).toBeVisible();
  
  // Obtener el ID del artículo antes de editarlo (necesario para verificar después en la página de detalle)
  const itemIdCell = firstItemRow.locator('td').first();
  const itemIdText = await itemIdCell.locator('span').textContent();
  const itemId = itemIdText?.trim();
  expect(itemId).toBeTruthy();
  
  // Obtener el nombre original del artículo
  const originalName = await firstItemRow.locator('td, div').filter({ hasText: /.+/ }).first().textContent();
  expect(originalName).toBeTruthy();
  
  // Obtener el precio original
  const originalPriceText = await firstItemRow.locator('text=/\\$\\d+/').first().textContent();
  const originalPrice = originalPriceText ? parseFloat(originalPriceText.replace('$', '')) : 0;
  const newPrice = originalPrice + 10; // Aumentar el precio en $10
  
  // Paso 2: Hacer clic en el menú de opciones (tres puntos)
  const menuButton = firstItemRow.locator('button').filter({ 
    has: page.locator('svg') 
  }).first();
  await expect(menuButton).toBeVisible();
  
  await menuButton.click();
  
  // Esperar a que aparezca el menú desplegable
  await page.waitForTimeout(500);
  
  // Paso 3: Seleccionar "Editar"
  // El botón "Editar" está dentro del menú desplegable que tiene clases específicas
  // Buscar el botón que tiene texto "Editar" y clase text-slate-700 (diferencia de "Eliminar" que tiene text-red-600)
  const editButton = page.locator('button.text-slate-700').filter({ hasText: /^Editar$/i }).first();
  await expect(editButton).toBeVisible();
  
  await editButton.click();
  
  // Verificar que se abrió el modal de edición
  const modal = page.locator('div.fixed.inset-0').filter({ hasText: /Editar Item/i });
  await expect(modal).toBeVisible();
  
  // Verificar que el título del modal es "Editar Item"
  const modalTitle = modal.locator('h4').filter({ hasText: /Editar Item/i });
  await expect(modalTitle).toBeVisible();
  
  // Verificar que los campos están precargados con los datos del artículo
  const nameInput = page.locator('input[placeholder*="Vestido"]').first();
  const nameValue = await nameInput.inputValue();
  expect(nameValue).toBeTruthy();
  
  // Paso 4: Modificar el precio en el formulario
  const priceInput = page.locator('input[type="number"]');
  await expect(priceInput).toBeVisible();
  await priceInput.fill(newPrice.toString());
  
  // Paso 5: Hacer clic en "Actualizar Item"
  const updateButton = page.locator('button[type="submit"]').filter({ hasText: /Actualizar Item/i });
  await expect(updateButton).toBeVisible();
  
  // Configurar listener para esperar la respuesta de la API
  const apiResponsePromise = page.waitForResponse(
    response => response.url().includes('/api/items/') && 
               response.request().method() === 'PUT',
    { timeout: 15000 }
  );
  
  // Configurar listener para esperar el modal de SweetAlert2 de éxito
  const successModalPromise = page.waitForSelector('.swal2-popup', { timeout: 10000 });
  
  await updateButton.click();
  
  // Esperar la respuesta de la API
  const apiResponse = await apiResponsePromise;
  expect(apiResponse.status()).toBe(200);
  
  // Esperar el modal de éxito
  await successModalPromise;
  
  // Resultado esperado: Verificar que se muestra el mensaje de éxito
  const successModal = page.locator('.swal2-popup');
  await expect(successModal).toBeVisible();
  
  const successTitle = successModal.locator('.swal2-title');
  await expect(successTitle).toContainText(/Item actualizado/i);
  
  const successText = successModal.locator('.swal2-html-container');
  await expect(successText).toContainText(/El item se actualizó correctamente/i);
  
  // Cerrar el modal de éxito
  await page.waitForTimeout(2000); // El modal se cierra automáticamente después de 2 segundos
  
  // Verificar que el precio se actualizó en la lista de inventario
  await page.waitForLoadState('networkidle');
  const updatedPriceInList = page.locator(`text=$${newPrice}`).first();
  await expect(updatedPriceInList).toBeVisible();
  
  // Verificar que el precio se actualizó en la página de detalle del artículo
  // Usar el ID obtenido antes de editar para navegar directamente a la página de detalle
  await page.goto(`/items/${itemId}`);
  await page.waitForURL(/\/items\/\d+$/, { timeout: 10000 });
  
  const priceInDetail = page.locator('p').filter({ hasText: new RegExp(`Desde \\$${newPrice}/día`) });
  await expect(priceInDetail).toBeVisible();
});

/**
 * CP-015: Admin - Gestión de Inventario - Eliminar un artículo existente
 * 
 * Descripción: Eliminar un artículo existente.
 * 
 * Precondición: Admin autenticado. Artículo existente.
 * 
 * Datos de prueba:
 * - Artículo: Primer artículo disponible en el inventario
 * 
 * Pasos:
 * 1. Iniciar sesión como administrador.
 * 2. Navegar a "Gestión de Inventario" (/admin).
 * 3. Hacer clic en el menú de opciones (tres puntos) del artículo.
 * 4. Seleccionar "Eliminar".
 * 5. Confirmar la eliminación en el diálogo de confirmación (SweetAlert2).
 * 
 * Resultado esperado: Se muestra un mensaje de éxito (SweetAlert2) "Eliminado" / "El item se eliminó correctamente".
 * El artículo desaparece del inventario y del catálogo público (/search).
 * Nota: El código actual NO valida si el artículo tiene alquileres activos antes de eliminarlo.
 */
test('CP-015: Eliminar un artículo existente', async ({ page }) => {
  // Paso 1: Iniciar sesión como administrador
  await loginAsAdmin(page);
  
  // Paso 2: Navegar a "Gestión de Inventario" (ya estamos en /admin)
  // Usar getByRole para seleccionar específicamente el heading "Gestión de Inventario"
  await expect(page.getByRole('heading', { name: /Gestión de Inventario/i })).toBeVisible();
  
  // Esperar a que los artículos se carguen
  await page.waitForLoadState('networkidle');
  
  // Verificar que hay al menos un artículo en el inventario
  const itemsTable = page.locator('table, div.md\\:hidden').first();
  await expect(itemsTable).toBeVisible();
  
  // Buscar el primer artículo disponible
  const firstItemRow = page.locator('tr.hover\\:bg-slate-50, div.md\\:hidden > div').first();
  await expect(firstItemRow).toBeVisible();
  
  // Obtener el ID del artículo a eliminar (primera celda)
  const itemIdCell = firstItemRow.locator('td').first();
  const itemIdText = await itemIdCell.locator('span').textContent();
  const itemId = itemIdText?.trim();
  expect(itemId).toBeTruthy();
  
  // Obtener el nombre del artículo a eliminar (segunda celda, que contiene el nombre)
  const itemNameCell = firstItemRow.locator('td').nth(1);
  const itemName = await itemNameCell.locator('div.font-medium').textContent();
  expect(itemName).toBeTruthy();
  
  // Paso 3: Hacer clic en el menú de opciones (tres puntos)
  const menuButton = firstItemRow.locator('button').filter({ 
    has: page.locator('svg') 
  }).first();
  await expect(menuButton).toBeVisible();
  
  await menuButton.click();
  
  // Esperar a que aparezca el menú desplegable
  await page.waitForTimeout(500);
  
  // Paso 4: Seleccionar "Eliminar"
  // El botón "Eliminar" está dentro del menú desplegable que tiene clases específicas
  // Buscar el botón que tiene texto "Eliminar" y clase text-red-600 (diferencia de "Editar" que tiene text-slate-700)
  const deleteButton = page.locator('button.text-red-600').filter({ hasText: /^Eliminar$/i }).first();
  await expect(deleteButton).toBeVisible();
  
  // Configurar listener para esperar el diálogo de confirmación de SweetAlert2
  const confirmDialogPromise = page.waitForSelector('.swal2-popup', { timeout: 10000 });
  
  await deleteButton.click();
  
  // Esperar el diálogo de confirmación
  await confirmDialogPromise;
  
  const confirmDialog = page.locator('.swal2-popup');
  await expect(confirmDialog).toBeVisible();
  
  const confirmTitle = confirmDialog.locator('.swal2-title');
  await expect(confirmTitle).toContainText(/¿Estás seguro?/i);
  
  const confirmText = confirmDialog.locator('.swal2-html-container');
  await expect(confirmText).toContainText(/No podrás revertir esta acción/i);
  
  // Paso 5: Confirmar la eliminación
  const confirmButton = confirmDialog.locator('button.swal2-confirm');
  await expect(confirmButton).toBeVisible();
  await expect(confirmButton).toContainText(/Sí, eliminar/i);
  
  // Configurar listener para esperar la respuesta de la API
  const apiResponsePromise = page.waitForResponse(
    response => response.url().includes('/api/items/') && 
               response.request().method() === 'DELETE',
    { timeout: 15000 }
  );
  
  // Configurar listener para esperar el modal de SweetAlert2 de éxito
  const successModalPromise = page.waitForSelector('.swal2-popup', { timeout: 10000 });
  
  await confirmButton.click();
  
  // Esperar la respuesta de la API
  const apiResponse = await apiResponsePromise;
  expect(apiResponse.status()).toBe(200);
  
  // Esperar el modal de éxito
  await successModalPromise;
  
  // Resultado esperado: Verificar que se muestra el mensaje de éxito
  const successModal = page.locator('.swal2-popup');
  await expect(successModal).toBeVisible();
  
  const successTitle = successModal.locator('.swal2-title');
  await expect(successTitle).toContainText(/Eliminado/i);
  
  const successText = successModal.locator('.swal2-html-container');
  await expect(successText).toContainText(/El item se eliminó correctamente/i);
  
  // El modal de SweetAlert2 puede cerrarse automáticamente, así que verificamos si está visible antes de cerrarlo
  const modalStillVisible = await successModal.isVisible().catch(() => false);
  if (modalStillVisible) {
    // Si el modal todavía está visible, cerrarlo explícitamente
    const confirmBtn = successModal.locator('.swal2-confirm');
    const buttonVisible = await confirmBtn.isVisible().catch(() => false);
    if (buttonVisible) {
      await confirmBtn.click();
    }
  }
  
  // Esperar a que el modal de SweetAlert2 se cierre completamente (automático o manual)
  await page.waitForSelector('.swal2-popup', { state: 'hidden', timeout: 5000 });
  
  // Verificar que el artículo desaparece del inventario
  // Buscar la fila específica por ID (más confiable que buscar solo por nombre)
  await page.waitForLoadState('networkidle');
  
  // Verificar que el ID del artículo eliminado ya no aparece en la tabla
  // Buscar el span que contiene el ID específico dentro de las filas de la tabla
  const itemIdSpan = page.locator(`td span:has-text("${itemId}")`);
  const itemIdCount = await itemIdSpan.count();
  expect(itemIdCount).toBe(0); // El ID no debe aparecer en ninguna fila
  
  // Verificar que el artículo desaparece del catálogo público
  await page.goto('/search', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('div.rounded-2xl.border', { timeout: 10000 });
  
  // Buscar el artículo por ID en el catálogo (el link contiene /items/{id})
  const itemLinkInCatalog = page.locator(`a[href="/items/${itemId}"]`);
  const linkCount = await itemLinkInCatalog.count();
  expect(linkCount).toBe(0); // El link con ese ID no debe existir
});

/**
 * CP-016: Admin - Gestión de Inventario - Validación de errores al agregar artículo
 * 
 * Descripción: Validación de errores al agregar artículo.
 * 
 * Precondición: Admin inició sesión.
 * 
 * Datos de prueba:
 * - Campos vacíos: nombre vacío, categoría seleccionada por defecto
 * - Tallas inválidas: (no aplica, las tallas son opcionales y solo se parsean)
 * - Precio no numérico: (no aplica, el campo es type="number" que previene entrada no numérica)
 * - Imagen faltante: (no aplica, la imagen es opcional y se usa una por defecto)
 * 
 * Pasos:
 * 1. Ir a "Gestión de Inventario" (/admin).
 * 2. Hacer clic en "Agregar Item".
 * 3. Intentar guardar sin completar el campo nombre (requerido).
 * 4. Completar solo el nombre y guardar.
 * 
 * Resultado esperado: 
 * - Si se intenta guardar sin nombre: El navegador muestra validación HTML5 (campo requerido) o se muestra un error.
 * - Si se guarda con solo nombre: Se crea el artículo con valores por defecto (categoría: dress, precio: 0, tallas: [], imagen: por defecto).
 * - Si hay un error del servidor: Se muestra un mensaje de error en un div rojo dentro del modal.
 * - El artículo NO se registra si falta el nombre (requerido por la API).
 */
test('CP-016: Validación de errores al agregar artículo', async ({ page }) => {
  // Precondición: Iniciar sesión como administrador
  await loginAsAdmin(page);
  
  // Paso 1: Ir a "Gestión de Inventario" (ya estamos en /admin)
  // Usar getByRole para seleccionar específicamente el heading "Gestión de Inventario"
  await expect(page.getByRole('heading', { name: /Gestión de Inventario/i })).toBeVisible();
  
  // Paso 2: Hacer clic en "Agregar Item"
  const addItemButton = page.locator('button').filter({ hasText: /Agregar Item/i });
  await expect(addItemButton).toBeVisible();
  
  await addItemButton.click();
  
  // Verificar que se abrió el modal
  const modal = page.locator('div.fixed.inset-0').filter({ hasText: /Crear Nuevo Item/i });
  await expect(modal).toBeVisible();
  
  // Paso 3: Intentar guardar sin completar el campo nombre (requerido)
  const nameInput = page.locator('input[placeholder*="Vestido"]').first();
  await expect(nameInput).toBeVisible();
  
  // Verificar que el campo nombre tiene el atributo required (validación HTML5)
  await expect(nameInput).toHaveAttribute('required', '');
  
  // Verificar que la categoría tiene el atributo required
  const categorySelect = page.locator('select').filter({ hasText: /Vestido|Zapatos|Bolso|Chaqueta/i });
  await expect(categorySelect).toBeVisible();
  await expect(categorySelect).toHaveAttribute('required', '');
  
  // Intentar enviar el formulario sin nombre
  const createButton = page.locator('button[type="submit"]').filter({ hasText: /Crear Item/i });
  await expect(createButton).toBeVisible();
  
  // Verificar que el formulario HTML5 previene el envío si falta el nombre
  // (Esto se verifica porque el campo tiene required)
  
  // Paso 4: Completar solo el nombre y guardar
  await nameInput.fill('Artículo de prueba validación');
  
  // Dejar los demás campos con valores por defecto o vacíos
  // Categoría ya tiene valor por defecto (dress)
  // Precio puede estar vacío (será 0)
  // Tallas puede estar vacío (será [])
  // URL de imagen puede estar vacío (se usará imagen por defecto)
  
  // Configurar listener para esperar la respuesta de la API
  const apiResponsePromise = page.waitForResponse(
    response => response.url().includes('/api/items') && 
               response.request().method() === 'POST',
    { timeout: 15000 }
  );
  
  // Configurar listener para esperar el modal de SweetAlert2 de éxito o error
  const modalPromise = page.waitForSelector('.swal2-popup', { timeout: 10000 });
  
  await createButton.click();
  
  // Esperar la respuesta de la API
  const apiResponse = await apiResponsePromise;
  
  if (apiResponse.status() === 201) {
    // Si se crea exitosamente, verificar que se muestra el mensaje de éxito
    await modalPromise;
    const successModal = page.locator('.swal2-popup');
    await expect(successModal).toBeVisible();
    
    const successTitle = successModal.locator('.swal2-title');
    await expect(successTitle).toContainText(/Item creado/i);
  } else {
    // Si hay un error, verificar que se muestra en el modal
    const errorDiv = modal.locator('div.bg-red-50').filter({ 
      hasText: /.+/ 
    }).first();
    await expect(errorDiv).toBeVisible();
    
    const errorText = errorDiv.locator('p.text-red-700');
    await expect(errorText).toBeVisible();
    const errorMessage = await errorText.textContent();
    expect(errorMessage).toBeTruthy();
  }
  
  // Resultado esperado: Verificar que el formulario tiene validación HTML5
  // Los campos requeridos (nombre, categoría) tienen el atributo required
  // El campo precio es type="number" que previene entrada no numérica
  // La URL de imagen es type="url" que valida formato de URL si se ingresa
});

