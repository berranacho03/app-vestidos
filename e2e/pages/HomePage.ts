import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para la página de inicio (Home)
 */
export class HomePage extends BasePage {
  // Locators del header
  readonly logo: Locator;
  readonly browseLink: Locator;
  readonly howItWorksLink: Locator;
  readonly featuredLink: Locator;
  readonly faqLink: Locator;
  readonly adminLink: Locator;
  readonly becomeLenderButton: Locator;

  // Locators del formulario de búsqueda
  readonly searchInput: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly sizeSelect: Locator;
  readonly searchButton: Locator;

  // Locators de featured items
  readonly featuredSection: Locator;
  readonly featuredTitle: Locator;
  readonly featuredItems: Locator;

  // Locators de "How it works"
  readonly howItWorksSection: Locator;
  readonly howItWorksSteps: Locator;

  // Locators del newsletter
  readonly newsletterEmail: Locator;
  readonly newsletterButton: Locator;

  constructor(page: Page) {
    super(page, '/');
    
    // Header
    this.logo = page.locator('text=GlamRent').first();
    this.browseLink = page.locator('nav a', { hasText: 'Browse' });
    this.howItWorksLink = page.locator('nav a', { hasText: 'How it works' });
    this.featuredLink = page.locator('nav a', { hasText: 'Featured' });
    this.faqLink = page.locator('nav a', { hasText: 'FAQ' });
    this.adminLink = page.locator('a', { hasText: 'Admin' });
    this.becomeLenderButton = page.locator('text=Become a lender');

    // Formulario de búsqueda
    this.searchInput = page.locator('input#query');
    this.startDateInput = page.locator('input#start').first();
    this.endDateInput = page.locator('input#end').first();
    this.sizeSelect = page.locator('select#size');
    this.searchButton = page.locator('button[type="submit"]', { hasText: 'Search dresses' });

    // Featured section
    this.featuredSection = page.locator('#featured');
    this.featuredTitle = page.locator('h2', { hasText: 'Featured picks' });
    this.featuredItems = page.locator('#featured .group');

    // How it works
    this.howItWorksSection = page.locator('#how');
    this.howItWorksSteps = page.locator('#how .rounded-2xl');

    // Newsletter
    this.newsletterEmail = page.locator('input#email[name="email"]');
    this.newsletterButton = page.locator('button', { hasText: 'Subscribe' });
  }

  /**
   * Realizar una búsqueda con todos los campos
   */
  async searchDresses(query: string, startDate: string, endDate: string, size: string = '') {
    await this.fillField(this.searchInput, query);
    await this.fillField(this.startDateInput, startDate);
    await this.fillField(this.endDateInput, endDate);
    
    if (size) {
      await this.sizeSelect.selectOption(size);
    }
    
    await this.clickElement(this.searchButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Realizar una búsqueda simple solo por texto
   */
  async searchByText(query: string) {
    await this.fillField(this.searchInput, query);
    await this.clickElement(this.searchButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Obtener el número de items destacados
   */
  async getFeaturedItemsCount(): Promise<number> {
    return await this.featuredItems.count();
  }

  /**
   * Hacer clic en un item destacado por índice
   */
  async clickFeaturedItem(index: number) {
    const item = this.featuredItems.nth(index);
    const viewDetailsButton = item.locator('text=View details');
    await this.clickElement(viewDetailsButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Hacer clic en el primer item destacado
   */
  async clickFirstFeaturedItem() {
    await this.clickFeaturedItem(0);
  }

  /**
   * Navegar a Browse
   */
  async goToBrowse() {
    await this.clickElement(this.browseLink);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verificar que la sección "How it works" tiene 3 pasos
   */
  async getHowItWorksStepsCount(): Promise<number> {
    return await this.howItWorksSteps.count();
  }

  /**
   * Suscribirse al newsletter
   */
  async subscribeToNewsletter(email: string) {
    await this.fillField(this.newsletterEmail, email);
    await this.clickElement(this.newsletterButton);
  }

  /**
   * Verificar que el header es visible
   */
  async isHeaderVisible(): Promise<boolean> {
    return await this.logo.isVisible();
  }

  /**
   * Obtener el nombre de un item destacado
   */
  async getFeaturedItemName(index: number): Promise<string> {
    const item = this.featuredItems.nth(index);
    const name = item.locator('p.font-medium');
    return await this.getElementText(name);
  }
}



