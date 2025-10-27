import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para la página de detalles de un artículo
 */
export class ItemDetailPage extends BasePage {
  readonly itemTitle: Locator;
  readonly itemCategory: Locator;
  readonly itemDescription: Locator;
  readonly itemPrice: Locator;
  readonly itemSizes: Locator;
  readonly itemColor: Locator;

  // Formulario de reserva
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly requestRentalButton: Locator;

  // Calendario
  readonly availabilitySection: Locator;

  constructor(page: Page, itemId?: number) {
    super(page, itemId ? `/items/${itemId}` : '/items/');
    
    this.itemTitle = page.locator('h1');
    this.itemCategory = page.locator('p.capitalize');
    this.itemDescription = page.locator('p').nth(1); // Segunda etiqueta p
    this.itemPrice = page.locator('text=/From \\$\\d+\\/day/');
    this.itemSizes = page.locator('text=/Sizes:/');
    this.itemColor = page.locator('text=/Color:/');

    // Formulario
    this.nameInput = page.locator('input#name');
    this.emailInput = page.locator('input#email');
    this.phoneInput = page.locator('input#phone');
    this.startDateInput = page.locator('input#start').nth(1); // El segundo input#start (primero está en header)
    this.endDateInput = page.locator('input#end').nth(1);
    this.requestRentalButton = page.locator('button', { hasText: 'Request rental' });

    this.availabilitySection = page.locator('h2', { hasText: 'Availability' });
  }

  /**
   * Llenar el formulario de reserva completo
   */
  async fillRentalForm(data: {
    name: string;
    email: string;
    phone: string;
    startDate: string;
    endDate: string;
  }) {
    await this.fillField(this.nameInput, data.name);
    await this.fillField(this.emailInput, data.email);
    await this.fillField(this.phoneInput, data.phone);
    await this.fillField(this.startDateInput, data.startDate);
    await this.fillField(this.endDateInput, data.endDate);
  }

  /**
   * Enviar formulario de reserva
   */
  async submitRentalRequest(data: {
    name: string;
    email: string;
    phone: string;
    startDate: string;
    endDate: string;
  }) {
    await this.fillRentalForm(data);
    await this.clickElement(this.requestRentalButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Obtener el nombre del artículo
   */
  async getItemName(): Promise<string> {
    return await this.getElementText(this.itemTitle);
  }

  /**
   * Obtener el precio del artículo
   */
  async getItemPrice(): Promise<string> {
    return await this.getElementText(this.itemPrice);
  }

  /**
   * Verificar si el calendario de disponibilidad es visible
   */
  async isAvailabilityVisible(): Promise<boolean> {
    return await this.availabilitySection.isVisible();
  }

  /**
   * Verificar si el formulario de reserva es visible
   */
  async isRentalFormVisible(): Promise<boolean> {
    return await this.nameInput.isVisible();
  }

  /**
   * Obtener la categoría del artículo
   */
  async getItemCategory(): Promise<string> {
    return await this.getElementText(this.itemCategory);
  }
}



