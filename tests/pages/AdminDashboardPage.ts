import { Page, expect } from '@playwright/test';

/**
 * Page Object Model para el panel de administración
 */
export class AdminDashboardPage {
  constructor(private page: Page) {}

  // Locators
  private readonly heading = () => this.page.getByRole('heading', { name: /Panel de administración/i });
  private readonly logoutButton = () => this.page.locator('button:has-text("Cerrar sesión")');
  private readonly rentalsHeading = () => this.page.getByRole('heading', { name: /Alquileres programados/i });
  private readonly totalRentalsText = () => this.page.locator('text=/Total alquileres/i');
  private readonly rentalsTable = () => 
    this.page.locator('table').filter({
      has: this.page.locator('th:has-text("ID Alquiler")')
    }).first();

  // Actions
  async goto() {
    await this.page.goto('/admin');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.heading()).toBeVisible();
  }

  async logout() {
    await this.logoutButton().click();
    // Esperar la respuesta de logout si es necesario
    await this.page.waitForTimeout(1000);
  }

  // Verifications
  async expectToBeOnDashboard() {
    await expect(this.page).toHaveURL(/\/admin$/);
    await expect(this.heading()).toBeVisible();
  }

  async expectRentalsSectionVisible() {
    await expect(this.rentalsHeading()).toBeVisible();
    await expect(this.totalRentalsText()).toBeVisible();
  }

  async expectRentalsTableVisible() {
    await expect(this.rentalsTable()).toBeVisible();
  }
}


