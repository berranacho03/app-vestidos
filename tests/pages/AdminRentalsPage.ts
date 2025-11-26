import { Page, expect } from '@playwright/test';
import { AdminDashboardPage } from './AdminDashboardPage';

/**
 * Page Object Model para la sección de gestión de alquileres en el panel de admin
 */
export class AdminRentalsPage {
  private dashboard: AdminDashboardPage;

  constructor(private page: Page) {
    this.dashboard = new AdminDashboardPage(page);
  }

  // Locators
  private readonly rentalsTable = () => 
    this.page.locator('table').filter({
      has: this.page.locator('th:has-text("ID Alquiler")')
    }).first();

  private readonly tableHead = () => this.rentalsTable().locator('thead');
  private readonly tableBody = () => this.rentalsTable().locator('tbody');
  private readonly rentalRows = () => this.tableBody().locator('tr');
  private readonly totalRentalsText = () => this.page.locator('text=/Total alquileres/i');
  private readonly noRentalsMessage = () => 
    this.rentalsTable().locator('text=/No hay alquileres programados/i');

  // Actions
  async goto() {
    await this.dashboard.goto();
    await this.dashboard.waitForLoad();
    await this.expectRentalsSectionVisible();
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.expectRentalsSectionVisible();
  }

  async getRentalRowByStatus(status: 'Pendiente' | 'Activo' | 'Cancelado') {
    const statusText = status === 'Activo' ? /Activo/i : status === 'Pendiente' ? /Pendiente/i : /Cancelado/i;
    return this.rentalRows().filter({ hasText: statusText }).first();
  }

  async getRentalRowByHash(hash: string) {
    const hashWithoutHash = hash.replace('#', '');
    return this.rentalRows().filter({ hasText: hashWithoutHash }).first();
  }

  async getRentalCount() {
    return await this.rentalRows().count();
  }

  getRentalRows() {
    return this.rentalRows();
  }

  async getPendingRentalCount() {
    const statusText = /Pendiente/i;
    const rows = this.rentalRows().filter({ hasText: statusText });
    return await rows.count();
  }

  async getActiveRentalCount() {
    const statusText = /Activo/i;
    const rows = this.rentalRows().filter({ hasText: statusText });
    return await rows.count();
  }

  async getRentalId(rentalRow: ReturnType<typeof this.rentalRows>) {
    const rentalIdCell = rentalRow.locator('td').first();
    const rentalIdHashText = await rentalIdCell.locator('span.text-slate-600').textContent();
    return rentalIdHashText?.trim() || '';
  }

  async getRentalArticleId(rentalRow: ReturnType<typeof this.rentalRows>) {
    const articleText = await rentalRow.locator('td').nth(1).textContent();
    const articleIdMatch = articleText?.match(/Artículo #(\d+)/i);
    return articleIdMatch ? articleIdMatch[1] : null;
  }

  async getRentalDates(rentalRow: ReturnType<typeof this.rentalRows>) {
    const datesText = await rentalRow.locator('td').nth(2).textContent();
    const datesMatch = datesText?.match(/(\d{4}-\d{2}-\d{2})\s*→\s*(\d{4}-\d{2}-\d{2})/);
    return {
      start: datesMatch ? datesMatch[1] : null,
      end: datesMatch ? datesMatch[2] : null
    };
  }

  async getRentalStatus(rentalRow: ReturnType<typeof this.rentalRows>) {
    const statusCell = rentalRow.locator('td').nth(4);
    const statusText = await statusCell.locator('span').first().textContent();
    return statusText?.trim() || '';
  }

  async openRentalMenu(rentalRow: ReturnType<typeof this.rentalRows>) {
    const menuButton = rentalRow.locator('button').filter({
      has: this.page.locator('svg')
    }).first();
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await this.page.waitForTimeout(500); // Esperar a que aparezca el menú
  }

  async clickApprove() {
    const approveButton = this.page.locator('button').filter({ hasText: /^Aprobar$/i }).first();
    await expect(approveButton).toBeVisible();
    await approveButton.click();
  }

  async clickCancel() {
    const cancelButton = this.page.locator('button').filter({ hasText: /^Cancelar$/i }).first();
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();
  }

  async clickDelete() {
    const deleteButton = this.page.locator('button').filter({ hasText: /^Eliminar$/i }).first();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
  }

  async waitForReload() {
    await this.page.waitForTimeout(3000); // Esperar que el modal se cierre
    await this.page.waitForURL(/\/admin$/, { timeout: 10000 });
    await expect(this.page.getByRole('heading', { name: /Alquileres programados/i })).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(1000); // Esperar que la tabla se renderice
  }

  // Verifications
  async expectRentalsSectionVisible() {
    await expect(this.page.getByRole('heading', { name: /Alquileres programados/i })).toBeVisible();
    await expect(this.totalRentalsText()).toBeVisible();
  }

  async expectRentalsTableVisible() {
    await expect(this.rentalsTable()).toBeVisible();
  }

  async expectTableHeadersVisible() {
    const tableHead = this.tableHead();
    await expect(tableHead.locator('th').filter({ hasText: /^ID Alquiler$/i }).first()).toBeVisible();
    await expect(tableHead.locator('th').filter({ hasText: /^Artículo$/i }).first()).toBeVisible();
    await expect(tableHead.locator('th').filter({ hasText: /^Fechas$/i }).first()).toBeVisible();
    await expect(tableHead.locator('th').filter({ hasText: /^Cliente$/i }).first()).toBeVisible();
    await expect(tableHead.locator('th').filter({ hasText: /^Estado$/i }).first()).toBeVisible();
    await expect(tableHead.locator('th').filter({ hasText: /^Acciones$/i }).first()).toBeVisible();
  }

  async expectRentalStatus(rentalRow: ReturnType<typeof this.rentalRows>, expectedStatus: string) {
    const statusCell = rentalRow.locator('td').nth(4);
    const statusBadge = statusCell.locator('span').filter({ hasText: new RegExp(`^${expectedStatus}$`, 'i') });
    await expect(statusBadge.first()).toBeVisible({ timeout: 5000 });
  }

  async expectRentalExists(hash: string) {
    const rentalRow = await this.getRentalRowByHash(hash);
    await expect(rentalRow).toBeVisible({ timeout: 10000 });
  }

  async expectRentalNotExists(hash: string) {
    const rentalRow = await this.getRentalRowByHash(hash);
    const count = await rentalRow.count();
    expect(count).toBe(0);
  }

  async expectActiveRentalsExist() {
    const activeCount = await this.getActiveRentalCount();
    if (activeCount > 0) {
      const firstActiveRental = await this.getRentalRowByStatus('Activo');
      await expect(firstActiveRental).toBeVisible();
      await this.expectRentalStatus(firstActiveRental, 'Activo');
    }
  }
}

