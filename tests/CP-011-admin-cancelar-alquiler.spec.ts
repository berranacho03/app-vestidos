import { test, expect } from '@playwright/test';

/**
 * CP-011: Admin: Gestión de Alquileres
 * 
 * Descripción: Cancelar un alquiler.
 * 
 * Precondición: Un alquiler ha sido registrado.
 * 
 * Datos de prueba:
 * - Solicitud de alquiler de Ana Pérez
 * 
 * Pasos:
 * 1. Acceder al panel de administración.
 * 2. En la lista de "Alquileres", localizar la solicitud de Ana Pérez.
 * 3. Hacer clic en "Cancelar Alquiler".
 * 
 * Resultado esperado: El alquiler se elimina de la lista y las fechas del artículo 
 * vuelven a estar disponibles en el calendario.
 */
test('CP-011: Cancelar un alquiler como administrador', async ({ page }) => {
  // Paso 1: Acceder al panel de administración
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
  
  // Paso 2: En la lista de "Alquileres", localizar la solicitud de Ana Pérez
  const rentalsSection = page.locator('text=/Alquileres programados|Alquileres/i');
  await expect(rentalsSection).toBeVisible();
  
  // Esperar a que la tabla de alquileres se cargue
  await page.waitForSelector('table, div.rounded-2xl.border', { timeout: 10000 });
  
  // Buscar la solicitud de Ana Pérez
  let anaPerezRow = page.locator('text=/Ana Pérez|ana pérez/i').first();
  const anaPerezExists = await anaPerezRow.isVisible().catch(() => false);
  
  if (!anaPerezExists) {
    // Si no existe Ana Pérez, buscar el primer alquiler disponible
    const rentalsTable = page.locator('table').filter({ has: page.locator('text=/ID Alquiler|Artículo/i') });
    const rentalsCards = page.locator('div.rounded-2xl.border').filter({ has: page.locator('text=/alquiler|rental/i') });
    
    const hasTable = await rentalsTable.count() > 0;
    const hasCards = await rentalsCards.count() > 0;
    
    if (hasTable) {
      const firstRow = rentalsTable.locator('tbody tr').first();
      anaPerezRow = firstRow;
    } else if (hasCards) {
      anaPerezRow = rentalsCards.first();
    } else {
      // Si no hay alquileres, el test no puede continuar
      throw new Error('No hay alquileres disponibles para cancelar');
    }
  }
  
  // Obtener información del alquiler antes de cancelarlo
  // Obtener el ID del artículo asociado
  let itemId: string | null = null;
  const articleInfo = anaPerezRow.locator('text=/Artículo #|Item #/i');
  const articleInfoExists = await articleInfo.count() > 0;
  
  if (articleInfoExists) {
    const articleText = await articleInfo.textContent();
    const match = articleText?.match(/#(\d+)/);
    if (match) {
      itemId = match[1];
    }
  }
  
  // Obtener las fechas del alquiler
  let rentalStartDate: string | null = null;
  let rentalEndDate: string | null = null;
  const datesText = anaPerezRow.locator('text=/\\d{4}-\\d{2}-\\d{2}/');
  const datesCount = await datesText.count();
  
  if (datesCount >= 2) {
    rentalStartDate = await datesText.nth(0).textContent();
    rentalEndDate = await datesText.nth(1).textContent();
  }
  
  // Paso 3: Hacer clic en "Cancelar Alquiler"
  // Buscar el botón de cancelar
  const cancelButton = anaPerezRow.locator('button:has-text("Cancelar"), button:has-text("Cancelar Alquiler"), text=/Cancelar/i').first();
  
  // Si no encontramos el botón directamente, puede estar en un componente
  const cancelButtonExists = await cancelButton.count() > 0;
  
  if (!cancelButtonExists) {
    // Buscar cualquier botón de cancelar en la fila
    const anyCancelButton = anaPerezRow.locator('button').filter({ hasText: /cancelar|cancel/i });
    if (await anyCancelButton.count() > 0) {
      await anyCancelButton.first().click();
    } else {
      throw new Error('No se encontró el botón de cancelar alquiler');
    }
  } else {
    await cancelButton.click();
  }
  
  // Esperar a que aparezca el modal de confirmación (SweetAlert2)
  await page.waitForSelector('.swal2-popup', { timeout: 5000 });
  
  const confirmModal = page.locator('.swal2-popup').filter({ hasText: /estás seguro|seguro|confirmar/i });
  await expect(confirmModal).toBeVisible();
  
  // Confirmar la cancelación
  const confirmButton = confirmModal.locator('button.swal2-confirm, button:has-text("Sí"), button:has-text("Confirmar")');
  await expect(confirmButton).toBeVisible();
  await confirmButton.click();
  
  // Esperar a que se procese la cancelación
  await page.waitForTimeout(1000);
  
  // Verificar que se muestra un mensaje de éxito
  const successModal = page.locator('.swal2-popup').filter({ hasText: /cancelado|éxito|success/i });
  const successVisible = await successModal.isVisible().catch(() => false);
  
  if (successVisible) {
    const successTitle = await successModal.locator('.swal2-title, h2').textContent().catch(() => '');
    expect(successTitle?.toLowerCase()).toMatch(/cancelado|éxito|success/i);
    
    // Cerrar el modal de éxito
    const confirmBtn = successModal.locator('.swal2-confirm, button.swal2-styled').first();
    if (await confirmBtn.isVisible().catch(() => false)) {
      await confirmBtn.click();
      await page.waitForTimeout(500);
    }
  }
  
  // Resultado esperado: Verificar que el alquiler se elimina de la lista
  // Esperar a que la lista se actualice
  await page.waitForTimeout(1000);
  
  // Verificar que Ana Pérez ya no aparece en la lista (o que el alquiler fue cancelado)
  const anaPerezAfterCancel = page.locator('text=/Ana Pérez|ana pérez/i');
  const stillExists = await anaPerezAfterCancel.isVisible().catch(() => false);
  
  // El alquiler puede seguir apareciendo pero con estado "Cancelado"
  if (stillExists) {
    // Verificar que el estado cambió a "Cancelado"
    const canceledStatus = anaPerezRow.locator('text=/Cancelado|canceled/i');
    const isCanceled = await canceledStatus.isVisible().catch(() => false);
    expect(isCanceled).toBeTruthy();
  }
  
  // Verificar que las fechas del artículo vuelven a estar disponibles en el calendario
  if (itemId && rentalStartDate && rentalEndDate) {
    // Navegar a la página de detalle del artículo
    await page.goto(`/items/${itemId}`);
    await page.waitForURL(/\/items\/\d+$/);
    
    // Esperar a que el calendario se cargue
    await page.waitForTimeout(1000);
    
    const calendar = page.locator('div.grid.grid-cols-7');
    await expect(calendar).toBeVisible();
    
    // Esperar a que las fechas reservadas se carguen desde la API
    await page.waitForResponse(
      response => response.url().includes('/availability') && response.status() === 200
    ).catch(() => {
      console.log('No se recibió respuesta de la API de disponibilidad');
    });
    
    await page.waitForTimeout(500);
    
    // Verificar que las fechas que estaban reservadas ahora están disponibles
    // Buscar las celdas del calendario para esas fechas
    const startDateCell = calendar.locator(`div[title="${rentalStartDate}"]`);
    const endDateCell = calendar.locator(`div[title="${rentalEndDate}"]`);
    
    const startCellExists = await startDateCell.count() > 0;
    const endCellExists = await endDateCell.count() > 0;
    
    if (startCellExists) {
      // Verificar que la fecha no está marcada como reservada
      const startCellText = await startDateCell.textContent();
      const startCellClasses = await startDateCell.getAttribute('class');
      
      // No debería tener "Reservado" ni clases de fecha reservada
      expect(startCellText).not.toContain('Reservado');
      expect(startCellClasses).not.toContain('cursor-not-allowed');
    }
    
    if (endCellExists) {
      // Verificar que la fecha no está marcada como reservada
      const endCellText = await endDateCell.textContent();
      const endCellClasses = await endDateCell.getAttribute('class');
      
      // No debería tener "Reservado" ni clases de fecha reservada
      expect(endCellText).not.toContain('Reservado');
      expect(endCellClasses).not.toContain('cursor-not-allowed');
    }
  }
});




