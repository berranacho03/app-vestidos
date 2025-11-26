import { test, expect } from '@playwright/test';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

/**
 * Módulo: Autenticación de Administrador
 * 
 * Este archivo contiene los casos de prueba relacionados con la autenticación de administrador:
 * - CP-019: Inicio de sesión exitoso
 * - CP-020: Manejo de error en login de administrador
 * - CP-021: Cierre de sesión exitoso
 */

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
  const loginPage = new AdminLoginPage(page);
  await loginPage.goto();
  await loginPage.expectToBeOnLoginPage();

  // Verificar que el formulario está presente
  await expect(page.locator('h1')).toContainText('Admin');
  await expect(page.locator('text=/Área protegida para administradores/i')).toBeVisible();

  // Paso 2 y 3: Ingresar credenciales válidas y enviar formulario
  await loginPage.login();

  // Verificar que se estableció la cookie admin_token
  const cookies = await page.context().cookies();
  const adminTokenCookie = cookies.find(cookie => cookie.name === 'admin_token');
  expect(adminTokenCookie).toBeTruthy();
  expect(adminTokenCookie?.value).toBeTruthy();
  expect(adminTokenCookie?.value.length).toBeGreaterThan(0);

  // Resultado esperado: Verificar que se muestra el panel de administración
  const dashboard = new AdminDashboardPage(page);
  await dashboard.expectToBeOnDashboard();

  // Verificar que el panel muestra contenido
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
  const loginPage = new AdminLoginPage(page);
  await loginPage.goto();
  await loginPage.expectToBeOnLoginPage();

  // Paso 2: Ingresar credenciales incorrectas
  await loginPage.fillUsername('usuario_incorrecto');
  await loginPage.fillPassword('contraseña_incorrecta');

  // Paso 3: Enviar formulario
  // Configurar listener para interceptar la respuesta de la API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponsePromise = page.waitForResponse(
    (response: any) => 
      response.url().includes('/api/admin/login') &&
      response.request().method() === 'POST',
    { timeout: 15000 }
  );

  await loginPage.getSubmitButton().click();

  // Esperar la respuesta de la API
  const apiResponse = await apiResponsePromise;

  // Verificar que la respuesta es 401 (Unauthorized)
  expect(apiResponse.status()).toBe(401);

  // Verificar que la respuesta contiene el error
  const responseData = await apiResponse.json();
  expect(responseData.error).toBe('Credenciales inválidas');
  expect(responseData.success).toBeUndefined();

  // Resultado esperado: Verificar que se muestra el mensaje de error
  const errorMessage = page.locator('.bg-red-50').filter({
    hasText: /Credenciales inválidas|Error al iniciar sesión/i
  }).first();
  await expect(errorMessage).toBeVisible({ timeout: 5000 });

  // Verificar que NO se estableció la cookie admin_token
  const cookies = await page.context().cookies();
  const adminTokenCookie = cookies.find(cookie => cookie.name === 'admin_token');
  if (adminTokenCookie) {
    expect(adminTokenCookie.value).toBe('');
  }

  // Verificar que el usuario permanece en la página de login
  expect(page.url()).toContain('/admin/login');
  await expect(page.locator('h1')).toContainText('Admin');
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
  const loginPage = new AdminLoginPage(page);
  await loginPage.login();

  // Verificar que estamos en el panel de administración
  const dashboard = new AdminDashboardPage(page);
  await dashboard.expectToBeOnDashboard();

  // Verificar que la cookie admin_token existe
  const cookiesBeforeLogout = await page.context().cookies();
  const adminTokenBeforeLogout = cookiesBeforeLogout.find(cookie => cookie.name === 'admin_token');
  expect(adminTokenBeforeLogout).toBeTruthy();
  expect(adminTokenBeforeLogout?.value).toBeTruthy();

  // Paso 1: Ir al panel admin (ya estamos ahí)
  // Paso 2: Clic en "Cerrar sesión"
  // Configurar listener para interceptar la respuesta del logout
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logoutResponsePromise = page.waitForResponse(
    (response: any) => 
      response.url().includes('/api/admin/logout') &&
      response.request().method() === 'POST',
    { timeout: 15000 }
  );

  await dashboard.logout();

  // Esperar la respuesta del logout
  const logoutResponse = await logoutResponsePromise;
  expect([200, 302, 307]).toContain(logoutResponse.status());

  // Resultado esperado: Verificar que se redirige a la página principal (/)
  await page.waitForURL('/', { timeout: 10000 });
  expect(page.url()).toMatch(/\/$/);

  // Verificar que la cookie admin_token se eliminó o expiró
  const cookiesAfterLogout = await page.context().cookies();
  const adminTokenAfterLogout = cookiesAfterLogout.find(cookie => cookie.name === 'admin_token');

  if (adminTokenAfterLogout) {
    expect(adminTokenAfterLogout.value === '' || adminTokenAfterLogout.expires <= Math.floor(Date.now() / 1000)).toBeTruthy();
  }

  // Resultado esperado: Intentar acceder al panel nuevamente → acceso denegado
  await page.goto('/admin');

  // Verificar que se redirige a /admin/login
  await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
  expect(page.url()).toContain('/admin/login');

  // Verificar que estamos en la página de login
  await expect(page.locator('h1')).toContainText('Admin');
  await expect(page.locator('text=/Panel de administración/i')).not.toBeVisible();
});
