import { Page, expect } from '@playwright/test';
import { SearchPage } from '../pages/SearchPage';
import { ItemDetailPage } from '../pages/ItemDetailPage';
import { RentalFormComponent } from '../pages/RentalFormComponent';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { AdminRentalsPage } from '../pages/AdminRentalsPage';
import { SweetAlertDialog } from '../pages/SweetAlertDialog';

/**
 * Helper para asegurar que existe un alquiler pendiente
 * Crea un alquiler pendiente si no existe ninguno
 */
export async function ensurePendingRentalExists(page: Page): Promise<void> {
  const adminLoginPage = new AdminLoginPage(page);
  const rentalsPage = new AdminRentalsPage(page);

  // Iniciar sesión como admin para verificar si hay alquileres pendientes
  await adminLoginPage.login();
  await rentalsPage.goto();

  const pendingCount = await rentalsPage.getPendingRentalCount();

  // Si ya existe un alquiler pendiente, no hacer nada
  if (pendingCount > 0) {
    return;
  }

  // Si no existe, crear uno nuevo
  // Cerrar sesión de admin para crear el alquiler desde el público
  await page.goto('/');
  await page.context().clearCookies();

  // Crear un alquiler con fechas muy futuras para evitar conflictos
  const searchPage = new SearchPage(page);
  await searchPage.goto();
  await searchPage.waitForLoad();

  const articleHref = await searchPage.getFirstArticleHref();
  if (!articleHref || !articleHref.match(/^\/items\/\d+$/)) {
    throw new Error('No se encontró un artículo disponible');
  }

  const itemDetailPage = new ItemDetailPage(page);
  const itemId = articleHref.replace('/items/', '');
  await itemDetailPage.goto(itemId);
  await itemDetailPage.waitForLoad();

  const rentalForm = new RentalFormComponent(page);
  await rentalForm.expectFormVisible();

  // Verificar si el usuario está autenticado
  const nameInput = rentalForm.getNameInput();
  const nameInputVisible = await nameInput.count() > 0 && 
                            await nameInput.isVisible().catch(() => false);

  if (nameInputVisible) {
    // Usuario no autenticado: completar campos
    await rentalForm.fillPersonalInfo('Test User', 'test@example.com', '12345678');
  }

  // Intentar crear alquiler con fechas futuras (60 días)
  try {
    await rentalForm.fillFutureDates(60, 2);
    const apiResponse = await rentalForm.submit();

    if (apiResponse.status() === 200 || apiResponse.status() === 201) {
      // Alquiler creado exitosamente
      await rentalForm.closeSuccessModal();
      return;
    } else if (apiResponse.status() === 409) {
      // Conflicto de fechas, intentar con fechas más lejanas (90 días)
      await rentalForm.fillFutureDates(90, 2);
      const retryResponse = await rentalForm.submit();

      if (retryResponse.status() === 200 || retryResponse.status() === 201) {
        await rentalForm.closeSuccessModal();
        return;
      }
    }

    throw new Error(`Error al crear alquiler: ${apiResponse.status()}`);
  } catch (error) {
    // Si falla, intentar con fechas aún más lejanas (120 días)
    await rentalForm.fillFutureDates(120, 2);
    const finalResponse = await rentalForm.submit();
    
    if (finalResponse.status() !== 200 && finalResponse.status() !== 201) {
      throw new Error(`Error al crear alquiler después de múltiples intentos: ${finalResponse.status()}`);
    }

    await rentalForm.closeSuccessModal();
  }
}

/**
 * Helper para asegurar que existe un alquiler activo (aprobado)
 * Crea un alquiler pendiente si no existe, y luego lo aprueba
 */
export async function ensureActiveRentalExists(page: Page): Promise<void> {
  const adminLoginPage = new AdminLoginPage(page);
  const rentalsPage = new AdminRentalsPage(page);

  // Iniciar sesión como admin para verificar si hay alquileres activos
  await adminLoginPage.login();
  await rentalsPage.goto();

  const activeCount = await rentalsPage.getActiveRentalCount();

  // Si ya existe un alquiler activo, no hacer nada
  if (activeCount > 0) {
    return;
  }

  // Verificar si hay un alquiler pendiente que podamos aprobar
  const pendingCount = await rentalsPage.getPendingRentalCount();

  if (pendingCount > 0) {
    // Aprobar el primer alquiler pendiente
    const pendingRentalRow = await rentalsPage.getRentalRowByStatus('Pendiente');
    await rentalsPage.openRentalMenu(pendingRentalRow);

    // Configurar listener para esperar la respuesta de la API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiResponsePromise = page.waitForResponse(
      (response: any) => {
        const url = response.url();
        const method = response.request().method();
        return url.includes('/api/admin/rentals/') && 
               url.includes('/approve') && 
               method === 'POST';
      },
      { timeout: 15000 }
    );

    await rentalsPage.clickApprove();

    const apiResponse = await apiResponsePromise;
    expect(apiResponse.status()).toBe(200);

    // Esperar el modal de éxito y cerrarlo
    const dialog = new SweetAlertDialog(page);
    await dialog.waitForDialog();
    await dialog.waitForSuccessAndClose(2000);

    // Esperar que la página se recargue
    await rentalsPage.waitForReload();
    return;
  }

  // Si no hay alquileres pendientes, crear uno nuevo y aprobarlo
  await page.goto('/');
  await page.context().clearCookies();

  await ensurePendingRentalExists(page);

  // Volver como admin para aprobar el alquiler
  await adminLoginPage.login();
  await rentalsPage.goto();

  const newPendingRentalRow = await rentalsPage.getRentalRowByStatus('Pendiente');
  await rentalsPage.openRentalMenu(newPendingRentalRow);

  // Configurar listener para esperar la respuesta de la API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponsePromise = page.waitForResponse(
    (response: any) => {
      const url = response.url();
      const method = response.request().method();
      return url.includes('/api/admin/rentals/') && 
             url.includes('/approve') && 
             method === 'POST';
    },
    { timeout: 15000 }
  );

  await rentalsPage.clickApprove();

  const apiResponse = await apiResponsePromise;
  expect(apiResponse.status()).toBe(200);

  // Esperar el modal de éxito y cerrarlo
  const dialog = new SweetAlertDialog(page);
  await dialog.waitForDialog();
  await dialog.waitForSuccessAndClose(2000);

  // Esperar que la página se recargue
  await rentalsPage.waitForReload();
}

