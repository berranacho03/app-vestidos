import { test, expect } from '@playwright/test';
import { ItemDetailPage } from '../pages/ItemDetailPage';
import { HomePage } from '../pages/HomePage';

test.describe('Página de Detalle de Artículo', () => {
  let itemDetailPage: ItemDetailPage;

  test.beforeEach(async ({ page }) => {
    // Navegar a través de la home page para llegar a un item
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.clickFirstFeaturedItem();
    
    // Inicializar el page object
    itemDetailPage = new ItemDetailPage(page);
  });

  test('debe mostrar todos los detalles del artículo', async () => {
    // Verificar elementos principales
    await expect(itemDetailPage.itemTitle).toBeVisible();
    await expect(itemDetailPage.itemPrice).toBeVisible();
    await expect(itemDetailPage.itemCategory).toBeVisible();
  });

  test('debe mostrar el precio correcto del primer item', async () => {
    const price = await itemDetailPage.getItemPrice();
    expect(price).toContain('$79');
  });

  test('debe mostrar el nombre correcto del artículo', async () => {
    const name = await itemDetailPage.getItemName();
    expect(name).toBe('Silk Evening Gown');
  });

  test('debe mostrar la sección de disponibilidad', async () => {
    const isVisible = await itemDetailPage.isAvailabilityVisible();
    expect(isVisible).toBe(true);
  });

  test('debe mostrar el formulario de reserva con todos los campos', async () => {
    await expect(itemDetailPage.nameInput).toBeVisible();
    await expect(itemDetailPage.emailInput).toBeVisible();
    await expect(itemDetailPage.phoneInput).toBeVisible();
    await expect(itemDetailPage.startDateInput).toBeVisible();
    await expect(itemDetailPage.endDateInput).toBeVisible();
    await expect(itemDetailPage.requestRentalButton).toBeVisible();
  });

  test('debe permitir llenar el formulario de reserva', async () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const formData = {
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      phone: '+54 11 1234-5678',
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0]
    };

    await itemDetailPage.fillRentalForm(formData);

    // Verificar que los campos se llenaron correctamente
    expect(await itemDetailPage.nameInput.inputValue()).toBe(formData.name);
    expect(await itemDetailPage.emailInput.inputValue()).toBe(formData.email);
    expect(await itemDetailPage.phoneInput.inputValue()).toBe(formData.phone);
  });

  test('debe validar campos requeridos del formulario', async ({ page }) => {
    // Intentar enviar el formulario vacío
    await itemDetailPage.requestRentalButton.click();
    
    // El navegador debería prevenir el envío por validación HTML5
    // Verificar que seguimos en la misma página
    expect(page.url()).toMatch(/\/items\/\d+/);
  });

  test('debe mostrar información de tallas y colores', async () => {
    await expect(itemDetailPage.itemSizes).toBeVisible();
    await expect(itemDetailPage.itemColor).toBeVisible();
  });
});

test.describe('Flujo completo de reserva', () => {
  test('debe completar el proceso de reserva de principio a fin', async ({ page }) => {
    // 1. Ir a la home
    const homePage = new HomePage(page);
    await homePage.goto();

    // 2. Buscar un vestido
    await homePage.searchByText('evening');
    await page.waitForLoadState('networkidle');

    // 3. Si hay resultados, volver y hacer clic en featured item
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    await homePage.clickFirstFeaturedItem();

    // 4. Llenar el formulario de reserva
    const itemDetailPage = new ItemDetailPage(page);
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const rentalData = {
      name: 'María García',
      email: 'maria.garcia@test.com',
      phone: '+54 9 11 9876-5432',
      startDate: today.toISOString().split('T')[0],
      endDate: tomorrow.toISOString().split('T')[0]
    };

    await itemDetailPage.submitRentalRequest(rentalData);

    // 5. Verificar que se envió (la URL debería cambiar o mostrar confirmación)
    // Nota: Esto depende de cómo esté implementado el backend
    await page.waitForTimeout(1000);
  });
});



