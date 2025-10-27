import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para la página de administración
 */
export class AdminPage extends BasePage {
  readonly pageTitle: Locator;
  readonly logoutButton: Locator;
  readonly inventorySection: Locator;
  readonly addItemButton: Locator;
  
  // Modal
  readonly modal: Locator;
  readonly modalTitle: Locator;
  readonly nameInput: Locator;
  readonly categoryInput: Locator;
  readonly sizesInput: Locator;
  readonly priceInput: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  
  // Tabla de inventario
  readonly inventoryTable: Locator;
  readonly inventoryRows: Locator;
  readonly loadingMessage: Locator;

  constructor(page: Page) {
    super(page, '/admin');
    
    this.pageTitle = page.locator('h1', { hasText: 'Panel de administración' });
    this.logoutButton = page.locator('button', { hasText: 'Cerrar sesión' });
    this.inventorySection = page.locator('text=Inventario').first();
    this.addItemButton = page.locator('button', { hasText: 'Agregar item' });
    
    // Modal
    this.modal = page.locator('.fixed.inset-0');
    this.modalTitle = page.locator('h4', { hasText: 'Crear nuevo item' });
    this.nameInput = page.locator('input[placeholder="Nombre"]');
    this.categoryInput = page.locator('input[placeholder="Categoría"]');
    this.sizesInput = page.locator('input[placeholder*="Sizes"]');
    this.priceInput = page.locator('input[placeholder="Precio por día"]');
    this.createButton = page.locator('button[type="submit"]', { hasText: 'Crear' });
    this.cancelButton = page.locator('button', { hasText: 'Cancelar' });
    this.errorMessage = page.locator('.text-red-600');
    
    // Tabla
    this.inventoryTable = page.locator('table').first();
    this.inventoryRows = page.locator('tbody tr');
    this.loadingMessage = page.locator('text=Cargando...');
  }

  /**
   * Abrir el modal para agregar un item
   */
  async openAddItemModal() {
    await this.clickElement(this.addItemButton);
    await this.waitForElement(this.modal);
    await this.waitForElement(this.modalTitle);
  }

  /**
   * Llenar el formulario de crear item
   */
  async fillItemForm(data: {
    name: string;
    category?: string;
    sizes?: string;
    price: number;
  }) {
    await this.fillField(this.nameInput, data.name);
    
    if (data.category) {
      await this.categoryInput.clear();
      await this.fillField(this.categoryInput, data.category);
    }
    
    if (data.sizes) {
      await this.fillField(this.sizesInput, data.sizes);
    }
    
    await this.fillField(this.priceInput, data.price.toString());
  }

  /**
   * Crear un nuevo item (abrir modal, llenar y enviar)
   */
  async createItem(data: {
    name: string;
    category?: string;
    sizes?: string;
    price: number;
  }) {
    await this.openAddItemModal();
    await this.fillItemForm(data);
    await this.clickElement(this.createButton);
    
    // Esperar a que se cierre el modal (indica éxito)
    await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
    
    // Esperar a que la tabla se actualice
    await this.page.waitForTimeout(1000);
  }

  /**
   * Obtener el número de items en la tabla
   */
  async getItemsCount(): Promise<number> {
    // Esperar a que cargue la tabla
    await this.page.waitForTimeout(1000);
    
    const rows = await this.inventoryRows.count();
    
    // Si hay mensaje "Aún no hay items", retornar 0
    const noItemsMessage = this.page.locator('text=Aún no hay items');
    if (await noItemsMessage.isVisible()) {
      return 0;
    }
    
    return rows;
  }

  /**
   * Verificar si un item con cierto nombre existe en la tabla
   */
  async itemExistsInTable(itemName: string): Promise<boolean> {
    const cell = this.page.locator('tbody td', { hasText: itemName });
    try {
      await cell.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtener los datos de un item por nombre
   */
  async getItemByName(itemName: string): Promise<{
    id: string;
    name: string;
    category: string;
    sizes: string;
    price: string;
  } | null> {
    const rows = this.inventoryRows;
    const count = await rows.count();
    
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td');
      const name = await cells.nth(1).textContent();
      
      if (name?.includes(itemName)) {
        return {
          id: await cells.nth(0).textContent() || '',
          name: name || '',
          category: await cells.nth(2).textContent() || '',
          sizes: await cells.nth(3).textContent() || '',
          price: await cells.nth(4).textContent() || ''
        };
      }
    }
    
    return null;
  }

  /**
   * Hacer logout
   */
  async logout() {
    await this.clickElement(this.logoutButton);
  }
}



