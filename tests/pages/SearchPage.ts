import { Page, expect } from '@playwright/test';

/**
 * Page Object Model para la página de búsqueda de artículos
 */
export class SearchPage {
  constructor(private page: Page) {}

  // Locators
  private readonly heading = () => this.page.locator('h1');
  private readonly articleCards = () => this.page.locator('a[href^="/items/"]');
  private readonly searchInput = () => this.page.locator('input[name="q"]');
  private readonly filtersSection = () => this.page.locator('text=/Filtros de búsqueda/i');
  private readonly resultsText = () => this.page.locator('text=/artículos encontrados/i');

  // Actions
  async goto() {
    await this.page.goto('/search');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.heading()).toContainText('Explorar catálogo');
    await this.page.waitForSelector('div.rounded-2xl.border', { timeout: 10000 });
  }

  async clickFirstArticle() {
    const articleLink = this.articleCards().first();
    const articleHref = await articleLink.getAttribute('href');
    expect(articleHref).toMatch(/^\/items\/\d+$/);
    
    // Usar page.goto() para mayor confiabilidad
    await this.page.goto(articleHref || '/search');
    return articleHref;
  }

  async getFirstArticleHref() {
    const articleLink = this.articleCards().first();
    return await articleLink.getAttribute('href');
  }

  async search(query: string) {
    await this.searchInput().fill(query);
    // Esperar a que los resultados se actualicen
    await this.page.waitForTimeout(500);
  }

  // Verifications
  async expectToBeOnSearchPage() {
    await expect(this.page).toHaveURL(/\/search/);
    await expect(this.heading()).toContainText('Explorar catálogo');
  }

  async expectArticlesVisible() {
    const count = await this.articleCards().count();
    expect(count).toBeGreaterThan(0);
  }

  async expectResultsCount(expectedText: string) {
    await expect(this.resultsText()).toContainText(expectedText);
  }

  // Search and filter actions
  async fillSearchQuery(query: string) {
    await expect(this.searchInput()).toBeVisible();
    await this.searchInput().fill(query);
    await this.page.waitForTimeout(300);
  }

  async fillSize(size: string) {
    const sizeInput = this.page.locator('input[name="size"]');
    await expect(sizeInput).toBeVisible();
    await sizeInput.fill(size);
  }

  async submitSearch() {
    const searchButton = this.page.locator('button[type="submit"]').filter({
      hasText: /Buscar artículos|Buscar/i
    });
    await expect(searchButton).toBeVisible();
    return searchButton.click();
  }

  async searchWithFilters(query: string, size?: string) {
    await this.fillSearchQuery(query);
    if (size) {
      await this.fillSize(size);
    }
    const navigationPromise = this.page.waitForURL(/\/search\?/, { timeout: 10000 });
    await this.submitSearch();
    await navigationPromise;
  }

  // Verifications for search results
  async expectActiveFilters() {
    const activeFilters = this.page.locator('text=/Filtros activos/i');
    const hasActiveFilters = await activeFilters.count() > 0;
    return hasActiveFilters;
  }

  async expectSearchFilterBadge(query: string) {
    const searchFilter = this.page.locator('span.bg-fuchsia-100').filter({
      hasText: new RegExp(`Búsqueda.*${query}`, 'i')
    }).first();
    await expect(searchFilter).toBeVisible();
  }

  async expectSizeFilterBadge(size: string) {
    const sizeFilter = this.page.locator('span.bg-green-100').filter({
      hasText: new RegExp(`^Talla: ${size}$`)
    }).first();
    await expect(sizeFilter).toBeVisible();
  }

  async expectNoResultsMessage() {
    const noResultsMessage = this.page.locator('p.text-lg.text-slate-900').filter({
      hasText: /^No se encontraron artículos$/
    }).first();
    await expect(noResultsMessage).toBeVisible();
  }

  async expectItemsWithCategory(category: string, count: number = 5) {
    const items = this.articleCards();
    const itemsCount = await items.count();

    if (itemsCount > 0) {
      for (let i = 0; i < Math.min(itemsCount, count); i++) {
        const itemCard = this.page.locator('div.rounded-2xl.border').nth(i);
        const categoryText = itemCard.locator('p.text-xs.uppercase').filter({
          hasText: new RegExp(`^${category}$`)
        }).first();
        await expect(categoryText).toBeVisible();
      }
    }
  }

  async expectItemsWithSize(size: string, count: number = 5) {
    const items = this.articleCards();
    const itemsCount = await items.count();

    if (itemsCount > 0) {
      for (let i = 0; i < Math.min(itemsCount, count); i++) {
        const itemCard = this.page.locator('div.rounded-2xl.border').nth(i);
        const sizesText = await itemCard.locator('text=/Tallas?:/i').textContent();
        expect(sizesText?.toUpperCase()).toContain(size.toUpperCase());
      }
    }
  }

  getArticleCards() {
    return this.articleCards();
  }
}

