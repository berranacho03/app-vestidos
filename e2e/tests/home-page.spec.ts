import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Página de Inicio - GlamRent', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('debe cargar la página de inicio correctamente', async () => {
    // Verificar que el logo es visible
    await expect(homePage.logo).toBeVisible();
    
    // Verificar el título de la página
    const title = await homePage.getTitle();
    expect(title).toContain('Alquiler Vestidos');
  });

  test('debe mostrar todos los elementos del header', async () => {
    // Verificar navegación
    await expect(homePage.browseLink).toBeVisible();
    await expect(homePage.howItWorksLink).toBeVisible();
    await expect(homePage.featuredLink).toBeVisible();
    await expect(homePage.faqLink).toBeVisible();
    await expect(homePage.adminLink).toBeVisible();
    await expect(homePage.becomeLenderButton).toBeVisible();
  });

  test('debe mostrar el formulario de búsqueda con todos los campos', async () => {
    await expect(homePage.searchInput).toBeVisible();
    await expect(homePage.startDateInput).toBeVisible();
    await expect(homePage.endDateInput).toBeVisible();
    await expect(homePage.sizeSelect).toBeVisible();
    await expect(homePage.searchButton).toBeVisible();
  });

  test('debe realizar una búsqueda por texto', async ({ page }) => {
    await homePage.searchByText('silk');
    
    // Verificar que navegó a la página de búsqueda
    expect(page.url()).toContain('http://localhost:3000/');
    expect(page.url()).toContain('q=silk');
  });

  test('debe realizar una búsqueda completa con todos los filtros', async ({ page }) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startDate = today.toISOString().split('T')[0];
    const endDate = tomorrow.toISOString().split('T')[0];

    await homePage.searchDresses('evening gown', startDate, endDate, 'M');
    
    // Verificar que navegó con todos los parámetros
    expect(page.url()).toContain('/search');
    expect(page.url()).toContain('q=evening');
    expect(page.url()).toContain('size=M');
  });

  test('debe mostrar 4 items destacados', async () => {
    const count = await homePage.getFeaturedItemsCount();
    expect(count).toBe(4);
  });

  test('debe mostrar los nombres correctos de los items destacados', async () => {
    const firstItemName = await homePage.getFeaturedItemName(0);
    expect(firstItemName).toBe('Silk Evening Gown');

    const secondItemName = await homePage.getFeaturedItemName(1);
    expect(secondItemName).toBe('Black Tie Dress');
  });

  test('debe navegar al detalle al hacer clic en un item destacado', async ({ page }) => {
    await homePage.clickFirstFeaturedItem();
    
    // Verificar que navegó a la página de detalles
    expect(page.url()).toMatch(/\/items\/\d+/);
  });

  test('debe mostrar la sección "How it works" con 3 pasos', async () => {
    await expect(homePage.howItWorksSection).toBeVisible();
    
    const stepsCount = await homePage.getHowItWorksStepsCount();
    expect(stepsCount).toBe(3);
  });

  test('debe permitir navegar a Browse desde el header', async ({ page }) => {
    await homePage.goToBrowse();
    expect(page.url()).toContain('/search');
  });

  test('debe tener un formulario de newsletter funcional', async () => {
    await expect(homePage.newsletterEmail).toBeVisible();
    await expect(homePage.newsletterButton).toBeVisible();
    
    // Llenar el email
    await homePage.fillField(homePage.newsletterEmail, 'test@example.com');
    
    // Verificar que se llenó
    const emailValue = await homePage.newsletterEmail.inputValue();
    expect(emailValue).toBe('test@example.com');
  });

  test('debe tener todas las secciones principales visibles', async () => {
    // Featured section
    await expect(homePage.featuredSection).toBeVisible();
    await expect(homePage.featuredTitle).toBeVisible();
    
    // How it works section
    await expect(homePage.howItWorksSection).toBeVisible();
  });
});



