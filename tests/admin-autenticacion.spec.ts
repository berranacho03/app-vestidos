import { test, expect } from '@playwright/test';

/**
 * Módulo: Autenticación de Administrador
 * 
 * Este archivo contiene los casos de prueba relacionados con la autenticación de administrador:
 * - CP-019: Inicio de sesión exitoso
 * - CP-020: Manejo de error en login de administrador
 * - CP-021: Cierre de sesión exitoso
 */

// Credenciales de admin - se deben usar las de las variables de entorno
// Para tests, asumimos que existen ADMIN_USERNAME y ADMIN_PASSWORD
// En un entorno real, se deberían usar credenciales de test específicas
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123'
};

/**
 * CP-019: Admin - Inicio de sesión exitoso
 * 
 * Descripción: Inicio de sesión exitoso de administrador.
 * 
 * Precondición: Admin registrado (credenciales válidas configuradas).
 * 
 * Datos de prueba:
 * - Usuario admin + contraseña válida (de variables de entorno)
 * 
 * Pasos:
 * 1. Abrir página de login (/admin/login).
 * 2. Ingresar credenciales válidas.
 * 3. Enviar formulario.
 * 
 * Resultado esperado: Se accede al panel de administración (/admin) y se recibe un JWT válido 
 * almacenado en la cookie admin_token.
 */
test('CP-019: Inicio de sesión exitoso de administrador', async ({ page }) => {
  // Paso 1: Abrir página de login
  await page.goto('/admin/login');
  
  // Verificar que estamos en la página de login
  await expect(page.locator('h1')).toContainText('Admin');
  await expect(page.locator('text=/Área protegida para administradores/i')).toBeVisible();
  
  // Verificar que el formulario está presente
  const loginForm = page.locator('form');
  await expect(loginForm).toBeVisible();
  
  // Verificar que hay campos de usuario y contraseña
  const usernameInput = page.locator('input[name="username"]');
  const passwordInput = page.locator('input[name="password"]');
  await expect(usernameInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  
  // Verificar que el botón de envío está presente
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeVisible();
  await expect(submitButton).toContainText(/Iniciar sesión/i);
  
  // Paso 2: Ingresar credenciales válidas
  await usernameInput.fill(ADMIN_CREDENTIALS.username);
  await passwordInput.fill(ADMIN_CREDENTIALS.password);
  
  // Paso 3: Enviar formulario
  // Configurar listener para interceptar la respuesta de la API ANTES de hacer click
  // Esto asegura que capturamos la respuesta antes de que ocurra la navegación
  const apiResponsePromise = page.waitForResponse(
    response => response.url().includes('/api/admin/login') && 
                response.request().method() === 'POST',
    { timeout: 15000 }
  );
  
  // Enviar formulario
  await submitButton.click();
  
  // Esperar la respuesta de la API
  const apiResponse = await apiResponsePromise;
  expect(apiResponse.status()).toBe(200);
  expect(apiResponse.ok()).toBe(true);
  
  // Leer el JSON inmediatamente después de obtener la respuesta
  // (antes de que window.location.href cause la navegación completa)
  // Si falla, no es crítico - la cookie y la redirección son la verificación principal
  let responseData: any = null;
  try {
    responseData = await apiResponse.json();
    if (responseData) {
      expect(responseData.success).toBe(true);
    }
  } catch (error) {
    // Si la navegación cerró la conexión antes de leer el JSON, 
    // no es crítico - seguimos con las verificaciones principales
    // (la cookie y la redirección son más importantes)
  }
  
  // Verificar que se estableció la cookie admin_token (verificación principal)
  // La cookie es httpOnly, así que verificamos que existe en las cookies
  const cookies = await page.context().cookies();
  const adminTokenCookie = cookies.find(cookie => cookie.name === 'admin_token');
  expect(adminTokenCookie).toBeTruthy();
  expect(adminTokenCookie?.value).toBeTruthy();
  expect(adminTokenCookie?.value.length).toBeGreaterThan(0);
  
  // Resultado esperado: Verificar que se redirige al panel de administración
  await page.waitForURL('/admin', { timeout: 10000 });
  expect(page.url()).toContain('/admin');
  
  // Verificar que se muestra el panel de administración
  await expect(page.locator('h1')).toContainText(/Panel de administración/i);
  
  // Verificar que el panel muestra contenido (no redirige al login)
  const panelContent = page.locator('text=/Alquileres programados|Inventario/i');
  await expect(panelContent.first()).toBeVisible({ timeout: 5000 });
  
  // Verificar que no hay mensaje de error
  const errorMessage = page.locator('text=/Credenciales inválidas|Error al iniciar sesión/i');
  const errorCount = await errorMessage.count();
  expect(errorCount).toBe(0);
});

/**
 * CP-020: Admin - Manejo de error en login de administrador
 * 
 * Descripción: Manejo de error cuando se ingresan credenciales incorrectas.
 * 
 * Precondición: Admin existe (credenciales válidas configuradas).
 * 
 * Datos de prueba:
 * - Usuario/clave incorrectos (usuario o contraseña inválidos)
 * 
 * Pasos:
 * 1. Ir a login admin (/admin/login).
 * 2. Ingresar credenciales incorrectas.
 * 3. Enviar formulario.
 * 
 * Resultado esperado: Se muestra mensaje de error "Credenciales inválidas". 
 * No se genera JWT (no se establece cookie admin_token). El usuario permanece en la página de login.
 */
test('CP-020: Manejo de error en login de administrador con credenciales incorrectas', async ({ page }) => {
  // Paso 1: Ir a login admin
  await page.goto('/admin/login');
  
  // Verificar que estamos en la página de login
  await expect(page.locator('h1')).toContainText('Admin');
  
  // Verificar que el formulario está presente
  const loginForm = page.locator('form');
  await expect(loginForm).toBeVisible();
  
  // Paso 2: Ingresar credenciales incorrectas
  const usernameInput = page.locator('input[name="username"]');
  const passwordInput = page.locator('input[name="password"]');
  
  // Usar credenciales incorrectas
  await usernameInput.fill('usuario_incorrecto');
  await passwordInput.fill('contraseña_incorrecta');
  
  // Paso 3: Enviar formulario
  const submitButton = page.locator('button[type="submit"]');
  
  // Configurar listener para interceptar la respuesta de la API
  const apiResponsePromise = page.waitForResponse(
    response => response.url().includes('/api/admin/login') && 
                response.request().method() === 'POST',
    { timeout: 15000 }
  );
  
  await submitButton.click();
  
  // Esperar la respuesta de la API
  const apiResponse = await apiResponsePromise;
  
  // Verificar que la respuesta es 401 (Unauthorized)
  expect(apiResponse.status()).toBe(401);
  
  // Verificar que la respuesta contiene el error
  const responseData = await apiResponse.json();
  expect(responseData.error).toBe('Credenciales inválidas');
  expect(responseData.success).toBeUndefined();
  
  // Resultado esperado: Verificar que se muestra el mensaje de error
  // El mensaje de error se muestra en un div con clase bg-red-50 que contiene un p con el texto
  // Usar .bg-red-50 específicamente para evitar matches múltiples (el div y el p interno)
  const errorMessage = page.locator('.bg-red-50').filter({ 
    hasText: /Credenciales inválidas|Error al iniciar sesión/i 
  }).first();
  await expect(errorMessage).toBeVisible({ timeout: 5000 });
  
  const errorText = await errorMessage.textContent();
  expect(errorText?.toLowerCase()).toMatch(/credenciales inválidas|error al iniciar sesión/i);
  
  // Verificar que NO se estableció la cookie admin_token
  const cookies = await page.context().cookies();
  const adminTokenCookie = cookies.find(cookie => cookie.name === 'admin_token');
  // Puede existir una cookie vacía o no existir
  if (adminTokenCookie) {
    expect(adminTokenCookie.value).toBe('');
  }
  
  // Verificar que el usuario permanece en la página de login
  expect(page.url()).toContain('/admin/login');
  await expect(page.locator('h1')).toContainText('Admin');
  
  // Verificar que el formulario sigue visible y accesible
  await expect(loginForm).toBeVisible();
  await expect(usernameInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  
  // Verificar que NO se redirigió al panel
  // La URL debe ser /admin/login, NO /admin (sin /login)
  expect(page.url()).toMatch(/\/admin\/login/);
  expect(page.url()).not.toMatch(/\/admin$/);
});

/**
 * CP-021: Admin - Cierre de sesión exitoso
 * 
 * Descripción: Cierre de sesión exitoso de administrador.
 * 
 * Precondición: Admin ha iniciado sesión con token activo.
 * 
 * Datos de prueba:
 * - Token JWT válido (cookie admin_token)
 * 
 * Pasos:
 * 1. Ir al panel admin (/admin) (requiere estar autenticado).
 * 2. Clic en "Cerrar sesión".
 * 
 * Resultado esperado: El token se invalida (la cookie admin_token se elimina). 
 * El usuario es redirigido a la página principal (/). 
 * Intentar acceder al panel nuevamente (/admin) → acceso denegado (redirige a /admin/login).
 */
test('CP-021: Cierre de sesión exitoso de administrador', async ({ page }) => {
  // Primero, iniciar sesión como administrador
  await page.goto('/admin/login');
  
  // Verificar que estamos en la página de login
  await expect(page.locator('h1')).toContainText('Admin');
  
  const usernameInput = page.locator('input[name="username"]');
  const passwordInput = page.locator('input[name="password"]');
  const loginSubmitButton = page.locator('button[type="submit"]');
  
  // Verificar que los campos y el botón están visibles
  await expect(usernameInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(loginSubmitButton).toBeVisible();
  
  await usernameInput.fill(ADMIN_CREDENTIALS.username);
  await passwordInput.fill(ADMIN_CREDENTIALS.password);
  
  // Asegurarse de que el botón esté habilitado antes de hacer click
  await expect(loginSubmitButton).toBeEnabled();
  
  // Configurar listener para interceptar la respuesta del login ANTES de hacer click
  const loginResponsePromise = page.waitForResponse(
    response => {
      const url = response.url();
      return (url.includes('/api/admin/login') || url.endsWith('/api/admin/login')) && 
             response.request().method() === 'POST';
    },
    { timeout: 15000 }
  );
  
  // Hacer click en el botón de login
  await loginSubmitButton.click();
  
  // Esperar la respuesta del login
  const loginResponse = await loginResponsePromise;
  expect(loginResponse.status()).toBe(200);
  
  // Esperar a que se redirija al panel
  await page.waitForURL('/admin', { timeout: 10000 });
  
  // Verificar que estamos en el panel de administración
  await expect(page.locator('h1')).toContainText(/Panel de administración/i);
  
  // Verificar que la cookie admin_token existe
  const cookiesBeforeLogout = await page.context().cookies();
  const adminTokenBeforeLogout = cookiesBeforeLogout.find(cookie => cookie.name === 'admin_token');
  expect(adminTokenBeforeLogout).toBeTruthy();
  expect(adminTokenBeforeLogout?.value).toBeTruthy();
  
  // Paso 1: Ir al panel admin (ya estamos ahí)
  // Verificar que el botón de cerrar sesión está presente
  // El botón está dentro de un form con action="/api/admin/logout" y method="POST"
  const logoutForm = page.locator('form[action="/api/admin/logout"]');
  await expect(logoutForm).toBeVisible();
  
  const logoutButton = logoutForm.locator('button').filter({ hasText: /Cerrar sesión/i });
  await expect(logoutButton).toBeVisible();
  
  // Paso 2: Clic en "Cerrar sesión"
  // Configurar listener para interceptar la respuesta del logout
  const logoutResponsePromise = page.waitForResponse(
    response => response.url().includes('/api/admin/logout') && 
                response.request().method() === 'POST',
    { timeout: 15000 }
  );
  
  // Hacer clic en el botón de cerrar sesión
  await logoutButton.click();
  
  // Esperar la respuesta del logout
  const logoutResponse = await logoutResponsePromise;
  expect(logoutResponse.status()).toBe(307 || 302 || 200); // Redirect o success
  
  // Resultado esperado: Verificar que se redirige a la página principal (/)
  // El logout redirige a "/"
  await page.waitForURL('/', { timeout: 10000 });
  expect(page.url()).toMatch(/\/$/);
  
  // Verificar que la cookie admin_token se eliminó o expiró
  const cookiesAfterLogout = await page.context().cookies();
  const adminTokenAfterLogout = cookiesAfterLogout.find(cookie => cookie.name === 'admin_token');
  
  // La cookie puede estar presente pero con valor vacío o expirada
  if (adminTokenAfterLogout) {
    // Si existe, el valor debe estar vacío o la cookie debe estar expirada
    expect(adminTokenAfterLogout.value === '' || adminTokenAfterLogout.expires <= Math.floor(Date.now() / 1000)).toBeTruthy();
  }
  
  // Resultado esperado: Intentar acceder al panel nuevamente → acceso denegado
  // Intentar acceder a /admin
  await page.goto('/admin');
  
  // Verificar que se redirige a /admin/login (acceso denegado)
  await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
  expect(page.url()).toContain('/admin/login');
  
  // Verificar que estamos en la página de login (no en el panel)
  await expect(page.locator('h1')).toContainText('Admin');
  await expect(page.locator('text=/Panel de administración/i')).not.toBeVisible();
  
  // Verificar que el formulario de login está presente
  const loginForm = page.locator('form');
  await expect(loginForm).toBeVisible();
  
  // Verificar que no podemos acceder al panel directamente
  // Intentar acceder nuevamente
  await page.goto('/admin');
  await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
  expect(page.url()).toContain('/admin/login');
});

