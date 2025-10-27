import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ItemDetailPage } from '../pages/ItemDetailPage';

test.describe('Navegación entre páginas', () => {
  test('debe navegar correctamente entre Home y Detalles de Item', async ({ page }) => {
    // 1. Cargar home
    const homePage = new HomePage(page);
    await homePage.goto();

    // 2. Verificar que estamos en home
    expect(page.url()).toBe('http://localhost:3000/');

    // 3. Navegar a un item
    await homePage.clickFeaturedItem(1); // Segundo item

    // 4. Verificar que estamos en la página de detalles
    expect(page.url()).toMatch(/\/items\/\d+/);

    // 5. Verificar contenido del item
    const itemPage = new ItemDetailPage(page);
    await expect(itemPage.itemTitle).toBeVisible();
  });

  test('debe navegar a la página de búsqueda desde múltiples lugares', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Desde el header
    await homePage.goToBrowse();
    expect(page.url()).toContain('/search');

    // Volver a home
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Desde el formulario de búsqueda
    await homePage.searchByText('dress');
    expect(page.url()).toContain('/search');
  });

  test('debe mantener el estado al navegar hacia atrás', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Navegar a un item
    await homePage.clickFirstFeaturedItem();
    const itemUrl = page.url();

    // Volver atrás
    await page.goBack();
    expect(page.url()).toBe('http://localhost:3000/');

    // Verificar que el home todavía funciona
    const count = await homePage.getFeaturedItemsCount();
    expect(count).toBe(4);

    // Navegar hacia adelante
    await page.goForward();
    expect(page.url()).toBe(itemUrl);
  });

  test('debe poder acceder directamente a un item por URL', async ({ page }) => {
    const itemPage = new ItemDetailPage(page, 1);
    await itemPage.goto();

    await expect(itemPage.itemTitle).toBeVisible();
    expect(page.url()).toContain('/items/1');
  });

  test('debe navegar al admin desde el header', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await homePage.adminLink.click();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/admin');
  });
});

test.describe('Flujo de usuario completo - E2E', () => {
  test('Usuario busca, explora y reserva un vestido', async ({ page }) => {
    // Historia de usuario:
    // Como cliente, quiero buscar un vestido, ver sus detalles y hacer una reserva

    // 1. GIVEN: El usuario está en la página de inicio
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(homePage.logo).toBeVisible();

    // 2. WHEN: El usuario ve los vestidos destacados
    const featuredCount = await homePage.getFeaturedItemsCount();
    expect(featuredCount).toBeGreaterThan(0);

    // 3. AND: Hace clic en un vestido que le interesa
    const itemName = await homePage.getFeaturedItemName(0);
    await homePage.clickFirstFeaturedItem();

    // 4. THEN: Debería ver los detalles del vestido
    const itemPage = new ItemDetailPage(page);
    await expect(itemPage.itemTitle).toBeVisible();
    
    const displayedName = await itemPage.getItemName();
    expect(displayedName).toBe(itemName);

    // 5. AND: Debería ver el precio
    const price = await itemPage.getItemPrice();
    expect(price).toMatch(/\$\d+/);

    // 6. AND: Debería ver el formulario de reserva
    expect(await itemPage.isRentalFormVisible()).toBe(true);

    // 7. WHEN: Llena el formulario con sus datos
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    await itemPage.fillRentalForm({
      name: 'Ana Martínez',
      email: 'ana.martinez@example.com',
      phone: '+54 11 5555-1234',
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0]
    });

    // 8. THEN: Los campos deberían contener la información correcta
    expect(await itemPage.nameInput.inputValue()).toBe('Ana Martínez');
    expect(await itemPage.emailInput.inputValue()).toBe('ana.martinez@example.com');

    // 9. Screenshot del estado final
    await page.screenshot({ 
      path: 'test-results/e2e-rental-form-filled.png',
      fullPage: true 
    });
  });
});



