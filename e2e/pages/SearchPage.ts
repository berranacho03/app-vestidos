import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para la página de búsqueda
 */
export class SearchPage extends BasePage {
  readonly searchResults: Locator;
  readonly searchQuery: Locator;
  readonly noResultsMessage: Locator;

  constructor(page: Page) {
    super(page, '/search');
    
    this.searchResults = page.locator('[class*="grid"]'); // Grid de resultados
    this.searchQuery = page.locator('input[name="q"]');
    this.noResultsMessage = page.locator('text=/No (results|items) found/i');
  }

  /**
   * Obtener el número de resultados
   */
  async getResultsCount(): Promise<number> {
    await this.page.waitForTimeout(1000); // Esperar a que cargue
    const results = this.page.locator('.group, [class*="item"]');
    return await results.count();
  }

  /**
   * Verificar si hay mensaje de "sin resultados"
   */
  async hasNoResults(): Promise<boolean> {
    try {
      return await this.noResultsMessage.isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  }
}



