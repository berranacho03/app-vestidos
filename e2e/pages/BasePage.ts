import { Page, Locator } from '@playwright/test';

/**
 * Clase base para todos los Page Objects
 * Contiene métodos comunes y utilidades
 */
export class BasePage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page, url: string = '') {
    this.page = page;
    this.url = url;
  }

  /**
   * Navegar a la página
   */
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Obtener el título de la página
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Verificar si estamos en la URL correcta
   */
  async isAt(): Promise<boolean> {
    return this.page.url().includes(this.url);
  }

  /**
   * Esperar a que un elemento sea visible
   */
  async waitForElement(locator: Locator, timeout: number = 5000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Llenar un campo de texto
   */
  async fillField(locator: Locator, value: string) {
    await locator.clear();
    await locator.fill(value);
  }

  /**
   * Hacer clic en un elemento después de que sea visible
   */
  async clickElement(locator: Locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /**
   * Obtener texto de un elemento
   */
  async getElementText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return await locator.textContent() || '';
  }

  /**
   * Tomar screenshot
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
  }
}



