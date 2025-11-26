import { test, expect } from '@playwright/test';
import { SearchPage } from './pages/SearchPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { RentalFormComponent } from './pages/RentalFormComponent';

/**
 * Módulo: Detalle del Artículo
 * 
 * Este archivo contiene los casos de prueba relacionados con la visualización del detalle de un artículo:
 * - CP-004: Visualización correcta de la página de detalle
 * - CP-005: El calendario muestra fechas reservadas y disponibles
 */

test('CP-004: Visualización correcta de la página de detalle', async ({ page }) => {
  // Paso 1: Navegar y seleccionar un artículo
  const searchPage = new SearchPage(page);
  await searchPage.goto();
  await searchPage.waitForLoad();

  const articleHref = await searchPage.getFirstArticleHref();
  expect(articleHref).toMatch(/^\/items\/\d+$/);

  // Ir al detalle del artículo
  const itemDetailPage = new ItemDetailPage(page);
  const itemId = articleHref?.replace('/items/', '') || '';
  await itemDetailPage.goto(itemId);
  await itemDetailPage.waitForLoad();

  // Verificar elementos principales usando Page Objects
  await expect(itemDetailPage.getBackButton()).toBeVisible();
  expect(await itemDetailPage.getBackButton().getAttribute('href')).toBe('/search');

  await expect(itemDetailPage.getMainImageContainer()).toBeVisible();
  const mainImage = itemDetailPage.getMainImageContainer().locator('img').first();
  await expect(mainImage).toBeVisible();

  await expect(itemDetailPage.getItemName()).toBeVisible();
  const nameText = await itemDetailPage.getItemName().textContent();
  expect(nameText?.trim().length).toBeGreaterThan(0);

  await expect(itemDetailPage.getCategoryText()).toBeVisible();
  await expect(itemDetailPage.getDescriptionText()).toBeVisible();
  await expect(itemDetailPage.getPriceText()).toBeVisible();
  await expect(itemDetailPage.getSizesText()).toBeVisible();
  await expect(itemDetailPage.getColorText()).toBeVisible();

  await expect(itemDetailPage.getAvailabilityHeading()).toBeVisible();
  await expect(itemDetailPage.getRentalHeading()).toBeVisible();

  const rentalForm = new RentalFormComponent(page);
  await rentalForm.expectFormVisible();

  const startInput = rentalForm.getStartDateInput();
  const endInput = rentalForm.getEndDateInput();
  await expect(startInput).toBeVisible();
  await expect(endInput).toBeVisible();
  await expect(rentalForm.getSubmitButton()).toBeVisible();
});

test('CP-005: El calendario muestra fechas reservadas y disponibles', async ({ page }) => {
  const searchPage = new SearchPage(page);
  await searchPage.goto();
  await searchPage.waitForLoad();

  const articleHref = await searchPage.getFirstArticleHref();
  expect(articleHref).toMatch(/^\/items\/\d+$/);
  const itemId = articleHref?.split('/')[2] || '';

  const itemDetailPage = new ItemDetailPage(page);
  await itemDetailPage.goto(itemId);
  await itemDetailPage.waitForLoad();

  // Esperar a que el calendario se cargue
  await itemDetailPage.waitForAvailabilityAPI(itemId);

  // Verificar sección de disponibilidad
  await expect(itemDetailPage.getAvailabilityHeading()).toBeVisible();

  // Verificar calendario
  const calendarGrid = itemDetailPage.getCalendarGrid();
  await expect(calendarGrid).toBeVisible();

  const calendarDays = calendarGrid.locator('div').filter({ hasText: /.+/ });
  const daysCount = await calendarDays.count();
  expect(daysCount).toBeGreaterThan(0);
  expect(daysCount).toBeLessThanOrEqual(60 * 7);

  // Verificar fechas reservadas
  const reservedDates = calendarDays.filter({ hasText: /Reservado/i });
  const reservedCount = await reservedDates.count();

  if (reservedCount > 0) {
    const reservedDate = reservedDates.first();
    const reservedText = reservedDate.locator('div').filter({ hasText: /^Reservado$/ });
    await expect(reservedText).toBeVisible();

    const hasCursorNotAllowed = await reservedDate.evaluate((el) => {
      return window.getComputedStyle(el).cursor === 'not-allowed';
    });
    expect(hasCursorNotAllowed).toBe(true);

    const reservedMessage = page.locator('p').filter({
      hasText: /Las fechas marcadas ya están reservadas/i
    });
    await expect(reservedMessage).toBeVisible();
  }
});
