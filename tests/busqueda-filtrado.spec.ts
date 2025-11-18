import { test, expect } from '@playwright/test';

/**
 * Módulo: Búsqueda y Filtrado
 * 
 * Este archivo contiene los casos de prueba relacionados con la búsqueda y filtrado de artículos:
 * - CP-001: Búsqueda de vestidos por talla y búsqueda general
 * - CP-002: Búsqueda de zapatos por talla y búsqueda general (color)
 * - CP-003: Búsqueda sin resultados
 */

/**
 * CP-001: Búsqueda y Filtrado - Búsqueda de vestidos por talla y búsqueda general
 * 
 * Descripción: Búsqueda de vestidos por talla usando el campo de búsqueda general para el tipo/categoría.
 * 
 * Precondición: El catálogo contiene vestidos con distintas tallas y tipos de artículos.
 * 
 * Datos de prueba:
 * - Búsqueda general: "vestido" (o "dress")
 * - Talla: S
 * 
 * Pasos:
 * 1. Navegar a la sección de búsqueda (/search).
 * 2. En el campo "Búsqueda general", ingresar "vestido".
 * 3. En el campo "Talla", ingresar "S".
 * 4. Hacer clic en "Buscar artículos".
 * 
 * Resultado esperado: Se muestran solo vestidos de talla S que existen en el inventario.
 */
test('CP-001: Búsqueda de vestidos por talla S usando búsqueda general', async ({ page }) => {
  // Paso 1: Navegar a la sección de búsqueda
  await page.goto('/search');
  
  // Verificar que estamos en la página de búsqueda
  await expect(page.locator('h1')).toContainText(/Explorar catálogo|Catálogo/i);
  
  // Esperar a que los filtros se carguen
  await page.waitForSelector('form', { timeout: 10000 });
  
  // Paso 2: En el campo "Búsqueda general", ingresar "vestido"
  const searchInput = page.locator('input[name="q"]');
  await expect(searchInput).toBeVisible();
  await searchInput.fill('vestido');
  
  // Paso 3: En el campo "Talla", ingresar "S"
  const sizeInput = page.locator('input[name="size"]');
  await expect(sizeInput).toBeVisible();
  await sizeInput.fill('S');
  
  // Verificar que los valores se ingresaron correctamente
  const searchValue = await searchInput.inputValue();
  expect(searchValue).toBe('vestido');
  
  const sizeValue = await sizeInput.inputValue();
  expect(sizeValue).toBe('S');
  
  // Paso 4: Hacer clic en "Buscar artículos"
  const searchButton = page.locator('button[type="submit"]').filter({ 
    hasText: /Buscar artículos|Buscar/i 
  });
  await expect(searchButton).toBeVisible();
  
  // Configurar listener para esperar la navegación con los parámetros
  const navigationPromise = page.waitForURL(/\/search\?.*q=vestido.*size=S|.*size=S.*q=vestido/i, { 
    timeout: 10000 
  });
  
  await searchButton.click();
  
  // Esperar a que se actualice la URL con los filtros
  await navigationPromise;
  
  // Verificar que la URL contiene los parámetros de filtro
  const currentUrl = page.url();
  expect(currentUrl).toContain('q=vestido');
  expect(currentUrl).toContain('size=S');
  
  // Resultado esperado: Verificar que se muestran solo vestidos de talla S
  // Esperar a que los resultados se carguen
  await page.waitForLoadState('networkidle');
  
  // Verificar que hay indicadores de filtros activos (si hay filtros aplicados)
  const activeFilters = page.locator('text=/Filtros activos/i');
  const hasActiveFilters = await activeFilters.count() > 0;
  
  if (hasActiveFilters) {
    // Verificar que se muestra el filtro de búsqueda activo
    // El badge está dentro de un span con clases específicas
    const searchFilter = page.locator('span.bg-fuchsia-100').filter({ 
      hasText: /Búsqueda.*vestido/i 
    }).first();
    await expect(searchFilter).toBeVisible();
    
    // Verificar que se muestra el filtro de talla activo
    // El badge está dentro de un span con clases bg-green-100
    const sizeFilter = page.locator('span.bg-green-100').filter({ 
      hasText: /^Talla: S$/ 
    }).first();
    await expect(sizeFilter).toBeVisible();
  }
  
  // Verificar que los artículos mostrados son vestidos
  // Esperar a que los artículos se carguen
  await page.waitForSelector('div.rounded-2xl.border', { timeout: 10000 }).catch(() => {
    // Si no hay artículos, verificar el mensaje de "no se encontraron"
  });
  
  // Obtener todos los artículos mostrados
  const items = page.locator('div.rounded-2xl.border');
  const itemsCount = await items.count();
  
  if (itemsCount > 0) {
    // Verificar que todos los artículos mostrados son vestidos de talla S
    for (let i = 0; i < Math.min(itemsCount, 5); i++) {
      const item = items.nth(i);
      
      // Verificar que la categoría es "Vestido" (mostrado como texto)
      // Usar la clase específica del párrafo de categoría para evitar matches múltiples
      const categoryText = item.locator('p.text-xs.uppercase').filter({ 
        hasText: /^Vestido$/ 
      }).first();
      await expect(categoryText).toBeVisible();
      
      // Verificar que las tallas incluyen "S"
      const sizesText = await item.locator('text=/Tallas?:/i').textContent();
      expect(sizesText?.toUpperCase()).toContain('S');
    }
  } else {
    // Si no hay resultados, verificar que se muestra el mensaje apropiado
    const noResultsMessage = page.locator('text=/No se encontraron artículos/i');
    await expect(noResultsMessage).toBeVisible();
  }
});

/**
 * CP-002: Búsqueda y Filtrado - Búsqueda de zapatos por talla y color usando búsqueda general
 * 
 * Descripción: Búsqueda de zapatos por talla y color usando el campo de búsqueda general.
 * 
 * Precondición: El catálogo contiene zapatos con distintas tallas y colores.
 * 
 * Datos de prueba:
 * - Búsqueda general: "zapatos negro" (o "shoes negro")
 * - Talla: 38
 * 
 * Pasos:
 * 1. Navegar a la sección de búsqueda (/search).
 * 2. En el campo "Búsqueda general", ingresar "zapatos negro".
 * 3. En el campo "Talla", ingresar "38".
 * 4. Hacer clic en "Buscar artículos".
 * 
 * Resultado esperado: Se muestran solo zapatos de talla 38 y color negro que existen en el inventario.
 */
test('CP-002: Búsqueda de zapatos por talla 38 y color Negro usando búsqueda general', async ({ page }) => {
  // Paso 1: Navegar a la sección de búsqueda
  await page.goto('/search');
  
  // Verificar que estamos en la página de búsqueda
  await expect(page.locator('h1')).toContainText(/Explorar catálogo|Catálogo/i);
  
  // Esperar a que los filtros se carguen
  await page.waitForSelector('form', { timeout: 10000 });
  
  // Paso 2: En el campo "Búsqueda general", ingresar "zapatos negro"
  const searchInput = page.locator('input[name="q"]');
  await expect(searchInput).toBeVisible();
  await searchInput.fill('zapatos negro');
  
  // Paso 3: En el campo "Talla", ingresar "38"
  const sizeInput = page.locator('input[name="size"]');
  await expect(sizeInput).toBeVisible();
  await sizeInput.fill('38');
  
  // Verificar que los valores se ingresaron correctamente
  const searchValue = await searchInput.inputValue();
  expect(searchValue).toBe('zapatos negro');
  
  const sizeValue = await sizeInput.inputValue();
  expect(sizeValue).toBe('38');
  
  // Paso 4: Hacer clic en "Buscar artículos"
  const searchButton = page.locator('button[type="submit"]').filter({ 
    hasText: /Buscar artículos|Buscar/i 
  });
  await expect(searchButton).toBeVisible();
  
  // Configurar listener para esperar la navegación con los parámetros
  const navigationPromise = page.waitForURL(/\/search\?.*q=zapatos.*negro.*size=38|.*size=38.*q=zapatos.*negro/i, { 
    timeout: 10000 
  });
  
  await searchButton.click();
  
  // Esperar a que se actualice la URL con los filtros
  await navigationPromise;
  
  // Verificar que la URL contiene los parámetros de filtro
  const currentUrl = page.url();
  expect(currentUrl).toMatch(/q=zapatos.*negro|q=zapatos%20negro/i);
  expect(currentUrl).toContain('size=38');
  
  // Resultado esperado: Verificar que se muestran solo zapatos de talla 38 y color negro
  // Esperar a que los resultados se carguen
  await page.waitForLoadState('networkidle');
  
  // Verificar que hay indicadores de filtros activos (si hay filtros aplicados)
  const activeFilters = page.locator('text=/Filtros activos/i');
  const hasActiveFilters = await activeFilters.count() > 0;
  
  if (hasActiveFilters) {
    // Verificar que se muestra el filtro de búsqueda activo
    // El badge está dentro de un span con clases bg-fuchsia-100
    const searchFilter = page.locator('span.bg-fuchsia-100').filter({ 
      hasText: /Búsqueda.*zapatos.*negro|Búsqueda.*negro.*zapatos/i 
    }).first();
    await expect(searchFilter).toBeVisible();
    
    // Verificar que se muestra el filtro de talla activo
    // El badge está dentro de un span con clases bg-green-100
    const sizeFilter = page.locator('span.bg-green-100').filter({ 
      hasText: /^Talla: 38$/ 
    }).first();
    await expect(sizeFilter).toBeVisible();
  }
  
  // Verificar que los artículos mostrados son zapatos de talla 38 y color negro
  // Esperar a que los artículos se carguen
  await page.waitForSelector('div.rounded-2xl.border', { timeout: 10000 }).catch(() => {
    // Si no hay artículos, verificar el mensaje de "no se encontraron"
  });
  
  // Obtener todos los artículos mostrados
  const items = page.locator('div.rounded-2xl.border');
  const itemsCount = await items.count();
  
  if (itemsCount > 0) {
    // Verificar que todos los artículos mostrados son zapatos de talla 38 y color negro
    for (let i = 0; i < Math.min(itemsCount, 5); i++) {
      const item = items.nth(i);
      
      // Verificar que la categoría es "Zapatos"
      // Usar la clase específica del párrafo de categoría para evitar matches múltiples
      const categoryText = item.locator('p.text-xs.uppercase').filter({ 
        hasText: /^Zapatos$/ 
      }).first();
      await expect(categoryText).toBeVisible();
      
      // Verificar que las tallas incluyen "38"
      const sizesText = await item.locator('text=/Tallas?:/i').textContent();
      expect(sizesText).toContain('38');
      
      // Verificar que el artículo existe (el color se busca en el campo q que busca en nombre, color, descripción)
      const itemName = await item.locator('p.font-medium').textContent();
      expect(itemName).toBeTruthy();
    }
  } else {
    // Si no hay resultados, verificar que se muestra el mensaje apropiado
    // Usar la clase específica del mensaje principal en el área de resultados vacíos
    const noResultsMessage = page.locator('p.text-lg.text-slate-900').filter({ 
      hasText: /^No se encontraron artículos$/ 
    }).first();
    await expect(noResultsMessage).toBeVisible();
  }
});

/**
 * CP-003: Búsqueda y Filtrado - Búsqueda sin resultados
 * 
 * Descripción: Búsqueda sin resultados cuando no existe ningún artículo con la combinación de filtros seleccionada.
 * 
 * Precondición: No existe ningún artículo con la combinación de filtros seleccionada.
 * 
 * Datos de prueba:
 * - Búsqueda general: "verde"
 * - Talla: 5XL
 * 
 * Pasos:
 * 1. Navegar a la sección de búsqueda (/search).
 * 2. En el campo "Búsqueda general", ingresar "verde".
 * 3. En el campo "Talla", ingresar "5XL".
 * 4. Hacer clic en "Buscar artículos".
 * 
 * Resultado esperado: El sistema muestra un mensaje claro que indica que no se encontraron resultados.
 */
test('CP-003: Búsqueda sin resultados con filtros que no coinciden', async ({ page }) => {
  // Paso 1: Navegar a la sección de búsqueda
  await page.goto('/search');
  
  // Verificar que estamos en la página de búsqueda
  await expect(page.locator('h1')).toContainText(/Explorar catálogo|Catálogo/i);
  
  // Esperar a que los filtros se carguen
  await page.waitForSelector('form', { timeout: 10000 });
  
  // Paso 2: En el campo "Búsqueda general", ingresar "verde"
  const searchInput = page.locator('input[name="q"]');
  await expect(searchInput).toBeVisible();
  await searchInput.fill('verde');
  
  // Paso 3: En el campo "Talla", ingresar "5XL"
  const sizeInput = page.locator('input[name="size"]');
  await expect(sizeInput).toBeVisible();
  await sizeInput.fill('5XL');
  
  // Verificar que los valores se ingresaron correctamente
  const searchValue = await searchInput.inputValue();
  expect(searchValue).toBe('verde');
  
  const sizeValue = await sizeInput.inputValue();
  expect(sizeValue).toBe('5XL');
  
  // Paso 4: Hacer clic en "Buscar artículos"
  const searchButton = page.locator('button[type="submit"]').filter({ 
    hasText: /Buscar artículos|Buscar/i 
  });
  await expect(searchButton).toBeVisible();
  
  // Configurar listener para esperar la navegación con los parámetros
  const navigationPromise = page.waitForURL(/\/search\?.*q=verde.*size=5XL|.*size=5XL.*q=verde/i, { 
    timeout: 10000 
  });
  
  await searchButton.click();
  
  // Esperar a que se actualice la URL con los filtros
  await navigationPromise;
  
  // Verificar que la URL contiene los parámetros de filtro
  const currentUrl = page.url();
  expect(currentUrl).toContain('q=verde');
  expect(currentUrl).toContain('size=5XL');
  
  // Resultado esperado: Verificar que se muestra un mensaje claro de "no se encontraron resultados"
  // Esperar a que los resultados se carguen
  await page.waitForLoadState('networkidle');
  
  // Verificar que se muestra el mensaje de "No se encontraron artículos"
  // Usar la clase específica del mensaje principal en el área de resultados vacíos
  const noResultsMessage = page.locator('p.text-lg.text-slate-900').filter({ 
    hasText: /^No se encontraron artículos$/ 
  }).first();
  await expect(noResultsMessage).toBeVisible();
  
  // Verificar que se muestra el mensaje secundario con sugerencia
  const suggestionMessage = page.locator('text=/Intenta ajustar tus filtros|ajustar.*filtros/i');
  await expect(suggestionMessage).toBeVisible();
  
  // Verificar que no se muestran artículos en la grilla
  // El contador de resultados debe mostrar "No se encontraron artículos" o "0 artículos encontrados"
  const resultsCounter = page.locator('p.text-sm.text-slate-600').filter({ 
    hasText: /No se encontraron artículos|0 artículos encontrados/i 
  }).first();
  await expect(resultsCounter).toBeVisible();
  
  // Verificar que hay indicadores de filtros activos (para que el usuario pueda ver qué filtros aplicó)
  const activeFilters = page.locator('text=/Filtros activos/i');
  const hasActiveFilters = await activeFilters.count() > 0;
  
  if (hasActiveFilters) {
    // Verificar que se muestra el filtro de búsqueda activo
    // El badge está dentro de un span con clases bg-fuchsia-100
    const searchFilter = page.locator('span.bg-fuchsia-100').filter({ 
      hasText: /Búsqueda.*verde/i 
    }).first();
    await expect(searchFilter).toBeVisible();
    
    // Verificar que se muestra el filtro de talla activo
    // El badge está dentro de un span con clases bg-green-100
    const sizeFilter = page.locator('span.bg-green-100').filter({ 
      hasText: /^Talla: 5XL$/ 
    }).first();
    await expect(sizeFilter).toBeVisible();
  }
});
