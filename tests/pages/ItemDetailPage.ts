import { Page, expect } from '@playwright/test';

/**
 * Page Object Model para la página de detalle del artículo
 */
export class ItemDetailPage {
  constructor(private page: Page) {}

  // Locators
  private readonly heading = () => this.page.locator('h1, h2').first();
  private readonly rentalForm = () => this.page.locator('form');
  private readonly calendar = () => 
    this.page.locator('[role="application"], .calendar, .grid').first();

  // Actions
  async goto(itemId: number | string) {
    await this.page.goto(`/items/${itemId}`);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.heading()).toBeVisible({ timeout: 10000 });
    await expect(this.rentalForm()).toBeVisible();
    await this.page.waitForTimeout(1000); // Esperar que el calendario se cargue
  }

  // Verifications
  async expectToBeOnItemPage(itemId: number | string) {
    await expect(this.page).toHaveURL(new RegExp(`/items/${itemId}$`));
    await expect(this.heading()).toBeVisible();
  }

  async expectCalendarVisible() {
    await expect(this.calendar()).toBeVisible({ timeout: 10000 });
  }

  async expectFormVisible() {
    await expect(this.rentalForm()).toBeVisible();
  }

  // Detail page specific locators and actions
  getBackButton() {
    return this.page.locator('a').filter({ hasText: /Volver al catálogo/i });
  }

  getMainImageContainer() {
    return this.page.locator('div.aspect-\\[3\\/4\\]').first();
  }

  getItemName() {
    return this.page.locator('h1').filter({ hasText: /.+/ }).first();
  }

  getCategoryText() {
    return this.page.locator('p.text-slate-600, p.text-slate-400').first();
  }

  getDescriptionText() {
    return this.page.locator('p.mt-4').filter({ hasText: /.+/ }).first();
  }

  getPriceText() {
    return this.page.locator('p').filter({ hasText: /Desde.*\$.*\/día|precio.*día/i }).first();
  }

  getSizesText() {
    return this.page.locator('p').filter({ hasText: /^Tallas?:/i }).first();
  }

  getColorText() {
    return this.page.locator('p').filter({ hasText: /^Color:/i }).first();
  }

  getAvailabilityHeading() {
    return this.page.locator('h2').filter({ hasText: /^Disponibilidad$/i });
  }

  getRentalHeading() {
    return this.page.locator('h2').filter({ hasText: /Programar un alquiler/i });
  }

  getCalendarGrid() {
    return this.page.locator('div.grid.grid-cols-7');
  }

  async waitForAvailabilityAPI(itemId: string) {
    await this.page.waitForResponse(
      (response) => 
        response.url().includes(`/api/items/${itemId}/availability`) &&
        response.request().method() === 'GET',
      { timeout: 10000 }
    ).catch(() => {
      // Si la API no responde, continuar con el test
    });
  }
}

