import { Page, expect } from '@playwright/test';
import { AdminDashboardPage } from './AdminDashboardPage';
import { SweetAlertDialog } from './SweetAlertDialog';

/**
 * Page Object Model para la sección de gestión de inventario en el panel de admin
 */
export class AdminInventoryPage {
  private dashboard: AdminDashboardPage;

  constructor(private page: Page) {
    this.dashboard = new AdminDashboardPage(page);
  }

  // Locators
  private readonly inventoryHeading = () => this.page.getByRole('heading', { name: /Gestión de Inventario/i });
  private readonly addItemButton = () => this.page.locator('button').filter({ hasText: /Agregar Item/i });
  private readonly inventoryTable = () => this.page.locator('table, div.md\\:hidden').first();
  private readonly itemRows = () => this.inventoryTable().locator('tr.hover\\:bg-slate-50, div.md\\:hidden > div');
  private readonly modal = () => this.page.locator('div.fixed.inset-0');

  // Actions
  async goto() {
    await this.dashboard.goto();
    await this.dashboard.waitForLoad();
    await expect(this.inventoryHeading()).toBeVisible();
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.inventoryHeading()).toBeVisible();
  }

  async clickAddItem() {
    await expect(this.addItemButton()).toBeVisible();
    await this.addItemButton().click();
    await this.waitForModal();
  }

  async waitForModal() {
    await expect(this.modal().filter({ hasText: /Crear Nuevo Item|Editar Item/i })).toBeVisible();
  }

  async fillItemForm(data: {
    name?: string;
    category?: string;
    sizes?: string;
    price?: string;
    imageUrl?: string;
  }) {
    if (data.name) {
      const nameInput = this.page.locator('input[placeholder*="Vestido"]').first();
      await expect(nameInput).toBeVisible();
      await nameInput.fill(data.name);
    }

    if (data.category) {
      const categorySelect = this.page.locator('select').filter({ hasText: /Vestido|Zapatos|Bolso|Chaqueta/i });
      await expect(categorySelect).toBeVisible();
      await categorySelect.selectOption({ value: data.category });
    }

    if (data.sizes) {
      const sizesInput = this.page.locator('input[placeholder*="S, M, L"]');
      await expect(sizesInput).toBeVisible();
      await sizesInput.fill(data.sizes);
    }

    if (data.price !== undefined) {
      const priceInput = this.page.locator('input[type="number"]');
      await expect(priceInput).toBeVisible();
      await priceInput.fill(data.price);
    }

    if (data.imageUrl) {
      const imageInput = this.page.locator('input[type="url"]');
      if (await imageInput.count() > 0) {
        await imageInput.fill(data.imageUrl);
      }
    }
  }

  async submitItemForm(action: 'create' | 'update' = 'create') {
    const buttonText = action === 'create' ? /Crear Item/i : /Actualizar Item/i;
    const submitButton = this.page.locator('button[type="submit"]').filter({ hasText: buttonText });
    await expect(submitButton).toBeVisible();

    // Configurar listener para esperar la respuesta de la API
    const method = action === 'create' ? 'POST' : 'PUT';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiResponsePromise = this.page.waitForResponse(
      (response: any) => {
        const url = response.url();
        const responseMethod = response.request().method();
        return url.includes('/api/items') && responseMethod === method;
      },
      { timeout: 15000 }
    );

    await submitButton.click();

    const apiResponse = await apiResponsePromise;
    return apiResponse;
  }

  async getFirstItemRow() {
    await expect(this.itemRows().first()).toBeVisible();
    return this.itemRows().first();
  }

  async getItemId(itemRow: ReturnType<typeof this.itemRows>) {
    const itemIdCell = itemRow.locator('td').first();
    const itemIdText = await itemIdCell.locator('span').textContent();
    return itemIdText?.trim() || '';
  }

  async getItemName(itemRow: ReturnType<typeof this.itemRows>) {
    const itemNameCell = itemRow.locator('td').nth(1);
    return await itemNameCell.locator('div.font-medium').textContent();
  }

  async getItemPrice(itemRow: ReturnType<typeof this.itemRows>) {
    const priceText = await itemRow.locator('text=/\\$\\d+/').first().textContent();
    return priceText ? parseFloat(priceText.replace('$', '')) : 0;
  }

  async openItemMenu(itemRow: ReturnType<typeof this.itemRows>) {
    const menuButton = itemRow.locator('button').filter({
      has: this.page.locator('svg')
    }).first();
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await this.page.waitForTimeout(500);
  }

  async clickEdit() {
    const editButton = this.page.locator('button.text-slate-700').filter({ hasText: /^Editar$/i }).first();
    await expect(editButton).toBeVisible();
    await editButton.click();
    await this.waitForModal();
  }

  async clickDelete() {
    const deleteButton = this.page.locator('button.text-red-600').filter({ hasText: /^Eliminar$/i }).first();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
  }

  async deleteItem(itemRow: ReturnType<typeof this.itemRows>) {
    await this.openItemMenu(itemRow);
    await this.clickDelete();

    const dialog = new SweetAlertDialog(this.page);
    await dialog.waitForDialog();
    await dialog.expectTitle(/¿Estás seguro?/i);

    // Configurar listener para esperar la respuesta de la API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiResponsePromise = this.page.waitForResponse(
      (response: any) => {
        const url = response.url();
        const method = response.request().method();
        return url.includes('/api/items/') && method === 'DELETE';
      },
      { timeout: 15000 }
    );

    await dialog.confirm();

    const apiResponse = await apiResponsePromise;
    return apiResponse;
  }

  // Verifications
  async expectItemInList(itemName: string) {
    const itemNameInList = this.page.locator(`text=${itemName}`).first();
    await expect(itemNameInList).toBeVisible();
  }

  async expectItemNotInList(itemId: string) {
    const itemIdSpan = this.page.locator(`td span:has-text("${itemId}")`);
    const itemIdCount = await itemIdSpan.count();
    expect(itemIdCount).toBe(0);
  }

  async expectPriceInList(price: number) {
    const priceInList = this.page.locator(`text=$${price}`).first();
    await expect(priceInList).toBeVisible();
  }

  async expectModalTitle(expectedTitle: string | RegExp) {
    const modal = this.modal().filter({ hasText: /Crear Nuevo Item|Editar Item/i });
    const modalTitle = modal.locator('h4');
    
    if (typeof expectedTitle === 'string') {
      await expect(modalTitle).toContainText(expectedTitle);
    } else {
      const titleText = await modalTitle.textContent();
      expect(titleText).toMatch(expectedTitle);
    }
  }

  // Getter público para acceso al modal cuando sea necesario
  getModal() {
    return this.modal();
  }
}

