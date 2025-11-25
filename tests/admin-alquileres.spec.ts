import { test, expect } from '@playwright/test';

/**
 * Módulo: Admin - Gestión de Alquileres
 * 
 * Este archivo contiene los casos de prueba relacionados con la gestión de alquileres por parte del administrador:
 * - CP-010: Visualización de alquileres programados (con filtro por estado "Confirmado")
 * - CP-011: Cancelar un alquiler
 * - CP-012: Confirmación de una solicitud de alquiler (Aprobar)
 * - CP-013: Rechazar un alquiler pendiente
 * - CP-014: Eliminación permanente de una solicitud
 */

// Helper para login de admin
async function loginAsAdmin(page: any) {
  await page.goto('/admin/login');

  const usernameInput = page.locator('input[name="username"]');
  const passwordInput = page.locator('input[name="password"]');
  const submitButton = page.locator('button[type="submit"]');

  await usernameInput.fill(process.env.ADMIN_USERNAME || 'admin');
  await passwordInput.fill(process.env.ADMIN_PASSWORD || 'admin123');

  await expect(submitButton).toBeEnabled();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponsePromise = page.waitForResponse(
    (response: any) => response.url().includes('/api/admin/login') &&
      response.request().method() === 'POST',
    { timeout: 15000 }
  );

  await submitButton.click();

  const apiResponse = await apiResponsePromise;
  expect(apiResponse.status()).toBe(200);
  expect(apiResponse.ok()).toBe(true);

  await page.waitForURL(/\/admin$/, { timeout: 10000 });
}

// Helper para crear un alquiler pendiente si no existe
async function ensurePendingRentalExists(page: any) {
  // Primero, ir al panel de admin y verificar si hay alquileres pendientes
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  
  const rentalsTable = page.locator('table').filter({
    has: page.locator('th:has-text("ID Alquiler")')
  }).first();

  const pendingRentalRow = rentalsTable.locator('tbody tr').filter({
    hasText: /Pendiente/i
  }).first();

  const pendingCount = await pendingRentalRow.count();

  // Si ya existe un alquiler pendiente, no hacer nada
  if (pendingCount > 0) {
    return;
  }

  // Si no existe, crear uno mediante el formulario web
  // 1. Buscar un artículo disponible
  await page.goto('/search');
  await page.waitForLoadState('networkidle');
  
  // Buscar el primer artículo disponible y obtener su URL
  const articleLink = page.locator('a[href^="/items/"]').first();
  const articleHref = await articleLink.getAttribute('href');
  expect(articleHref).toMatch(/^\/items\/\d+$/);
  
  // Ir al detalle del artículo usando page.goto() directamente para mayor confiabilidad
  await page.goto(articleHref || '/search');
  await page.waitForLoadState('networkidle');
  
  // Esperar a que el formulario esté visible
  await expect(page.locator('form')).toBeVisible();
  await page.waitForTimeout(1000);
  
  // 2. Completar el formulario de alquiler
  const nameInput = page.locator('input[name="name"][type="text"]');
  const nameInputVisible = await nameInput.count() > 0 && await nameInput.isVisible().catch(() => false);
  
  if (nameInputVisible) {
    await nameInput.fill('Ana Pérez');
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('ana@mail.com');
    const phoneInput = page.locator('input[name="phone"]');
    await phoneInput.fill('12345678');
  }
  
  // Seleccionar fechas futuras disponibles
  // Usar fechas muy futuras para evitar conflictos (60+ días en el futuro)
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 60); // 60 días en el futuro
  const endFutureDate = new Date(futureDate);
  endFutureDate.setDate(futureDate.getDate() + 2); // 2 días después
  
  const startDate = futureDate.toISOString().split('T')[0];
  const endDate = endFutureDate.toISOString().split('T')[0];
  
  const startInput = page.locator('input[name="start"]');
  await startInput.fill(startDate);
  
  const endInput = page.locator('input[name="end"]');
  await endInput.fill(endDate);
  
  // Esperar un momento para que los inputs se actualicen
  await page.waitForTimeout(500);
  
  // 3. Enviar el formulario (el CSRF token ya está en el formulario como campo hidden)
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeEnabled();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponsePromise = page.waitForResponse(
    (response: any) => response.url().includes('/api/rentals') &&
      response.request().method() === 'POST',
    { timeout: 15000 }
  );
  
  await submitButton.click();
  
  const apiResponse = await apiResponsePromise;
  
  // Si recibimos 409 (conflicto), significa que las fechas ya están ocupadas
  // En ese caso, intentar con fechas aún más futuras
  if (apiResponse.status() === 409) {
    // Limpiar los inputs y probar con fechas más futuras
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 90); // 90 días en el futuro
    const endFutureDate = new Date(futureDate);
    endFutureDate.setDate(futureDate.getDate() + 2);
    
    const newStartDate = futureDate.toISOString().split('T')[0];
    const newEndDate = endFutureDate.toISOString().split('T')[0];
    
    const startInput = page.locator('input[name="start"]');
    await startInput.fill(newStartDate);
    
    const endInput = page.locator('input[name="end"]');
    await endInput.fill(newEndDate);
    await page.waitForTimeout(500);
    
    // Reintentar el envío
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const retryApiResponsePromise = page.waitForResponse(
      (response: any) => response.url().includes('/api/rentals') &&
        response.request().method() === 'POST',
      { timeout: 15000 }
    );
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    const retryApiResponse = await retryApiResponsePromise;
    expect(retryApiResponse.status()).toBe(200);
  } else {
    expect(apiResponse.status()).toBe(200);
  }

  // Esperar el modal de confirmación
  await page.waitForSelector('.swal2-popup', { timeout: 10000 });
  const successModal = page.locator('.swal2-popup');
  await expect(successModal).toBeVisible();
  
  // Cerrar el modal
  const confirmButton = successModal.locator('.swal2-confirm');
  if (await confirmButton.count() > 0) {
    await confirmButton.click();
    await page.waitForTimeout(1000);
  }
}

/**
 * CP-010: Admin - Gestión de Alquileres - Visualización de alquileres programados
 * 
 * Descripción: Visualización de alquileres programados con filtro por estado "Confirmado".
 * 
 * Precondición: Existen solicitudes de alquiler en la base de datos.
 * 
 * Pasos:
 * 1. Iniciar sesión como administrador (CP-019).
 * 2. Navegar a la sección de "Alquileres programados".
 * 3. Filtrar por estado "Confirmado" (que corresponde a "Activo" en el código).
 * 
 * Resultado esperado: Se muestra una lista completa con los detalles de todas las solicitudes de alquiler.
 * El filtrado por estado "Confirmado" solo muestra las solicitudes confirmadas (activas).
 * 
 * Nota: Si la UI no tiene filtro implementado, el test verificará que se muestran todos los alquileres
 * y que existen alquileres con estado "Activo" (Confirmado).
 */
test('CP-010: Visualización de alquileres programados', async ({ page }) => {
  // Paso 1: Iniciar sesión como administrador
  await loginAsAdmin(page);

  // Paso 2: Navegar a la sección de "Alquileres programados" (ya estamos en /admin)
  const rentalsHeading = page.getByRole('heading', { name: /Alquileres programados/i });
  await expect(rentalsHeading).toBeVisible();

  // Esperar a que la tabla se cargue
  await page.waitForLoadState('networkidle');

  // Paso 3: Verificar que se muestra la lista completa de alquileres
  // Buscar la tabla de alquileres específicamente (no la tabla de inventario)
  const rentalsTable = page.locator('table').filter({
    has: page.locator('th:has-text("ID Alquiler")')
  }).first();

  await expect(rentalsTable).toBeVisible();

  // Verificar que se muestra el contador total de alquileres
  const totalRentals = page.locator('text=/Total alquileres/i');
  await expect(totalRentals).toBeVisible();

  // Verificar que la tabla tiene las columnas esperadas
  const tableHead = rentalsTable.locator('thead');
  await expect(tableHead.locator('th').filter({ hasText: /^ID Alquiler$/i }).first()).toBeVisible();
  await expect(tableHead.locator('th').filter({ hasText: /^Artículo$/i }).first()).toBeVisible();
  await expect(tableHead.locator('th').filter({ hasText: /^Fechas$/i }).first()).toBeVisible();
  await expect(tableHead.locator('th').filter({ hasText: /^Cliente$/i }).first()).toBeVisible();
  await expect(tableHead.locator('th').filter({ hasText: /^Estado$/i }).first()).toBeVisible();
  await expect(tableHead.locator('th').filter({ hasText: /^Acciones$/i }).first()).toBeVisible();

  // Verificar que existen alquileres con estado "Activo" (Confirmado)
  // Buscar al menos un alquiler con estado "Activo"
  const activeRentals = rentalsTable.locator('tbody tr').filter({
    hasText: /Activo/i
  });

  const activeCount = await activeRentals.count();

  // Si hay alquileres activos, verificar que se muestran correctamente
  if (activeCount > 0) {
    const firstActiveRental = activeRentals.first();
    await expect(firstActiveRental).toBeVisible();

    // Verificar que muestra el estado "Activo"
    const statusBadge = firstActiveRental.locator('span').filter({ hasText: /^Activo$/i });
    await expect(statusBadge.first()).toBeVisible();
  }

  // Verificar que al menos hay una fila de alquiler o el mensaje de "No hay alquileres"
  const rentalRows = rentalsTable.locator('tbody tr');
  const hasRentals = await rentalRows.count();
  const noRentalsMessage = rentalsTable.locator('text=/No hay alquileres programados/i');

  if (hasRentals > 0) {
    // Verificar que cada fila muestra los detalles necesarios
    const firstRentalRow = rentalRows.first();
    await expect(firstRentalRow).toBeVisible();

    // Verificar que muestra el ID del alquiler
    const rentalId = firstRentalRow.locator('span.text-fuchsia-600, span.bg-fuchsia-100');
    await expect(rentalId.first()).toBeVisible();
  } else {
    await expect(noRentalsMessage).toBeVisible();
  }
});

/**
 * CP-011: Admin - Gestión de Alquileres - Cancelar un alquiler
 * 
 * Descripción: Cancelar un alquiler.
 * 
 * Precondición: Un alquiler ha sido registrado (en estado "pending" o "active").
 * 
 * Datos de prueba:
 * - Solicitud de alquiler existente (estado Pendiente o Activo)
 * 
 * Pasos:
 * 1. Acceder al panel de administración.
 * 2. Localizar una solicitud de alquiler (estado Pendiente o Activo).
 * 3. Hacer clic en el menú de opciones (tres puntos).
 * 4. Hacer clic en "Cancelar Alquiler".
 * 5. Confirmar la cancelación.
 * 
 * Resultado esperado: El alquiler cambia a estado "Cancelado". Las fechas del artículo vuelven a estar disponibles
 * en el calendario para un nuevo alquiler.
 */
test('CP-011: Cancelar un alquiler', async ({ page }) => {
  // Paso 1: Acceder al panel de administración
  await loginAsAdmin(page);

  // Paso 2: Localizar una solicitud de alquiler (estado Pendiente o Activo)
  await expect(page.getByRole('heading', { name: /Alquileres programados/i })).toBeVisible();
  await page.waitForLoadState('networkidle');

  // Buscar la tabla de alquileres
  const rentalsTable = page.locator('table').filter({
    has: page.locator('th:has-text("ID Alquiler")')
  }).first();

  // Buscar un alquiler en estado "Pendiente" o "Activo"
  const rentalRow = rentalsTable.locator('tbody tr').filter({
    hasText: /Pendiente|Activo/i
  }).first();

  const rentalCount = await rentalRow.count();

  if (rentalCount === 0) {
    test.skip();
    return;
  }

  await expect(rentalRow).toBeVisible();

  // Obtener el ID completo del alquiler para verificar después
  const rentalIdCell = rentalRow.locator('td').first();
  const rentalIdHashText = await rentalIdCell.locator('span.text-slate-600').textContent();
  const rentalIdHash = rentalIdHashText?.trim() || ''; // Ej: "#5eeb6bc5"
  expect(rentalIdHash).toMatch(/^#[\da-f]{8}$/i);

  // Paso 3: Hacer clic en el menú de opciones (tres puntos)
  const menuButton = rentalRow.locator('button').filter({
    has: page.locator('svg')
  }).first();
  await expect(menuButton).toBeVisible();

  await menuButton.click();

  // Esperar a que aparezca el menú desplegable
  await page.waitForTimeout(500);

  // Paso 4: Hacer clic en "Cancelar Alquiler"
  const cancelButton = page.locator('button').filter({ hasText: /^Cancelar$/i }).first();
  await expect(cancelButton).toBeVisible();

  // Configurar listener para esperar el diálogo de confirmación de SweetAlert2
  const confirmDialogPromise = page.waitForSelector('.swal2-popup', { timeout: 10000 });

  await cancelButton.click();

  // Esperar el diálogo de confirmación
  await confirmDialogPromise;

  const confirmDialog = page.locator('.swal2-popup');
  await expect(confirmDialog).toBeVisible();

  const confirmTitle = confirmDialog.locator('.swal2-title');
  await expect(confirmTitle).toContainText(/¿Estás seguro?/i);

  // Paso 5: Confirmar la cancelación
  const confirmButton = confirmDialog.locator('button.swal2-confirm');
  await expect(confirmButton).toBeVisible();
  await expect(confirmButton).toContainText(/Sí, cancelar/i);

  // Configurar listener para esperar la respuesta de la API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponsePromise = page.waitForResponse(
    (response: any) => {
      const url = response.url();
      const method = response.request().method();
      return url.includes(`/api/admin/rentals/`) &&
        method === 'POST' &&
        !url.includes('/approve');
    },
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

  // Verificar que se muestra el mensaje de éxito
  const successModal = page.locator('.swal2-popup');
  await expect(successModal).toBeVisible();

  const successTitle = successModal.locator('.swal2-title');
  await expect(successTitle).toContainText(/Cancelado/i);

  // Esperar a que la página se recargue
  await page.waitForTimeout(3000);
  await page.waitForURL(/\/admin$/, { timeout: 10000 });
  await expect(page.getByRole('heading', { name: /Alquileres programados/i })).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1000);

  // Verificar que el alquiler cambió a estado "Cancelado"
  const rentalsTableAfterReload = page.locator('table').filter({
    has: page.locator('th:has-text("ID Alquiler")')
  }).first();

  const hashWithoutHash = rentalIdHash.replace('#', '');
  const canceledRentalRow = rentalsTableAfterReload.locator('tbody tr').filter({
    hasText: hashWithoutHash
  }).first();

  await expect(canceledRentalRow).toBeVisible({ timeout: 10000 });

  // Buscar el badge de estado en la celda de estado (5ta columna, índice 4)
  const statusCell = canceledRentalRow.locator('td').nth(4);
  const statusBadge = statusCell.locator('span').filter({ hasText: /^Cancelado$/i });
  await expect(statusBadge.first()).toBeVisible({ timeout: 5000 });
});

/**
 * CP-012: Admin - Gestión de Alquileres - Confirmación de una solicitud de alquiler
 * 
 * Descripción: Confirmación de una solicitud de alquiler (Aprobar).
 * 
 * Precondición: Existe un alquiler en estado Pendiente. El administrador ha iniciado sesión.
 * 
 * Datos de prueba:
 * - Solicitud: Ana Pérez, Vestido #01, Fechas disponibles
 * 
 * Pasos:
 * 1. Iniciar sesión.
 * 2. Navegar a "Alquileres programados".
 * 3. Seleccionar la solicitud pendiente.
 * 4. Hacer clic en "Aprobar" (Confirmar Alquiler).
 * 5. Verificar el estado en la tabla.
 * 
 * Resultado esperado: La solicitud cambia a estado "Activo" (Confirmado). En el calendario, las fechas quedan 
 * marcadas como reservadas/no disponibles y en la tabla de alquileres se muestra el nuevo estado.
 */
test('CP-012: Confirmación de una solicitud de alquiler', async ({ page }) => {
  // Paso 1: Iniciar sesión
  await loginAsAdmin(page);

  // Asegurar que existe un alquiler pendiente antes de continuar
  await ensurePendingRentalExists(page);

  // Volver al panel de admin
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');

  // Paso 2: Navegar a "Alquileres programados"
  await expect(page.getByRole('heading', { name: /Alquileres programados/i })).toBeVisible();
  await page.waitForLoadState('networkidle');

  // Paso 3: Seleccionar la solicitud pendiente
  const rentalsTable = page.locator('table').filter({
    has: page.locator('th:has-text("ID Alquiler")')
  }).first();

  const pendingRentalRow = rentalsTable.locator('tbody tr').filter({
    hasText: /Pendiente/i
  }).first();

  const rentalCount = await pendingRentalRow.count();

  // Ahora debe existir al menos un alquiler pendiente
  expect(rentalCount).toBeGreaterThan(0);

  await expect(pendingRentalRow).toBeVisible();

  // Obtener el ID completo del alquiler
  const rentalIdCell = pendingRentalRow.locator('td').first();
  const rentalIdHashText = await rentalIdCell.locator('span.text-slate-600').textContent();
  const rentalIdHash = rentalIdHashText?.trim() || '';

  // Paso 4: Hacer clic en el menú de opciones
  const menuButton = pendingRentalRow.locator('button').filter({
    has: page.locator('svg')
  }).first();
  await expect(menuButton).toBeVisible();

  await menuButton.click();

  // Esperar a que aparezca el menú desplegable
  await page.waitForTimeout(500);

  // Hacer clic en "Aprobar" (Confirmar Alquiler)
  const approveButton = page.locator('button').filter({ hasText: /^Aprobar$/i }).first();
  await expect(approveButton).toBeVisible();

  // Configurar listener para esperar el diálogo de confirmación
  const confirmDialogPromise = page.waitForSelector('.swal2-popup', { timeout: 10000 });

  await approveButton.click();

  // Esperar el diálogo de confirmación
  await confirmDialogPromise;

  const confirmDialog = page.locator('.swal2-popup');
  await expect(confirmDialog).toBeVisible();

  const confirmTitle = confirmDialog.locator('.swal2-title');
  await expect(confirmTitle).toContainText(/¿Aprobar este alquiler?/i);

  // Confirmar la aprobación
  const confirmButton = confirmDialog.locator('button.swal2-confirm');
  await expect(confirmButton).toBeVisible();
  await expect(confirmButton).toContainText(/Sí, aprobar/i);

  // Configurar listener para esperar la respuesta de la API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponsePromise = page.waitForResponse(
    (response: any) => {
      const url = response.url();
      const method = response.request().method();
      return url.includes(`/api/admin/rentals/`) &&
        method === 'POST' &&
        url.includes('/approve');
    },
    { timeout: 15000 }
  );

  // Configurar listener para esperar el modal de éxito
  const successModalPromise = page.waitForSelector('.swal2-popup', { timeout: 10000 });

  await confirmButton.click();

  // Esperar la respuesta de la API
  const apiResponse = await apiResponsePromise;
  expect(apiResponse.status()).toBe(200);

  // Esperar el modal de éxito
  await successModalPromise;

  // Verificar que se muestra el mensaje de éxito
  const successModal = page.locator('.swal2-popup');
  await expect(successModal).toBeVisible();

  const successTitle = successModal.locator('.swal2-title');
  await expect(successTitle).toContainText(/Aprobado/i);

  // Paso 5: Verificar el estado en la tabla
  // Esperar a que el modal se cierre (tiene timer de 2000ms) y la página se recargue
  // En lugar de esperar networkidle (que puede fallar si hay polling), esperamos condiciones específicas
  await page.waitForTimeout(3000); // Esperar que el modal se cierre
  
  // Esperar a que la URL cambie (la recarga redirige a /admin)
  await page.waitForURL(/\/admin$/, { timeout: 10000 });
  
  // Esperar a que el heading sea visible (indicador de que la página cargó)
  await expect(page.getByRole('heading', { name: /Alquileres programados/i })).toBeVisible({ timeout: 10000 });
  
  // Esperar un poco más para que la tabla se renderice completamente
  await page.waitForTimeout(1000);

  // Verificar que el alquiler cambió a estado "Activo" (Confirmado)
  const rentalsTableAfterReload = page.locator('table').filter({
    has: page.locator('th:has-text("ID Alquiler")')
  }).first();

  const hashWithoutHash = rentalIdHash.replace('#', '');
  const approvedRentalRow = rentalsTableAfterReload.locator('tbody tr').filter({
    hasText: hashWithoutHash
  }).first();

  await expect(approvedRentalRow).toBeVisible({ timeout: 10000 });

  // Verificar que el estado es "Activo"
  const statusCell = approvedRentalRow.locator('td').nth(4);
  const statusBadge = statusCell.locator('span').filter({ hasText: /^Activo$/i });
  await expect(statusBadge.first()).toBeVisible({ timeout: 5000 });
});

/**
 * CP-013: Admin - Gestión de Alquileres - Rechazar un alquiler pendiente
 * 
 * Descripción: Rechazar un alquiler aprobado (cancelar un alquiler activo).
 * 
 * Precondición: Existe una solicitud en estado Activo (Aprobado). Admin dentro del panel.
 * 
 * Datos de prueba:
 * - Solicitud activa (aprobada)
 * 
 * Pasos:
 * 1. Iniciar sesión como admin.
 * 2. Ir a "Alquileres programados".
 * 3. Seleccionar solicitud activa (aprobada).
 * 4. Hacer clic en "Cancelar" (rechazar el alquiler aprobado).
 * 5. Verificar disponibilidad en calendario público.
 * 
 * Resultado esperado: La solicitud cambia a estado "Cancelado". Las fechas se liberan en el calendario 
 * y se puede programar un nuevo alquiler en ese rango.
 * 
 * Nota: Según la especificación, se rechaza un alquiler aprobado (activo).
 */
test('CP-013: Rechazar un alquiler pendiente', async ({ page }) => {
  // Paso 1: Iniciar sesión como admin
  await loginAsAdmin(page);

  // Paso 2: Ir a "Alquileres programados"
  await expect(page.getByRole('heading', { name: /Alquileres programados/i })).toBeVisible();
  await page.waitForLoadState('networkidle');

  // Paso 3: Seleccionar solicitud aprobada (activa) - según especificación, se rechaza uno aprobado
  const rentalsTable = page.locator('table').filter({
    has: page.locator('th:has-text("ID Alquiler")')
  }).first();

  const activeRentalRow = rentalsTable.locator('tbody tr').filter({
    hasText: /Activo/i
  }).first();

  let rentalCount = await activeRentalRow.count();

  // Si no hay alquileres activos, crear uno: primero aprobar uno pendiente si existe
  if (rentalCount === 0) {
    // Buscar un alquiler pendiente para aprobarlo primero
    const pendingRentalRow = rentalsTable.locator('tbody tr').filter({
      hasText: /Pendiente/i
    }).first();

    const pendingCount = await pendingRentalRow.count();

    if (pendingCount > 0) {
      // Aprobar el alquiler pendiente
      await pendingRentalRow.locator('button').filter({ has: page.locator('svg') }).first().click();
      await page.waitForTimeout(500);
      
      const approveButton = page.locator('button').filter({ hasText: /^Aprobar$/i }).first();
      if (await approveButton.count() > 0) {
        await approveButton.click();
        
        await page.waitForSelector('.swal2-popup', { timeout: 10000 });
        const confirmDialog = page.locator('.swal2-popup');
        const confirmButton = confirmDialog.locator('button.swal2-confirm');
        await confirmButton.click();
        
        // Esperar que se apruebe
        await page.waitForTimeout(3000);
        await page.reload();
        await page.waitForLoadState('networkidle');
      }
    } else {
      // Si no hay pendientes ni activos, crear uno pendiente y aprobarlo
      await ensurePendingRentalExists(page);
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      // Aprobar el recién creado
      const newPendingRow = rentalsTable.locator('tbody tr').filter({ hasText: /Pendiente/i }).first();
      await newPendingRow.locator('button').filter({ has: page.locator('svg') }).first().click();
      await page.waitForTimeout(500);
      
      const approveBtn = page.locator('button').filter({ hasText: /^Aprobar$/i }).first();
      await approveBtn.click();
      
      await page.waitForSelector('.swal2-popup', { timeout: 10000 });
      const confirmDlg = page.locator('.swal2-popup');
      const confirmBtn = confirmDlg.locator('button.swal2-confirm');
      await confirmBtn.click();
      
      await page.waitForTimeout(3000);
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
    
    // Buscar el alquiler activo nuevamente
    rentalCount = await activeRentalRow.count();
  }

  // Debe existir al menos un alquiler activo ahora
  expect(rentalCount).toBeGreaterThan(0);

  await expect(activeRentalRow).toBeVisible();

  // Obtener información del alquiler para verificar después
  const rentalIdCell = activeRentalRow.locator('td').first();
  const rentalIdHashText = await rentalIdCell.locator('span.text-slate-600').textContent();
  const rentalIdHash = rentalIdHashText?.trim() || '';

  // Obtener el ID del artículo para verificar disponibilidad después
  const articleText = await activeRentalRow.locator('td').nth(1).textContent();
  const articleIdMatch = articleText?.match(/Artículo #(\d+)/i);
  const articleId = articleIdMatch ? articleIdMatch[1] : null;
  expect(articleId).toBeTruthy();

  // Obtener las fechas
  const datesText = await activeRentalRow.locator('td').nth(2).textContent();
  const datesMatch = datesText?.match(/(\d{4}-\d{2}-\d{2})\s*→\s*(\d{4}-\d{2}-\d{2})/);
  const startDate = datesMatch ? datesMatch[1] : null;
  const endDate = datesMatch ? datesMatch[2] : null;

  // Paso 4: Hacer clic en el menú de opciones
  const menuButton = activeRentalRow.locator('button').filter({
    has: page.locator('svg')
  }).first();
  await expect(menuButton).toBeVisible();

  await menuButton.click();

  // Esperar a que aparezca el menú desplegable
  await page.waitForTimeout(500);

  // Hacer clic en "Cancelar" (rechazar un alquiler aprobado)
  const cancelButton = page.locator('button').filter({ hasText: /^Cancelar$/i }).first();
  await expect(cancelButton).toBeVisible();

  // Configurar listener para esperar el diálogo de confirmación
  const confirmDialogPromise = page.waitForSelector('.swal2-popup', { timeout: 10000 });

  await cancelButton.click();

  // Esperar el diálogo de confirmación
  await confirmDialogPromise;

  const confirmDialog = page.locator('.swal2-popup');
  await expect(confirmDialog).toBeVisible();

  const confirmTitle = confirmDialog.locator('.swal2-title');
  await expect(confirmTitle).toContainText(/¿Estás seguro?/i);

  // Confirmar la cancelación
  const confirmButton = confirmDialog.locator('button.swal2-confirm');
  await expect(confirmButton).toBeVisible();
  await expect(confirmButton).toContainText(/Sí, cancelar/i);

  // Configurar listener para esperar la respuesta de la API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponsePromise = page.waitForResponse(
    (response: any) => {
      const url = response.url();
      const method = response.request().method();
      return url.includes(`/api/admin/rentals/`) &&
        method === 'POST' &&
        !url.includes('/approve');
    },
    { timeout: 15000 }
  );

  // Configurar listener para esperar el modal de éxito
  const successModalPromise = page.waitForSelector('.swal2-popup', { timeout: 10000 });

  await confirmButton.click();

  // Esperar la respuesta de la API
  const apiResponse = await apiResponsePromise;
  expect(apiResponse.status()).toBe(200);

  // Esperar el modal de éxito
  await successModalPromise;

  // Verificar que se muestra el mensaje de éxito
  const successModal = page.locator('.swal2-popup');
  await expect(successModal).toBeVisible();

  const successTitle = successModal.locator('.swal2-title');
  await expect(successTitle).toContainText(/Cancelado/i);

  // Esperar a que la página se recargue
  await page.waitForTimeout(3000);
  await page.waitForURL(/\/admin$/, { timeout: 10000 });
  await expect(page.getByRole('heading', { name: /Alquileres programados/i })).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1000);

  // Verificar que el alquiler cambió a estado "Cancelado"
  const rentalsTableAfterReload = page.locator('table').filter({
    has: page.locator('th:has-text("ID Alquiler")')
  }).first();

  const hashWithoutHash = rentalIdHash.replace('#', '');
  const canceledRentalRow = rentalsTableAfterReload.locator('tbody tr').filter({
    hasText: hashWithoutHash
  }).first();

  await expect(canceledRentalRow).toBeVisible({ timeout: 10000 });

  // Verificar que el estado es "Cancelado"
  const statusCell = canceledRentalRow.locator('td').nth(4);
  const statusBadge = statusCell.locator('span').filter({ hasText: /^Cancelado$/i });
  await expect(statusBadge.first()).toBeVisible({ timeout: 5000 });

  // Paso 5: Verificar disponibilidad en calendario público (si tenemos articleId y fechas)
  if (articleId && startDate && endDate) {
    await page.goto(`/items/${articleId}`);
    await page.waitForLoadState('networkidle');

    // Verificar que el calendario se carga
    const calendar = page.locator('input[type="date"], .calendar, [role="application"]').first();
    // Nota: La verificación específica del calendario dependería de la implementación del componente
    // Por ahora, verificamos que la página del artículo carga correctamente
    await expect(page.locator('h1, h2')).toBeVisible({ timeout: 10000 });
  }
});

/**
 * CP-014: Admin - Gestión de Alquileres - Eliminación permanente de una solicitud
 * 
 * Descripción: Eliminación permanente de una solicitud de alquiler.
 * 
 * Precondición: Existe una solicitud (en cualquier estado). Admin autenticado.
 * 
 * Datos de prueba:
 * - Solicitud de alquiler (cualquier estado, preferiblemente "Cancelado")
 * 
 * Pasos:
 * 1. Acceder a Administración.
 * 2. Navegar a "Alquileres programados".
 * 3. Seleccionar una solicitud (preferiblemente en estado "Cancelado").
 * 4. Hacer clic en el menú de opciones.
 * 5. Hacer clic en "Eliminar".
 * 6. Confirmar la eliminación.
 * 
 * Resultado esperado: La solicitud desaparece de la lista. Si la solicitud eliminada estaba Confirmada (Activa), 
 * las fechas se liberan en el calendario.
 */
test('CP-014: Eliminación permanente de una solicitud', async ({ page }) => {
  // Paso 1: Acceder a Administración
  await loginAsAdmin(page);

  // Paso 2: Navegar a "Alquileres programados"
  await expect(page.getByRole('heading', { name: /Alquileres programados/i })).toBeVisible();
  await page.waitForLoadState('networkidle');

  // Paso 3: Seleccionar una solicitud (cualquier estado)
  const rentalsTable = page.locator('table').filter({
    has: page.locator('th:has-text("ID Alquiler")')
  }).first();

  // Preferiblemente buscar una en estado "Cancelado", pero aceptar cualquier estado
  let rentalRow = rentalsTable.locator('tbody tr').filter({
    hasText: /Cancelado/i
  }).first();

  let rentalCount = await rentalRow.count();

  // Si no hay cancelados, buscar cualquier alquiler
  if (rentalCount === 0) {
    rentalRow = rentalsTable.locator('tbody tr').first();
    rentalCount = await rentalRow.count();
  }

  if (rentalCount === 0) {
    test.skip();
    return;
  }

  await expect(rentalRow).toBeVisible();

  // Obtener el ID completo del alquiler
  const rentalIdCell = rentalRow.locator('td').first();
  const rentalIdHashText = await rentalIdCell.locator('span.text-slate-600').textContent();
  const rentalIdHash = rentalIdHashText?.trim() || '';

  // Obtener el estado actual para verificar si era Activo
  const statusCellBefore = rentalRow.locator('td').nth(4);
  const statusTextBefore = await statusCellBefore.locator('span').first().textContent();
  const wasActive = statusTextBefore?.includes('Activo') || false;

  // Paso 4: Hacer clic en el menú de opciones
  const menuButton = rentalRow.locator('button').filter({
    has: page.locator('svg')
  }).first();
  await expect(menuButton).toBeVisible();

  await menuButton.click();

  // Esperar a que aparezca el menú desplegable
  await page.waitForTimeout(500);

  // Paso 5: Hacer clic en "Eliminar"
  const deleteButton = page.locator('button').filter({ hasText: /^Eliminar$/i }).first();
  await expect(deleteButton).toBeVisible();

  // Configurar listener para esperar el diálogo de confirmación
  const confirmDialogPromise = page.waitForSelector('.swal2-popup', { timeout: 10000 });

  await deleteButton.click();

  // Esperar el diálogo de confirmación
  await confirmDialogPromise;

  const confirmDialog = page.locator('.swal2-popup');
  await expect(confirmDialog).toBeVisible();

  const confirmTitle = confirmDialog.locator('.swal2-title');
  await expect(confirmTitle).toContainText(/¿Estás seguro?/i);

  const confirmText = confirmDialog.locator('.swal2-html-container');
  await expect(confirmText).toContainText(/Eliminará permanentemente/i);

  // Paso 6: Confirmar la eliminación
  const confirmButton = confirmDialog.locator('button.swal2-confirm');
  await expect(confirmButton).toBeVisible();
  await expect(confirmButton).toContainText(/Sí, eliminar/i);

  // Configurar listener para esperar la respuesta de la API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponsePromise = page.waitForResponse(
    (response: any) => {
      const url = response.url();
      const method = response.request().method();
      return url.includes(`/api/admin/rentals/`) &&
        method === 'DELETE';
    },
    { timeout: 15000 }
  );

  // Configurar listener para esperar el modal de éxito
  const successModalPromise = page.waitForSelector('.swal2-popup', { timeout: 10000 });

  await confirmButton.click();

  // Esperar la respuesta de la API
  const apiResponse = await apiResponsePromise;
  expect(apiResponse.status()).toBe(200);

  // Esperar el modal de éxito
  await successModalPromise;

  // Verificar que se muestra el mensaje de éxito
  const successModal = page.locator('.swal2-popup');
  await expect(successModal).toBeVisible();

  const successTitle = successModal.locator('.swal2-title');
  await expect(successTitle).toContainText(/Eliminado/i);

  // Esperar a que la página se recargue
  await page.waitForTimeout(3000);
  await page.waitForURL(/\/admin$/, { timeout: 10000 });
  await expect(page.getByRole('heading', { name: /Alquileres programados/i })).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1000);

  // Verificar que la solicitud desapareció de la lista
  const rentalsTableAfterReload = page.locator('table').filter({
    has: page.locator('th:has-text("ID Alquiler")')
  }).first();

  const hashWithoutHash = rentalIdHash.replace('#', '');
  const deletedRentalRow = rentalsTableAfterReload.locator('tbody tr').filter({
    hasText: hashWithoutHash
  });

  const stillExists = await deletedRentalRow.count();
  expect(stillExists).toBe(0); // El alquiler no debe existir más
});

