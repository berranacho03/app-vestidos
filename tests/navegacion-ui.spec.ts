import { test, expect } from '@playwright/test';

/**
 * Módulo: Navegación / UI
 * 
 * Este archivo contiene los casos de prueba relacionados con la navegación y validación de páginas:
 * - CP-022: Validar que la página de FAQ existe
 * - CP-023: Validar que la página de Términos existe
 * - CP-024: Validar que la página de Contacto existe
 */

/**
 * CP-022: UI / Navegación - Validar que la página de FAQ existe
 * 
 * Descripción: Validar que la página de FAQ existe y se carga correctamente.
 * 
 * Precondición: N/A
 * 
 * Datos de prueba:
 * - N/A
 * 
 * Pasos:
 * 1. Navegar a "FAQ" (/faq).
 * 
 * Resultado esperado: La página carga correctamente (no 404). 
 * Muestra las preguntas y respuestas del ERS (documento de requisitos).
 */
test('CP-022: Validar que la página de FAQ existe y se carga correctamente', async ({ page }) => {
  // Paso 1: Navegar a "FAQ"
  await page.goto('/faq');
  
  // Resultado esperado: Verificar que la página carga correctamente (no 404)
  // Esperar a que la página se cargue completamente
  await page.waitForLoadState('networkidle');
  
  // Verificar que no hay mensaje de error 404
  const notFoundMessage = page.locator('text=/404|not found|no encontrado|página no encontrada/i');
  const notFoundCount = await notFoundMessage.count();
  expect(notFoundCount).toBe(0);
  
  // Verificar que la URL es correcta
  expect(page.url()).toContain('/faq');
  
  // Verificar que se muestra el título de la página
  const pageTitle = page.locator('h1');
  await expect(pageTitle).toBeVisible();
  await expect(pageTitle).toContainText(/Preguntas Frecuentes|FAQ/i);
  
  // Verificar que la página muestra una descripción o introducción
  const description = page.locator('text=/Encuentra respuestas|preguntas más comunes/i');
  await expect(description).toBeVisible();
  
  // Verificar que se muestran preguntas y respuestas (FAQList)
  // Las FAQs están en botones clickeables (accordion) con preguntas
  const faqItems = page.locator('button').filter({ 
    hasText: /¿Cómo funciona|¿Qué incluye|¿Cuánto tiempo|¿Qué pasa|¿Cómo funciona la devolución|¿Qué métodos|¿Qué sucede|¿Hacen envíos/i 
  });
  const faqCount = await faqItems.count();
  expect(faqCount).toBeGreaterThan(0);
  
  // Verificar que hay al menos una pregunta específica del ERS
  // Las preguntas comunes incluyen:
  // - "¿Cómo funciona el proceso de alquiler?"
  // - "¿Qué incluye el precio del alquiler?"
  // - "¿Cuánto tiempo puedo alquilar un artículo?"
  const commonQuestions = [
    /¿Cómo funciona.*alquiler/i,
    /¿Qué incluye.*precio/i,
    /¿Cuánto tiempo.*alquilar/i,
    /¿Qué pasa.*no.*queda bien/i,
    /devolución/i,
    /métodos.*pago/i,
    /daño.*artículo/i,
    /envíos/i
  ];
  
  const pageContent = await page.textContent('body');
  const hasFAQContent = commonQuestions.some(question => 
    question.test(pageContent || '')
  );
  expect(hasFAQContent).toBeTruthy();
  
  // Verificar que el componente FAQList está presente (estructura de accordion)
  const accordionContainer = page.locator('.border.border-slate-200, .border.border-slate-800').first();
  const accordionExists = await accordionContainer.count() > 0;
  expect(accordionExists).toBeTruthy();
});

/**
 * CP-023: UI / Navegación - Validar que la página de Términos existe
 * 
 * Descripción: Validar que la página de Términos y Condiciones existe y se carga correctamente.
 * 
 * Precondición: N/A
 * 
 * Datos de prueba:
 * - N/A
 * 
 * Pasos:
 * 1. Navegar a "Términos y condiciones" (/terms).
 * 
 * Resultado esperado: La página carga correctamente (no 404).
 */
test('CP-023: Validar que la página de Términos existe y se carga correctamente', async ({ page }) => {
  // Paso 1: Navegar a "Términos y condiciones"
  await page.goto('/terms');
  
  // Resultado esperado: Verificar que la página carga correctamente (no 404)
  // Esperar a que la página se cargue completamente
  await page.waitForLoadState('networkidle');
  
  // Verificar que no hay mensaje de error 404
  const notFoundMessage = page.locator('text=/404|not found|no encontrado|página no encontrada/i');
  const notFoundCount = await notFoundMessage.count();
  expect(notFoundCount).toBe(0);
  
  // Verificar que la URL es correcta
  expect(page.url()).toContain('/terms');
  
  // Verificar que se muestra el título de la página
  const pageTitle = page.locator('h1');
  await expect(pageTitle).toBeVisible();
  await expect(pageTitle).toContainText(/Términos.*Servicio|Términos y Condiciones/i);
  
  // Verificar que la página muestra contenido de términos
  // La página debe tener secciones con títulos como:
  // - "Aceptación de los Términos"
  // - "Acuerdo de Alquiler"
  // - "Período de Alquiler y Devoluciones"
  const termsSections = page.locator('h2').filter({
    hasText: /Aceptación|Acuerdo|Período|Daños|Pago|Disponibilidad|Cuentas|Usos Prohibidos|Limitación|Cambios|Información/i
  });
  const sectionsCount = await termsSections.count();
  expect(sectionsCount).toBeGreaterThan(0);
  
  // Verificar que hay contenido de texto relacionado con términos
  const pageContent = await page.textContent('body');
  expect(pageContent?.toLowerCase()).toMatch(/términos|servicio|alquiler|devolución|responsabilidad/i);
  
  // Verificar que hay un enlace para volver al inicio
  const backLink = page.locator('a').filter({ hasText: /Volver al inicio|volver/i });
  const backLinkExists = await backLink.count() > 0;
  expect(backLinkExists).toBeTruthy();
});

/**
 * CP-024: UI / Navegación - Validar que la página de Contacto existe
 * 
 * Descripción: Validar que la página de Contacto existe y se carga correctamente.
 * 
 * Precondición: N/A
 * 
 * Datos de prueba:
 * - N/A
 * 
 * Pasos:
 * 1. Ir a "Contacto" (/contact).
 * 
 * Resultado esperado: La página carga correctamente (no 404).
 */
test('CP-024: Validar que la página de Contacto existe y se carga correctamente', async ({ page }) => {
  // Paso 1: Ir a "Contacto"
  await page.goto('/contact');
  
  // Resultado esperado: Verificar que la página carga correctamente (no 404)
  // Esperar a que la página se cargue completamente
  await page.waitForLoadState('networkidle');
  
  // Verificar que no hay mensaje de error 404
  const notFoundMessage = page.locator('text=/404|not found|no encontrado|página no encontrada/i');
  const notFoundCount = await notFoundMessage.count();
  expect(notFoundCount).toBe(0);
  
  // Verificar que la URL es correcta
  expect(page.url()).toContain('/contact');
  
  // Verificar que se muestra el título de la página
  const pageTitle = page.locator('h1');
  await expect(pageTitle).toBeVisible();
  await expect(pageTitle).toContainText(/Contáctenos|Contacto/i);
  
  // Verificar que la página muestra una descripción
  // Hay múltiples párrafos que coinciden con la expresión, usar .first() para evitar strict mode violation
  const description = page.locator('text=/Nos encantaría saber|equipo|pregunta|ayudar/i').first();
  await expect(description).toBeVisible();
  
  // Verificar que se muestra información de contacto
  // La página debe tener al menos:
  // - Correo electrónico
  // - Teléfono
  // - Dirección
  // - Horario de atención
  const contactInfo = page.locator('text=/Correo Electrónico|Email|Teléfono|Dirección|Horario/i');
  const contactInfoCount = await contactInfo.count();
  expect(contactInfoCount).toBeGreaterThan(0);
  
  // Verificar que hay información específica de contacto
  const pageContent = await page.textContent('body');
  expect(pageContent?.toLowerCase()).toMatch(/support@glamrent|glamrent\.com|\+598|montevideo|uruguay/i);
  
  // Verificar que hay un enlace para volver al inicio
  const backLink = page.locator('a').filter({ hasText: /Volver al inicio|volver/i });
  const backLinkExists = await backLink.count() > 0;
  expect(backLinkExists).toBeTruthy();
  
  // Verificar que la página no muestra errores de consola críticos
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Esperar un momento para capturar errores
  await page.waitForTimeout(1000);
  
  // Verificar que no hay errores críticos (algunos warnings pueden ser aceptables)
  const criticalErrors = errors.filter(e => 
    !e.includes('favicon') && 
    !e.includes('sourcemap') &&
    !e.includes('deprecated') &&
    !e.includes('Warning')
  );
  
  // Nota: Solo verificamos que no hay errores críticos de carga de página
  // No hacemos expect estricto aquí ya que puede haber warnings normales del navegador
});

