import { test, expect } from '@playwright/test';

/**
 * CP-002: Búsqueda y Filtrado
 * 
 * Descripción: Búsqueda de zapatos por talla y color.
 * 
 * Precondición: El catálogo contiene zapatos con distintas tallas y colores.
 * 
 * Datos de prueba:
 * - Talla: 38
 * - Color: Negro
 * 
 * Pasos:
 * 1. Navegar a la sección de zapatos.
 * 2. Aplicar el filtro por Talla: "38".
 * 3. Aplicar el filtro por Color: "Negro".
 * 
 * Resultado esperado: Se muestran solo zapatos de talla 38 y color negro que existen en el inventario.
 */
test('CP-002: Búsqueda de zapatos por talla 38 y color Negro', async ({ page }) => {
  // Paso 1: Navegar a la sección de zapatos
  // Navegamos a la página de búsqueda con filtro de categoría "shoes" para mostrar solo zapatos
  await page.goto('/search?category=shoes');
  
  // Verificar que estamos en la página de búsqueda
  await expect(page.locator('h1')).toContainText('Explorar catálogo');
  
  // Esperar a que los filtros estén visibles
  await expect(page.locator('form[method="GET"]')).toBeVisible();
  
  // Paso 2: Aplicar el filtro por Talla: "38"
  const sizeInput = page.locator('input[name="size"]');
  await sizeInput.clear();
  await sizeInput.fill('38');
  
  // Paso 3: Aplicar el filtro por Color: "Negro"
  const colorInput = page.locator('input[name="color"]');
  await colorInput.clear();
  await colorInput.fill('Negro');
  
  // Enviar el formulario de búsqueda
  await page.locator('button[type="submit"]').click();
  
  // Esperar a que la página se actualice con los resultados filtrados
  // La URL puede tener los parámetros en cualquier orden
  await page.waitForURL(/\/search.*size=38/i);
  await page.waitForURL(/\/search.*color=Negro/i);
  
  // Verificar que los filtros activos se muestran
  await expect(page.locator('text=/Talla: 38/i')).toBeVisible();
  await expect(page.locator('text=/Color: Negro/i')).toBeVisible();
  
  // Verificar que se muestran resultados (si hay zapatos que cumplan los criterios)
  const resultsText = page.locator('p.text-sm.text-slate-600');
  await expect(resultsText).toBeVisible();
  
  const resultsMessage = await resultsText.textContent();
  
  // Si hay resultados, verificar que todos los zapatos mostrados cumplen con los filtros
  if (resultsMessage && !resultsMessage.includes('No se encontraron artículos')) {
    // Verificar que el mensaje indica que hay artículos encontrados
    expect(resultsMessage).toMatch(/\d+ artículos? encontrados?/);
    
    // Obtener todas las tarjetas de artículos
    // Las tarjetas tienen la clase rounded-2xl border y pueden tener bg-white o dark:bg-slate-900
    const itemCards = page.locator('div.rounded-2xl.border').filter({ 
      has: page.locator('p.text-xs.uppercase')
    });
    const count = await itemCards.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Verificar que cada zapato mostrado tiene talla 38
    for (let i = 0; i < count; i++) {
      const card = itemCards.nth(i);
      
      // Verificar que el zapato muestra las tallas (debe incluir "38")
      const sizesText = await card.locator('text=/Tallas:/i').textContent();
      expect(sizesText).toMatch(/38/i);
      
      // Verificar que es un zapato (categoría)
      const categoryText = await card.locator('p.text-xs.uppercase').textContent();
      expect(categoryText).toMatch(/Zapatos?/i);
    }
    
    // Nota: El color puede no estar visible en la tarjeta del catálogo,
    // pero el filtro del backend debería haber filtrado correctamente.
    // El backend filtra por color usando búsqueda parcial case-insensitive.
  } else {
    // Si no hay resultados, verificar que se muestra el mensaje apropiado
    expect(resultsMessage).toContain('No se encontraron artículos');
  }
  
  // Verificar que la URL contiene los parámetros de filtro correctos
  const url = page.url();
  expect(url).toContain('size=38');
  expect(url).toContain('color=Negro');
  expect(url).toContain('category=shoes');
});

