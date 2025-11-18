import { test, expect } from '@playwright/test';

/**
 * CP-004: Detalle del Artículo
 * 
 * Descripción: Visualización correcta de la página de detalle.
 * 
 * Precondición: El artículo existe en el catálogo.
 * 
 * Datos de prueba:
 * - Vestido Elegance #01 (o cualquier artículo del catálogo)
 * 
 * Pasos:
 * 1. Hacer clic en cualquier artículo del catálogo.
 * 
 * Resultado esperado: Se muestra una página con imágenes de alta calidad, descripción, 
 * información de tallas y el precio de alquiler.
 */
test('CP-004: Visualización correcta de la página de detalle del artículo', async ({ page }) => {
  // Navegar al catálogo para encontrar un artículo
  await page.goto('/search');
  
  // Verificar que estamos en la página de búsqueda
  await expect(page.locator('h1')).toContainText('Explorar catálogo');
  
  // Esperar a que los artículos se carguen
  await page.waitForSelector('div.rounded-2xl.border', { timeout: 10000 });
  
  // Buscar el primer artículo disponible o uno específico si existe "Vestido Elegance #01"
  // Intentar encontrar "Vestido Elegance #01" primero, si no existe, usar el primer artículo
  let articleLink = page.locator('a[href^="/items/"]').first();
  
  // Buscar específicamente "Vestido Elegance #01" si existe
  const eleganceLink = page.locator('text=/Vestido Elegance #01|Elegance/i').locator('..').locator('a[href^="/items/"]').first();
  const eleganceExists = await eleganceLink.count() > 0;
  
  if (eleganceExists) {
    articleLink = eleganceLink;
  }
  
  // Obtener el href del artículo para verificar la navegación
  const articleHref = await articleLink.getAttribute('href');
  expect(articleHref).toMatch(/^\/items\/\d+$/);
  
  // Paso 1: Hacer clic en cualquier artículo del catálogo
  await articleLink.click();
  
  // Esperar a que la página de detalle se cargue
  await page.waitForURL(/\/items\/\d+$/);
  
  // Resultado esperado: Verificar que se muestran todos los elementos requeridos
  
  // 1. Verificar que hay imágenes de alta calidad
  // Imagen principal (debe estar visible)
  const mainImageContainer = page.locator('div.relative.aspect-\\[3\\/4\\].rounded-2xl').first();
  await expect(mainImageContainer).toBeVisible();
  
  // Verificar que la imagen principal tiene un elemento img o está cargada
  const mainImage = mainImageContainer.locator('img').first();
  await expect(mainImage).toBeVisible({ timeout: 5000 });
  
  // Verificar que hay imágenes adicionales (si existen)
  // Las imágenes adicionales están en una grilla de 3 columnas
  const additionalImages = page.locator('div.relative.aspect-\\[3\\/4\\].rounded-xl');
  const additionalImagesCount = await additionalImages.count();
  
  // Puede haber 0 o más imágenes adicionales, pero al menos debe haber 1 imagen principal
  
  // 2. Verificar que se muestra el nombre del artículo
  const itemName = page.locator('h1').filter({ hasText: /.+/ }).first();
  await expect(itemName).toBeVisible();
  const nameText = await itemName.textContent();
  expect(nameText).toBeTruthy();
  expect(nameText?.trim().length).toBeGreaterThan(0);
  
  // 3. Verificar que se muestra la categoría
  // La categoría está en un párrafo después del h1 con clase mt-1
  const categorySection = page.locator('h1').locator('..').locator('p.mt-1').first();
  await expect(categorySection).toBeVisible();
  const categoryText = await categorySection.textContent();
  expect(categoryText).toBeTruthy();
  
  // 4. Verificar que se muestra la descripción
  // La descripción está en un párrafo con clase mt-4 después de la categoría
  const description = page.locator('p.mt-4').filter({ hasText: /.+/ }).first();
  await expect(description).toBeVisible();
  const descriptionText = await description.textContent();
  expect(descriptionText).toBeTruthy();
  expect(descriptionText?.trim().length).toBeGreaterThan(0);
  
  // 5. Verificar que se muestra el precio de alquiler
  const price = page.locator('text=/Desde.*\\$.*día|\\$.*día/i');
  await expect(price).toBeVisible();
  const priceText = await price.textContent();
  expect(priceText).toMatch(/\$\d+.*día/i);
  
  // 6. Verificar que se muestra la información de tallas
  const sizes = page.locator('text=/Tallas?:/i');
  await expect(sizes).toBeVisible();
  const sizesText = await sizes.textContent();
  expect(sizesText).toMatch(/Tallas?:/i);
  // Verificar que hay al menos una talla después de "Tallas:"
  const sizesAfterColon = sizesText?.split(':')[1]?.trim();
  expect(sizesAfterColon?.length).toBeGreaterThan(0);
  
  // 7. Verificar que se muestra el color (y posiblemente el estilo)
  const colorInfo = page.locator('text=/Color:/i');
  await expect(colorInfo).toBeVisible();
  const colorText = await colorInfo.textContent();
  expect(colorText).toMatch(/Color:/i);
  
  // 8. Verificar que hay un botón o enlace para volver al catálogo
  const backLink = page.locator('a[href="/search"], a[href*="/search"]').first();
  await expect(backLink).toBeVisible();
  await expect(backLink).toContainText(/volver|catálogo/i);
  
  // 9. Verificar que se muestra la sección de disponibilidad (calendario)
  const availabilitySection = page.locator('text=/Disponibilidad/i');
  await expect(availabilitySection).toBeVisible();
  
  // 10. Verificar que se muestra la sección de alquiler
  const rentalSection = page.locator('text=/Programar un alquiler|Alquilar/i');
  await expect(rentalSection).toBeVisible();
  
  // Verificación adicional: Verificar que la página no muestra errores 404
  const notFoundMessage = page.locator('text=/404|not found|no encontrado/i');
  const notFoundCount = await notFoundMessage.count();
  expect(notFoundCount).toBe(0);
});

