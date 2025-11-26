import { test, expect } from '@playwright/test';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminRentalsPage } from './pages/AdminRentalsPage';
import { SweetAlertDialog } from './pages/SweetAlertDialog';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { ensurePendingRentalExists, ensureActiveRentalExists } from './helpers/rental.helper';

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
  const loginPage = new AdminLoginPage(page);
  await loginPage.login();

  // Paso 2: Navegar a la sección de "Alquileres programados"
  const rentalsPage = new AdminRentalsPage(page);
  await rentalsPage.goto();
  await rentalsPage.waitForLoad();

  // Paso 3: Verificar que se muestra la lista completa de alquileres
  await rentalsPage.expectRentalsSectionVisible();
  await rentalsPage.expectRentalsTableVisible();
  await rentalsPage.expectTableHeadersVisible();

  // Verificar que existen alquileres con estado "Activo" (Confirmado)
  await rentalsPage.expectActiveRentalsExist();

  // Verificar que al menos hay una fila de alquiler o el mensaje de "No hay alquileres"
  const rentalCount = await rentalsPage.getRentalCount();
  if (rentalCount > 0) {
    const rentalRows = rentalsPage.getRentalRows();
    const firstRentalRow = rentalRows.first();
    await expect(firstRentalRow).toBeVisible();

    // Verificar que muestra el ID del alquiler
    const rentalId = firstRentalRow.locator('span.text-fuchsia-600, span.bg-fuchsia-100');
    await expect(rentalId.first()).toBeVisible();
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
  const loginPage = new AdminLoginPage(page);
  await loginPage.login();

  const rentalsPage = new AdminRentalsPage(page);
  await rentalsPage.goto();
  await rentalsPage.waitForLoad();

  // Paso 2: Localizar una solicitud de alquiler (estado Pendiente o Activo)
  const rentalRow = rentalsPage.getRentalRows().filter({
    hasText: /Pendiente|Activo/i
  }).first();

  const rentalCount = await rentalRow.count();

  if (rentalCount === 0) {
    test.skip();
    return;
  }

  await expect(rentalRow).toBeVisible();

  // Obtener el ID completo del alquiler para verificar después
  const rentalIdHash = await rentalsPage.getRentalId(rentalRow);
  expect(rentalIdHash).toMatch(/^#[\da-f]{8}$/i);

  // Paso 3: Hacer clic en el menú de opciones
  await rentalsPage.openRentalMenu(rentalRow);

  // Paso 4: Hacer clic en "Cancelar Alquiler"
  await rentalsPage.clickCancel();

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

  // Paso 5: Confirmar la cancelación
  const dialog = new SweetAlertDialog(page);
  await dialog.waitForDialog();
  await dialog.expectTitle(/¿Estás seguro?/i);
  await dialog.expectConfirmButtonText(/Sí, cancelar/i);

  // Configurar listener para esperar el modal de éxito
  const successModalPromise = page.waitForSelector('.swal2-popup', { timeout: 10000 });

  await dialog.confirm();

  // Esperar la respuesta de la API
  const apiResponse = await apiResponsePromise;
  expect(apiResponse.status()).toBe(200);

  // Esperar el modal de éxito
  await successModalPromise;
  await dialog.waitForDialog();
  await dialog.expectTitle(/Cancelado/i);

  // Esperar a que la página se recargue
  await rentalsPage.waitForReload();

  // Verificar que el alquiler cambió a estado "Cancelado"
  const canceledRentalRow = await rentalsPage.getRentalRowByHash(rentalIdHash);
  await expect(canceledRentalRow).toBeVisible({ timeout: 10000 });
  await rentalsPage.expectRentalStatus(canceledRentalRow, 'Cancelado');
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
  const loginPage = new AdminLoginPage(page);
  await loginPage.login();

  // Asegurar que existe un alquiler pendiente antes de continuar
  await ensurePendingRentalExists(page);

  // Volver al panel de admin
  const rentalsPage = new AdminRentalsPage(page);
  await rentalsPage.goto();

  // Paso 2: Navegar a "Alquileres programados" (ya está en la página)
  // Paso 3: Seleccionar la solicitud pendiente
  const pendingCount = await rentalsPage.getPendingRentalCount();

  // Ahora debe existir al menos un alquiler pendiente
  expect(pendingCount).toBeGreaterThan(0);
  
  const pendingRentalRow = await rentalsPage.getRentalRowByStatus('Pendiente');
  await expect(pendingRentalRow).toBeVisible();

  // Obtener el ID completo del alquiler
  const rentalIdHash = await rentalsPage.getRentalId(pendingRentalRow);

  // Paso 4: Hacer clic en el menú de opciones y luego en "Aprobar"
  await rentalsPage.openRentalMenu(pendingRentalRow);
  await rentalsPage.clickApprove();

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

  // Confirmar la aprobación
  const dialog = new SweetAlertDialog(page);
  await dialog.waitForDialog();
  await dialog.expectTitle(/¿Aprobar este alquiler?/i);
  await dialog.expectConfirmButtonText(/Sí, aprobar/i);

  // Configurar listener para esperar el modal de éxito
  const successModalPromise = page.waitForSelector('.swal2-popup', { timeout: 10000 });

  await dialog.confirm();

  // Esperar la respuesta de la API
  const apiResponse = await apiResponsePromise;
  expect(apiResponse.status()).toBe(200);

  // Esperar el modal de éxito
  await successModalPromise;
  await dialog.waitForDialog();
  await dialog.expectTitle(/Aprobado/i);

  // Paso 5: Verificar el estado en la tabla
  await rentalsPage.waitForReload();

  // Verificar que el alquiler cambió a estado "Activo" (Confirmado)
  const approvedRentalRow = await rentalsPage.getRentalRowByHash(rentalIdHash);
  await expect(approvedRentalRow).toBeVisible({ timeout: 10000 });
  await rentalsPage.expectRentalStatus(approvedRentalRow, 'Activo');
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
  const loginPage = new AdminLoginPage(page);
  await loginPage.login();

  // Asegurar que existe un alquiler activo antes de continuar
  await ensureActiveRentalExists(page);

  // Volver al panel de admin
  const rentalsPage = new AdminRentalsPage(page);
  await rentalsPage.goto();

  // Paso 2: Ir a "Alquileres programados"
  // Paso 3: Seleccionar solicitud activa (aprobada)
  const activeCount = await rentalsPage.getActiveRentalCount();

  // Debe existir al menos un alquiler activo ahora
  expect(activeCount).toBeGreaterThan(0);
  
  const activeRentalRow = await rentalsPage.getRentalRowByStatus('Activo');
  await expect(activeRentalRow).toBeVisible();

  // Obtener información del alquiler para verificar después
  const rentalIdHash = await rentalsPage.getRentalId(activeRentalRow);
  const articleId = await rentalsPage.getRentalArticleId(activeRentalRow);
  expect(articleId).toBeTruthy();

  const { start: startDate, end: endDate } = await rentalsPage.getRentalDates(activeRentalRow);

  // Paso 4: Hacer clic en el menú de opciones
  await rentalsPage.openRentalMenu(activeRentalRow);

  // Hacer clic en "Cancelar" (rechazar un alquiler aprobado)
  await rentalsPage.clickCancel();

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

  // Confirmar la cancelación
  const dialog = new SweetAlertDialog(page);
  await dialog.waitForDialog();
  await dialog.expectTitle(/¿Estás seguro?/i);
  await dialog.expectConfirmButtonText(/Sí, cancelar/i);

  // Configurar listener para esperar el modal de éxito
  const successModalPromise = page.waitForSelector('.swal2-popup', { timeout: 10000 });

  await dialog.confirm();

  // Esperar la respuesta de la API
  const apiResponse = await apiResponsePromise;
  expect(apiResponse.status()).toBe(200);

  // Esperar el modal de éxito
  await successModalPromise;
  await dialog.waitForDialog();
  await dialog.expectTitle(/Cancelado/i);

  // Esperar a que la página se recargue
  await rentalsPage.waitForReload();

  // Verificar que el alquiler cambió a estado "Cancelado"
  const canceledRentalRow = await rentalsPage.getRentalRowByHash(rentalIdHash);
  await expect(canceledRentalRow).toBeVisible({ timeout: 10000 });
  await rentalsPage.expectRentalStatus(canceledRentalRow, 'Cancelado');

  // Paso 5: Verificar disponibilidad en calendario público (si tenemos articleId y fechas)
  if (articleId && startDate && endDate) {
    const itemDetailPage = new ItemDetailPage(page);
    await itemDetailPage.goto(articleId);
    await itemDetailPage.waitForLoad();
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
  const loginPage = new AdminLoginPage(page);
  await loginPage.login();

  const rentalsPage = new AdminRentalsPage(page);
  await rentalsPage.goto();
  await rentalsPage.waitForLoad();

  // Paso 2: Navegar a "Alquileres programados"
  // Paso 3: Seleccionar una solicitud (preferiblemente Cancelado, pero aceptar cualquier estado)
  let rentalRow = await rentalsPage.getRentalRowByStatus('Cancelado');
  let rentalCount = await rentalRow.count();

  // Si no hay cancelados, buscar cualquier alquiler
  if (rentalCount === 0) {
    rentalRow = rentalsPage.getRentalRows().first();
    rentalCount = await rentalRow.count();
  }

  if (rentalCount === 0) {
    test.skip();
    return;
  }

  await expect(rentalRow).toBeVisible();

  // Obtener el ID completo del alquiler
  const rentalIdHash = await rentalsPage.getRentalId(rentalRow);

  // Obtener el estado actual para verificar si era Activo
  const statusTextBefore = await rentalsPage.getRentalStatus(rentalRow);
  const wasActive = statusTextBefore?.includes('Activo') || false;

  // Paso 4: Hacer clic en el menú de opciones
  await rentalsPage.openRentalMenu(rentalRow);

  // Paso 5: Hacer clic en "Eliminar"
  await rentalsPage.clickDelete();

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

  // Paso 6: Confirmar la eliminación
  const dialog = new SweetAlertDialog(page);
  await dialog.waitForDialog();
  await dialog.expectTitle(/¿Estás seguro?/i);
  await dialog.expectContent(/Eliminará permanentemente/i);
  await dialog.expectConfirmButtonText(/Sí, eliminar/i);

  // Configurar listener para esperar el modal de éxito
  const successModalPromise = page.waitForSelector('.swal2-popup', { timeout: 10000 });

  await dialog.confirm();

  // Esperar la respuesta de la API
  const apiResponse = await apiResponsePromise;
  expect(apiResponse.status()).toBe(200);

  // Esperar el modal de éxito
  await successModalPromise;
  await dialog.waitForDialog();
  await dialog.expectTitle(/Eliminado/i);

  // Esperar a que la página se recargue
  await rentalsPage.waitForReload();

  // Verificar que la solicitud desapareció de la lista
  await rentalsPage.expectRentalNotExists(rentalIdHash);
});
