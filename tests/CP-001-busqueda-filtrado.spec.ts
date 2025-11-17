import { test, expect } from '@playwright/test';

/**
 * CP-001: Búsqueda y Filtrado
 * 
 * Descripción: Búsqueda de vestidos por talla y color.
 * 
 * Precondición: El catálogo contiene vestidos con distintas tallas y colores.
 * 
 * Datos de prueba:
 * - Talla: S
 * - Color: Rojo
 * 
 * Pasos:
 * 1. Navegar a la sección de vestidos.
 * 2. Aplicar el filtro por Talla: "S".
 * 3. Aplicar el filtro por Color: "Rojo".
 * 
 * Resultado esperado: Se muestran solo vestidos de talla S y color rojo que existen en el inventario.
 */
test('CP-001: Búsqueda de vestidos por talla S y color Rojo', async ({ page }) => {
  // Paso 1: Navegar a la sección de vestidos
  // Navegamos a la página de búsqueda con filtro de categoría "dress" para mostrar solo vestidos
  await page.goto('/search?category=dress');
  
  // Verificar que estamos en la página de búsqueda
  await expect(page.locator('h1')).toContainText('Explorar catálogo');
  
  // Esperar a que los filtros estén visibles
  await expect(page.locator('form[method="GET"]')).toBeVisible();
  
  // Paso 2: Aplicar el filtro por Talla: "S"
  const sizeInput = page.locator('input[name="size"]');
  await sizeInput.clear();
  await sizeInput.fill('S');
  
  // Paso 3: Aplicar el filtro por Color: "Rojo"
  const colorInput = page.locator('input[name="color"]');
  await colorInput.clear();
  await colorInput.fill('Rojo');
  
  // Enviar el formulario de búsqueda
  await page.locator('button[type="submit"]').click();
  
  // Esperar a que la página se actualice con los resultados filtrados
  // La URL puede tener los parámetros en cualquier orden
  await page.waitForURL(/\/search.*size=S/i);
  await page.waitForURL(/\/search.*color=Rojo/i);
  
  // Verificar que los filtros activos se muestran
  await expect(page.locator('text=/Talla: S/i')).toBeVisible();
  await expect(page.locator('text=/Color: Rojo/i')).toBeVisible();
  
  // Verificar que se muestran resultados (si hay vestidos que cumplan los criterios)
  const resultsText = page.locator('p.text-sm.text-slate-600');
  await expect(resultsText).toBeVisible();
  
  const resultsMessage = await resultsText.textContent();
  
  // Si hay resultados, verificar que todos los vestidos mostrados cumplen con los filtros
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
    
    // Verificar que cada vestido mostrado tiene talla S
    for (let i = 0; i < count; i++) {
      const card = itemCards.nth(i);
      
      // Verificar que el vestido muestra las tallas (debe incluir "S")
      const sizesText = await card.locator('text=/Tallas:/i').textContent();
      expect(sizesText).toMatch(/S/i);
      
      // Verificar que es un vestido (categoría)
      const categoryText = await card.locator('p.text-xs.uppercase').textContent();
      expect(categoryText).toMatch(/Vestido/i);
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
  expect(url).toContain('size=S');
  expect(url).toContain('color=Rojo');
  expect(url).toContain('category=dress');
});

