import { test, expect } from '@playwright/test';

/**
 * Módulo: Detalle del Artículo
 * 
 * Este archivo contiene los casos de prueba relacionados con la visualización del detalle de un artículo:
 * - CP-004: Visualización correcta de la página de detalle
 */

/**
 * CP-004: Detalle del Artículo - Visualización correcta de la página de detalle
 * 
 * Descripción: Visualización correcta de la página de detalle.
 * 
 * Precondición: El artículo existe en el catálogo.
 * 
 * Datos de prueba:
 * - Cualquier artículo del catálogo (ej: Vestido Elegance #01)
 * 
 * Pasos:
 * 1. Hacer clic en cualquier artículo del catálogo.
 * 
 * Resultado esperado: Se muestra una página con imágenes (principal y miniaturas si existen), 
 * nombre del artículo, categoría, descripción, información de tallas, color (y estilo si existe), 
 * precio de alquiler por día, calendario de disponibilidad y formulario de alquiler.
 */
test('CP-004: Visualización correcta de la página de detalle', async ({ page }) => {
  // Paso 1: Navegar a la página de búsqueda para acceder al catálogo
  await page.goto('/search');
  
  // Verificar que estamos en la página de búsqueda
  await expect(page.locator('h1')).toContainText(/Explorar catálogo|Catálogo/i);
  
  // Esperar a que los artículos se carguen
  await page.waitForSelector('div.rounded-2xl.border', { timeout: 10000 });
  
  // Buscar el primer artículo disponible en el catálogo
  const articleLink = page.locator('a[href^="/items/"]').first();
  await expect(articleLink).toBeVisible();
  
  // Obtener el href del artículo para verificar la ruta
  const articleHref = await articleLink.getAttribute('href');
  expect(articleHref).toMatch(/^\/items\/\d+$/);
  
  // Hacer clic en el artículo
  await articleLink.click();
  
  // Esperar a que la página de detalle se cargue
  await page.waitForURL(/\/items\/\d+$/);
  
  // Resultado esperado: Verificar que se muestran todos los elementos esperados
  
  // 1. Verificar que existe el botón "Volver al catálogo"
  const backButton = page.locator('a').filter({ hasText: /Volver al catálogo/i });
  await expect(backButton).toBeVisible();
  expect(await backButton.getAttribute('href')).toBe('/search');
  
  // 2. Verificar que se muestra la imagen principal del artículo
  // La imagen principal está en un div con aspect-[3/4] y contiene un Image de Next.js
  const mainImageContainer = page.locator('div.aspect-\\[3\\/4\\]').first();
  await expect(mainImageContainer).toBeVisible();
  
  // Verificar que hay al menos una imagen (Next.js Image component)
  const mainImage = mainImageContainer.locator('img').first();
  await expect(mainImage).toBeVisible();
  
  // 3. Verificar que se muestra el nombre del artículo
  const itemName = page.locator('h1').filter({ hasText: /.+/ }).first();
  await expect(itemName).toBeVisible();
  const nameText = await itemName.textContent();
  expect(nameText).toBeTruthy();
  expect(nameText?.trim().length).toBeGreaterThan(0);
  
  // 4. Verificar que se muestra la categoría del artículo
  const categoryText = page.locator('p.text-slate-600, p.text-slate-400').first();
  await expect(categoryText).toBeVisible();
  const categoryValue = await categoryText.textContent();
  expect(categoryValue).toBeTruthy();
  
  // 5. Verificar que se muestra la descripción del artículo
  const descriptionText = page.locator('p.mt-4').filter({ hasText: /.+/ }).first();
  await expect(descriptionText).toBeVisible();
  const descriptionValue = await descriptionText.textContent();
  expect(descriptionValue).toBeTruthy();
  expect(descriptionValue?.trim().length).toBeGreaterThan(0);
  
  // 6. Verificar que se muestra el precio de alquiler por día
  const priceText = page.locator('p').filter({ hasText: /Desde.*\$.*\/día|precio.*día/i });
  await expect(priceText.first()).toBeVisible();
  const priceValue = await priceText.first().textContent();
  expect(priceValue).toMatch(/Desde\s+\$\d+\.?\d*\s*\/\s*día|Desde\s+\$\d+\.?\d*\s*\/\s*día/i);
  
  // 7. Verificar que se muestra la información de tallas
  const sizesText = page.locator('p').filter({ hasText: /^Tallas?:/i });
  await expect(sizesText.first()).toBeVisible();
  const sizesValue = await sizesText.first().textContent();
  expect(sizesValue).toMatch(/Tallas?:\s*.+/i);
  
  // 8. Verificar que se muestra el color (y estilo si existe)
  const colorText = page.locator('p').filter({ hasText: /^Color:/i });
  await expect(colorText.first()).toBeVisible();
  const colorValue = await colorText.first().textContent();
  expect(colorValue).toMatch(/Color:\s*.+/i);
  
  // 9. Verificar que se muestra la sección de "Disponibilidad" con el calendario
  const availabilityHeading = page.locator('h2').filter({ hasText: /^Disponibilidad$/i });
  await expect(availabilityHeading).toBeVisible();
  
  // Verificar que existe el componente de calendario (ItemCalendar)
  // El calendario se renderiza como un div con fechas seleccionables
  const calendarContainer = availabilityHeading.locator('..').locator('div').filter({ hasText: /.+/ });
  await expect(calendarContainer.first()).toBeVisible();
  
  // 10. Verificar que se muestra la sección "Programar un alquiler" con el formulario
  const rentalHeading = page.locator('h2').filter({ hasText: /Programar un alquiler/i });
  await expect(rentalHeading).toBeVisible();
  
  // Verificar que existe el formulario de alquiler
  const rentalForm = page.locator('form');
  await expect(rentalForm).toBeVisible();
  
  // Verificar que el formulario tiene campos para fechas (como mínimo)
  const startDateInput = rentalForm.locator('input[name="start"]');
  const endDateInput = rentalForm.locator('input[name="end"]');
  await expect(startDateInput).toBeVisible();
  await expect(endDateInput).toBeVisible();
  
  // Verificar que hay un botón de envío en el formulario
  const submitButton = rentalForm.locator('button[type="submit"]');
  await expect(submitButton).toBeVisible();
  
  // 11. Verificar que se muestran imágenes en miniatura si hay más de una imagen
  // Las miniaturas están en un grid con 3 columnas después de la imagen principal
  const thumbnailGrid = page.locator('div.grid.grid-cols-3');
  const thumbnailCount = await thumbnailGrid.count();
  
  if (thumbnailCount > 0) {
    // Si hay grid de miniaturas, verificar que las miniaturas son visibles
    const thumbnails = thumbnailGrid.first().locator('div.aspect-\\[3\\/4\\]').locator('img');
    const thumbnailsCount = await thumbnails.count();
    
    // Verificar que hay al menos una miniatura si existe el grid
    if (thumbnailsCount > 0) {
      await expect(thumbnails.first()).toBeVisible();
    }
  }
  
  // Resultado esperado: Se verificaron todos los elementos principales de la página de detalle:
  // ✅ Imagen principal
  // ✅ Nombre del artículo
  // ✅ Categoría
  // ✅ Descripción
  // ✅ Precio de alquiler por día
  // ✅ Información de tallas
  // ✅ Color (y estilo si existe)
  // ✅ Calendario de disponibilidad
  // ✅ Formulario de alquiler
  // ✅ Imágenes en miniatura (si existen)
});

