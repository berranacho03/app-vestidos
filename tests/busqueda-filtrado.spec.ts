import { test, expect } from '@playwright/test';
import { SearchPage } from './pages/SearchPage';

/**
 * Módulo: Búsqueda y Filtrado
 * 
 * Este archivo contiene los casos de prueba relacionados con la búsqueda y filtrado de artículos:
 * - CP-001: Búsqueda de vestidos por talla y búsqueda general
 * - CP-002: Búsqueda de zapatos por talla y búsqueda general (color)
 * - CP-003: Búsqueda sin resultados
 */

test('CP-001: Búsqueda de vestidos por talla S usando búsqueda general', async ({ page }) => {
  const searchPage = new SearchPage(page);
  await searchPage.goto();
  await searchPage.waitForLoad();

  // Buscar con filtros
  await searchPage.searchWithFilters('vestido', 'S');

  // Verificar URL contiene los parámetros
  const currentUrl = page.url();
  expect(currentUrl).toContain('q=vestido');
  expect(currentUrl).toContain('size=S');

  await page.waitForLoadState('networkidle');

  // Verificar filtros activos
  const hasActiveFilters = await searchPage.expectActiveFilters();
  if (hasActiveFilters) {
    await searchPage.expectSearchFilterBadge('vestido');
    await searchPage.expectSizeFilterBadge('S');
  }

  // Verificar resultados
  const items = searchPage.getArticleCards();
  const itemsCount = await items.count();

  if (itemsCount > 0) {
    await searchPage.expectItemsWithCategory('Vestido', 5);
    await searchPage.expectItemsWithSize('S', 5);
  } else {
    await searchPage.expectNoResultsMessage();
  }
});

test('CP-002: Búsqueda de zapatos por talla 38 y color Negro usando búsqueda general', async ({ page }) => {
  const searchPage = new SearchPage(page);
  await searchPage.goto();
  await searchPage.waitForLoad();

  await searchPage.searchWithFilters('zapatos negro', '38');

  const currentUrl = page.url();
  expect(currentUrl).toMatch(/q=zapatos.*negro|q=zapatos%20negro/i);
  expect(currentUrl).toContain('size=38');

  await page.waitForLoadState('networkidle');

  const hasActiveFilters = await searchPage.expectActiveFilters();
  if (hasActiveFilters) {
    await searchPage.expectSearchFilterBadge('zapatos negro');
    await searchPage.expectSizeFilterBadge('38');
  }

  const items = searchPage.getArticleCards();
  const itemsCount = await items.count();

  if (itemsCount > 0) {
    await searchPage.expectItemsWithCategory('Zapatos', 5);
    await searchPage.expectItemsWithSize('38', 5);
  } else {
    await searchPage.expectNoResultsMessage();
  }
});

test('CP-003: Búsqueda sin resultados con filtros que no coinciden', async ({ page }) => {
  const searchPage = new SearchPage(page);
  await searchPage.goto();
  await searchPage.waitForLoad();

  await searchPage.searchWithFilters('verde', '5XL');

  const currentUrl = page.url();
  expect(currentUrl).toContain('q=verde');
  expect(currentUrl).toContain('size=5XL');

  await page.waitForLoadState('networkidle');

  await searchPage.expectNoResultsMessage();

  const suggestionMessage = page.locator('text=/Intenta ajustar tus filtros|ajustar.*filtros/i');
  await expect(suggestionMessage).toBeVisible();

  const hasActiveFilters = await searchPage.expectActiveFilters();
  if (hasActiveFilters) {
    await searchPage.expectSearchFilterBadge('verde');
    await searchPage.expectSizeFilterBadge('5XL');
  }
});
