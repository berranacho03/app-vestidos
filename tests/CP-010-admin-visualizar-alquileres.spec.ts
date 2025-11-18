import { test, expect } from '@playwright/test';

/**
 * CP-010: Admin: Gestión de Alquileres
 * 
 * Descripción: Visualización de alquileres programados.
 * 
 * Precondición: Existen solicitudes de alquiler en la base de datos.
 * 
 * Datos de prueba:
 * - N/A
 * 
 * Pasos:
 * 1. Iniciar sesión como administrador.
 * 2. Navegar a la sección de "Alquileres".
 * 
 * Resultado esperado: Se muestra una lista completa con los detalles de todas las 
 * solicitudes de alquiler.
 */
test('CP-010: Visualizar alquileres programados como administrador', async ({ page }) => {
  // Paso 1: Iniciar sesión como administrador
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
  
  // Paso 2: Navegar a la sección de "Alquileres"
  // La sección de alquileres debería estar visible en el panel de administración
  const rentalsSection = page.locator('text=/Alquileres programados|Alquileres/i');
  await expect(rentalsSection).toBeVisible();
  
  // Esperar a que la tabla de alquileres se cargue
  await page.waitForSelector('table, div.rounded-2xl.border', { timeout: 10000 });
  
  // Resultado esperado: Verificar que se muestra una lista completa con los detalles
  // Verificar que hay una tabla o lista de alquileres
  const rentalsTable = page.locator('table').filter({ has: page.locator('text=/ID Alquiler|Artículo|Fechas|Cliente|Estado/i') });
  const rentalsCards = page.locator('div.rounded-2xl.border').filter({ has: page.locator('text=/alquiler|rental/i') });
  
  const hasTable = await rentalsTable.count() > 0;
  const hasCards = await rentalsCards.count() > 0;
  
  expect(hasTable || hasCards).toBeTruthy();
  
  // Verificar que se muestran las columnas/campos esperados
  if (hasTable) {
    // Verificar encabezados de la tabla
    await expect(rentalsTable.locator('text=/ID Alquiler/i')).toBeVisible();
    await expect(rentalsTable.locator('text=/Artículo/i')).toBeVisible();
    await expect(rentalsTable.locator('text=/Fechas/i')).toBeVisible();
    await expect(rentalsTable.locator('text=/Cliente/i')).toBeVisible();
    await expect(rentalsTable.locator('text=/Estado/i')).toBeVisible();
    await expect(rentalsTable.locator('text=/Acciones/i')).toBeVisible();
    
    // Verificar que hay filas de datos (si hay alquileres)
    const rows = rentalsTable.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      // Verificar que cada fila tiene los detalles esperados
      for (let i = 0; i < Math.min(rowCount, 3); i++) {
        const row = rows.nth(i);
        
        // Verificar que tiene ID de alquiler
        const rentalId = row.locator('span, div').filter({ hasText: /#/ });
        const hasRentalId = await rentalId.count() > 0;
        
        // Verificar que tiene información del artículo
        const articleInfo = row.locator('text=/Artículo #|Item #/i');
        const hasArticleInfo = await articleInfo.count() > 0;
        
        // Verificar que tiene fechas
        const dates = row.locator('text=/\\d{4}-\\d{2}-\\d{2}|→/');
        const hasDates = await dates.count() > 0;
        
        // Verificar que tiene información del cliente
        const customerInfo = row.locator('text=/@|\\d{3}/');
        const hasCustomerInfo = await customerInfo.count() > 0;
        
        // Verificar que tiene estado
        const status = row.locator('span, div').filter({ hasText: /Activo|Cancelado|active|canceled/i });
        const hasStatus = await status.count() > 0;
        
        // Al menos algunos de estos elementos deberían estar presentes
        expect(hasRentalId || hasArticleInfo || hasDates || hasCustomerInfo || hasStatus).toBeTruthy();
      }
    } else {
      // Si no hay alquileres, verificar que se muestra un mensaje apropiado
      const emptyMessage = page.locator('text=/No hay alquileres|alquileres aparecerán/i');
      await expect(emptyMessage).toBeVisible();
    }
  } else if (hasCards) {
    // Verificar vista de cards (móvil)
    const firstCard = rentalsCards.first();
    await expect(firstCard).toBeVisible();
    
    // Verificar que las cards tienen información básica
    const cardHasInfo = await firstCard.locator('text=/alquiler|rental|fecha|cliente/i').count() > 0;
    expect(cardHasInfo).toBeTruthy();
  }
  
  // Verificar que se muestra el contador total de alquileres
  const totalCount = page.locator('text=/Total alquileres/i');
  const countVisible = await totalCount.isVisible().catch(() => false);
  
  if (countVisible) {
    // Verificar que hay un número asociado
    const countNumber = totalCount.locator('..').locator('div').filter({ hasText: /^\d+$/ }).first();
    const hasCountNumber = await countNumber.count() > 0;
    expect(hasCountNumber).toBeTruthy();
  }
});




