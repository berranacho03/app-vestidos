import { test, expect } from '@playwright/test';

/**
 * CP-003: Búsqueda y Filtrado
 * 
 * Descripción: Búsqueda sin resultados.
 * 
 * Precondición: No existe ningún artículo con la combinación de filtros seleccionada.
 * 
 * Datos de prueba:
 * - Talla: 5XL
 * - Color: Verde
 * 
 * Pasos:
 * 1. Navegar a la sección de vestidos.
 * 2. Aplicar los filtros.
 * 
 * Resultado esperado: El sistema muestra un mensaje claro que indica que no se encontraron resultados.
 */
test('CP-003: Búsqueda sin resultados - Talla 5XL y Color Verde', async ({ page }) => {
  // Paso 1: Navegar a la sección de vestidos
  // Navegamos a la página de búsqueda con filtro de categoría "dress" para mostrar solo vestidos
  await page.goto('/search?category=dress');
  
  // Verificar que estamos en la página de búsqueda
  await expect(page.locator('h1')).toContainText('Explorar catálogo');
  
  // Esperar a que los filtros estén visibles
  await expect(page.locator('form[method="GET"]')).toBeVisible();
  
  // Paso 2: Aplicar los filtros que no devolverán resultados
  // Aplicar el filtro por Talla: "5XL"
  const sizeInput = page.locator('input[name="size"]');
  await sizeInput.clear();
  await sizeInput.fill('5XL');
  
  // Aplicar el filtro por Color: "Verde"
  const colorInput = page.locator('input[name="color"]');
  await colorInput.clear();
  await colorInput.fill('Verde');
  
  // Enviar el formulario de búsqueda
  await page.locator('button[type="submit"]').click();
  
  // Esperar a que la página se actualice con los resultados filtrados
  // La URL puede tener los parámetros en cualquier orden
  await page.waitForURL(/\/search.*size=5XL/i);
  await page.waitForURL(/\/search.*color=Verde/i);
  
  // Verificar que los filtros activos se muestran
  await expect(page.locator('text=/Talla: 5XL/i')).toBeVisible();
  await expect(page.locator('text=/Color: Verde/i')).toBeVisible();
  
  // Resultado esperado: Verificar que se muestra un mensaje claro indicando que no se encontraron resultados
  const resultsText = page.locator('p.text-sm.text-slate-600');
  await expect(resultsText).toBeVisible();
  
  const resultsMessage = await resultsText.textContent();
  expect(resultsMessage).toContain('No se encontraron artículos');
  
  // Verificar que se muestra el mensaje adicional de ayuda
  const helpMessage = page.locator('text=/Intenta ajustar tus filtros de búsqueda/i');
  await expect(helpMessage).toBeVisible();
  
  // Verificar que no se muestran tarjetas de artículos
  const itemCards = page.locator('div.rounded-2xl.border').filter({ 
    has: page.locator('p.text-xs.uppercase')
  });
  const count = await itemCards.count();
  expect(count).toBe(0);
  
  // Verificar que se muestra el mensaje centralizado de "No se encontraron artículos"
  const noResultsSection = page.locator('div.col-span-full.text-center');
  await expect(noResultsSection).toBeVisible();
  
  const noResultsTitle = noResultsSection.locator('p.text-lg');
  await expect(noResultsTitle).toContainText('No se encontraron artículos');
  
  const noResultsSubtitle = noResultsSection.locator('p.text-sm');
  await expect(noResultsSubtitle).toContainText('Intenta ajustar tus filtros de búsqueda');
  
  // Verificar que la URL contiene los parámetros de filtro correctos
  const url = page.url();
  expect(url).toContain('size=5XL');
  expect(url).toContain('color=Verde');
  expect(url).toContain('category=dress');
});

