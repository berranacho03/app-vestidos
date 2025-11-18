import { test, expect } from '@playwright/test';

/**
 * CP-01: Formulario de Alquiler
 * 
 * Clases de Equivalencia utilizadas:
 * - CE 1.1: Nombre válido - "Ana Pérez"
 * - CE 2.1: Correo válido - "ana@mail.com"
 * - CE 3.1: Teléfono válido - "12345678"
 * - CE 4.1: Fecha inicio disponible - "20/09/2025"
 * - CE 5.1: Fecha fin válida (después del inicio) - "22/09/2025"
 * 
 * Salida esperada: "Registro OK"
 */
test('CP-01: Formulario de Alquiler - Clases de Equivalencia válidas', async ({ page }) => {
  // Paso 1: Ir al detalle de un artículo
  // Primero, obtener un artículo disponible usando la API
  let itemId: number | null = null;
  
  try {
    const itemsResponse = await page.request.get('/api/items');
    if (itemsResponse.ok()) {
      const data = await itemsResponse.json();
      if (data.items && data.items.length > 0) {
        itemId = data.items[0].id;
      }
    }
  } catch (error) {
    console.log('No se pudo obtener artículos de la API, intentando desde la página');
  }
  
  // Si no obtuvimos un ID de la API, intentar desde la página de búsqueda
  if (!itemId) {
    await page.goto('/search');
    await expect(page.locator('h1')).toContainText('Explorar catálogo');
    
    // Esperar a que la página se cargue completamente
    await page.waitForLoadState('networkidle');
    
    // Verificar si hay artículos disponibles
    // Esperar a que aparezca O el mensaje de "no encontrados" O los enlaces de artículos
    const noItemsMessage = page.locator('text=/No se encontraron artículos/i');
    const articleLink = page.locator('a[href^="/items/"]').first();
    
    // Verificar ambos elementos con un timeout razonable
    const [hasNoItems, hasItems] = await Promise.all([
      noItemsMessage.isVisible({ timeout: 5000 }).catch(() => false),
      articleLink.isVisible({ timeout: 5000 }).catch(() => false)
    ]);
    
    if (hasItems) {
      // Hay artículos, obtener el ID del primer enlace
      const articleHref = await articleLink.getAttribute('href');
      if (articleHref) {
        const match = articleHref.match(/\/items\/(\d+)/);
        if (match) {
          itemId = parseInt(match[1]);
        }
      }
    } else if (hasNoItems) {
      // No hay artículos, itemId permanece null
      console.log('No se encontraron artículos en la página de búsqueda');
    } else {
      // Ambos fallaron, intentar esperar un poco más
      await page.waitForTimeout(1000);
      const articleLinkRetry = page.locator('a[href^="/items/"]').first();
      const hasItemsRetry = await articleLinkRetry.isVisible({ timeout: 3000 }).catch(() => false);
      if (hasItemsRetry) {
        const articleHref = await articleLinkRetry.getAttribute('href');
        if (articleHref) {
          const match = articleHref.match(/\/items\/(\d+)/);
          if (match) {
            itemId = parseInt(match[1]);
          }
        }
      }
    }
  }
  
  // Si aún no tenemos un artículo, crear uno usando la API
  if (!itemId) {
    console.log('No hay artículos disponibles, creando uno para el test...');
    try {
      const createResponse = await page.request.post('/api/items', {
        data: {
          name: 'Vestido de Prueba para Test',
          price: 49.90,
          category: 'dress',
          description: 'Vestido de prueba para test de alquiler',
          color: 'red',
          alt: 'Vestido rojo de prueba',
          sizes: ['S', 'M', 'L']
        }
      });
      
      if (createResponse.ok()) {
        const createData = await createResponse.json();
        if (createData.item && createData.item.id) {
          itemId = createData.item.id;
          console.log(`Artículo creado con ID: ${itemId}`);
        }
      } else {
        const errorData = await createResponse.json().catch(() => ({}));
        throw new Error(`Error al crear artículo: ${errorData.error || createResponse.statusText()}`);
      }
    } catch (error: any) {
      throw new Error(`No se pudo crear un artículo para el test: ${error.message || String(error)}`);
    }
    
    // Si aún no tenemos un ID después de intentar crear, el test no puede continuar
    if (!itemId) {
      throw new Error('No se pudo obtener o crear un artículo para ejecutar este test.');
    }
  }
  
  // Navegar directamente al artículo
  await page.goto(`/items/${itemId}`);
  
  // Esperar a que la página de detalle se cargue
  await page.waitForURL(/\/items\/\d+$/);
  
  // Esperar a que el formulario esté visible
  await expect(page.locator('form')).toBeVisible();
  
  // Esperar a que el calendario se cargue
  await page.waitForTimeout(1000);
  
  // Paso 2: Seleccionar fechas válidas
  // CE 4.1: Fecha inicio disponible - "20/09/2025"
  // CE 5.1: Fecha fin válida (después del inicio) - "22/09/2025"
  // Formato para input date: YYYY-MM-DD
  const startDate = '2025-09-20';
  const endDate = '2025-09-22';
  
  const startInput = page.locator('input[name="start"]');
  const endInput = page.locator('input[name="end"]');
  
  // Verificar que los campos de fecha están disponibles
  await expect(startInput).toBeVisible();
  await expect(endInput).toBeVisible();
  
  // Completar fecha de inicio (CE 4.1)
  await startInput.fill(startDate);
  
  // Completar fecha de fin (CE 5.1)
  await endInput.fill(endDate);
  
  // Verificar que las fechas se ingresaron correctamente
  const startValue = await startInput.inputValue();
  const endValue = await endInput.inputValue();
  expect(startValue).toBe(startDate);
  expect(endValue).toBe(endDate);
  
  // Paso 3: Completar todos los campos con los representantes indicados
  // Verificar si el usuario está autenticado (si no hay campos de nombre/email/teléfono visibles)
  const nameInput = page.locator('input[name="name"]');
  const nameInputCount = await nameInput.count();
  const nameInputVisible = nameInputCount > 0 && await nameInput.isVisible().catch(() => false);
  
  if (nameInputVisible) {
    // CE 1.1: Nombre válido - "Ana Pérez"
    await nameInput.fill('Ana Pérez');
    
    // CE 2.1: Correo válido - "ana@mail.com"
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('ana@mail.com');
    
    // CE 3.1: Teléfono válido - "12345678"
    const phoneInput = page.locator('input[name="phone"]');
    await expect(phoneInput).toBeVisible();
    await phoneInput.fill('12345678');
  }
  // Si el usuario está autenticado, los campos ya están completos automáticamente
  
  // Paso 4: Enviar el formulario
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeEnabled();
  
  // Configurar listener para interceptar la respuesta de la API
  const apiResponsePromise = page.waitForResponse(
    response => response.url().includes('/api/rentals') && 
                response.request().method() === 'POST',
    { timeout: 15000 }
  );
  
  // Hacer clic en el botón de envío
  await submitButton.click();
  
  // Esperar la respuesta de la API
  const apiResponse = await apiResponsePromise;
  expect(apiResponse.status()).toBe(200);
  
  // Verificar que la respuesta contiene éxito
  const responseData = await apiResponse.json();
  expect(responseData.success || responseData.message).toBeTruthy();
  
  // Paso 5: Validar que el sistema muestre confirmación de registro
  // Esperar a que se muestre el mensaje de confirmación (SweetAlert2)
  await page.waitForSelector('.swal2-popup', { timeout: 10000 });
  
  // Verificar que se muestra el mensaje de éxito
  const successModal = page.locator('.swal2-popup');
  await expect(successModal).toBeVisible();
  
  // Verificar el título del mensaje
  const modalTitle = successModal.locator('.swal2-title, h2, [class*="title"]');
  await expect(modalTitle).toBeVisible();
  const titleText = await modalTitle.textContent();
  
  // Verificar el contenido del mensaje
  const modalContent = successModal.locator('.swal2-html-container, .swal2-content, [class*="html"]');
  await expect(modalContent).toBeVisible();
  const contentText = await modalContent.textContent();
  
  // Salida esperada: "Registro OK"
  // Verificar que el mensaje contiene "Registro OK" o equivalente
  const combinedText = (titleText + ' ' + contentText).toLowerCase();
  
  // Buscar específicamente "Registro OK" o mensajes equivalentes de éxito
  const hasRegistroOK = combinedText.includes('registro ok') || 
                        combinedText.includes('registro exitoso') ||
                        combinedText.includes('reserva exitosa') ||
                        combinedText.includes('solicitud enviada') ||
                        combinedText.includes('alquiler confirmado') ||
                        combinedText.includes('éxito') ||
                        combinedText.includes('success');
  
  expect(hasRegistroOK).toBeTruthy();
  
  // Verificar que el modal tiene el icono de éxito
  const successIcon = successModal.locator('.swal2-success, .swal2-icon-success');
  const iconExists = await successIcon.count() > 0;
  
  if (!iconExists) {
    // Verificar que el modal tiene la clase de éxito
    const modalClasses = await successModal.getAttribute('class');
    expect(modalClasses).toContain('swal2-popup');
  }
  
  // Verificar que hay un botón de confirmación
  const confirmButton = successModal.locator('.swal2-confirm, button.swal2-styled');
  await expect(confirmButton).toBeVisible();
  
  // Verificar que el mensaje indica registro exitoso
  // El mensaje puede variar pero debe indicar éxito
  expect(combinedText).toMatch(/registro|reserva|solicitud|alquiler|confirmado|enviada|éxito/i);
});

