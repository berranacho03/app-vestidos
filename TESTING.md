# Guía de Pruebas End-to-End (E2E)

Esta guía proporciona instrucciones paso a paso para configurar y ejecutar pruebas E2E con Playwright en macOS y Windows.

## Tabla de Contenidos

- [Visión General](#visión-general)
- [Requisitos Previos](#requisitos-previos)
- [Configuración Inicial](#configuración-inicial)
  - [Configuración en macOS](#configuración-en-macos)
  - [Configuración en Windows](#configuración-en-windows)
- [Ejecutar Pruebas](#ejecutar-pruebas)
- [Escribir Pruebas](#escribir-pruebas)
- [Mejores Prácticas](#mejores-prácticas)
- [Solución de Problemas](#solución-de-problemas)
- [Integración CI/CD](#integración-cicd)
- [Recursos Adicionales](#recursos-adicionales)
- [Obtener Ayuda](#obtener-ayuda)

---

## Visión General

- Framework de Pruebas: Playwright
- Lenguaje: TypeScript
- Ubicación de Pruebas: directorio `e2e/` (raíz del proyecto)
- Configuración: `playwright.config.ts`

Playwright proporciona:
- Pruebas en múltiples navegadores (Chromium, Firefox, WebKit)
- Espera automática de elementos
- Corredor de pruebas integrado
- Herramientas de depuración potentes
- Captura de pantallas y videos en fallos
- Ejecución de pruebas en paralelo

---

## Requisitos Previos

Antes de configurar las pruebas E2E, asegúrate de tener:

- **Node.js 18.17+** y **npm 9+** instalados
- **Git** instalado
- Dependencias del proyecto instaladas (`npm install`)

**Verifica tu entorno:**

### macOS/Linux
bash node -v && npm -v

### Windows (PowerShell o CMD)
cmd node -v && npm -v

---

## Configuración Inicial

### Configuración en macOS

#### Paso 1: Instalar Playwright

Abre la Terminal y navega al directorio de tu proyecto:
bash cd /ruta/a/app-alquiler


Instala Playwright como dependencia de desarrollo:
bash npm install -D @playwright/test


#### Paso 2: Instalar Binarios de Navegadores

Playwright necesita descargar los binarios de los navegadores (Chromium, Firefox, WebKit):

bash npx playwright install


Esto puede tardar unos minutos dependiendo de tu conexión a internet.

**Opcional**: Instalar solo Chromium (configuración más rápida):

bash npx playwright install chromium


#### Paso 3: Inicializar Configuración de Playwright

Genera el archivo de configuración y pruebas de ejemplo:

bash npx playwright init


Cuando se te pregunte:
- Elige **TypeScript** como lenguaje
- Coloca las pruebas en el directorio `e2e`
- Agregar workflow de GitHub Actions: **No** (opcional)
- Instalar navegadores de Playwright: **No** (ya hecho en el Paso 2)

Esto crea:
- `playwright.config.ts` — Archivo de configuración principal
- `e2e/` — Directorio para tus archivos de prueba
- `e2e/example.spec.ts` — Archivo de prueba de ejemplo

#### Paso 4: Actualizar Scripts en package.json

Agrega scripts de prueba a tu `package.json`:

json { "scripts": { "dev": "next dev --turbopack", "build": "next build", "start": "next start", "lint": "next lint", "test:e2e": "playwright test", "test:e2e:ui": "playwright test --ui", "test:e2e:debug": "playwright test --debug", "test:e2e:headed": "playwright test --headed", "test:e2e:report": "playwright show-report" } }


#### Paso 5: Configurar Playwright para Next.js

Edita `playwright.config.ts` para integrarlo con tu aplicación Next.js:

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000, // 10 segundos
    navigationTimeout: 30000, // 30 segundos
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});


#### Paso 6: Verificar Instalación

Ejecuta la prueba de ejemplo:

bash npm run test:e2e

Si tiene éxito, verás los resultados de la prueba en la terminal.

---

### Configuración en Windows

#### Paso 1: Instalar Playwright

Abre PowerShell o Símbolo del sistema y navega a tu proyecto:

**PowerShell:**

powershell cd C:\ruta\a\app-alquiler


**CMD:**
cmd cd C:\ruta\a\app-alquiler

Instala Playwright:
cmd npm install -D @playwright/test

#### Paso 2: Instalar Binarios de Navegadores

Descarga los binarios de los navegadores:

cmd npx playwright install

Esto puede tardar varios minutos.

**Opcional**: Instalar solo Chromium:

cmd npx playwright install chromium

**Nota para Windows**: Si encuentras problemas de permisos, ejecuta PowerShell como Administrador.

#### Paso 3: Inicializar Configuración de Playwright
cmd npx playwright init

Cuando se te pregunte:
- Elige **TypeScript**
- Coloca las pruebas en el directorio `e2e`
- Agregar workflow de GitHub Actions: **No**
- Instalar navegadores: **No** (ya hecho)

#### Paso 4: Actualizar Scripts en package.json

Agrega estos scripts a `package.json`:
json { "scripts": { "dev": "next dev --turbopack", "build": "next build", "start": "next start", "lint": "next lint", "test:e2e": "playwright test", "test:e2e:ui": "playwright test --ui", "test:e2e:debug": "playwright test --debug", "test:e2e:headed": "playwright test --headed", "test:e2e:report": "playwright show-report" } }


#### Paso 5: Configurar Playwright para Next.js

Crea o edita `playwright.config.ts`:
typescript import { defineConfig, devices } from '@playwright/test';
export default defineConfig({ testDir: './e2e', fullyParallel: true, forbidOnly: !!process.env.CI, retries: process.env.CI ? 2 : 0, workers: process.env.CI ? 1 : undefined, reporter: 'html',
use: { baseURL: '[http://localhost:3000](http://localhost:3000)', trace: 'on-first-retry', screenshot: 'only-on-failure', },
projects: [ { name: 'chromium', use: { ...devices['Desktop Chrome'] }, }, { name: 'firefox', use: { ...devices['Desktop Firefox'] }, }, { name: 'webkit', use: { ...devices['Desktop Safari'] }, }, ],
webServer: { command: 'npm run dev', url: '[http://localhost:3000](http://localhost:3000)', reuseExistingServer: !process.env.CI, }, });

#### Paso 6: Verificar Instalación

Ejecuta las pruebas:
cmd npm run test:e2e

---

## Ejecutar Pruebas

### Comandos Básicos

**Ejecutar todas las pruebas (sin interfaz):**
bash npm run test:e2e


**Ejecutar pruebas con modo UI (interactivo):**
bash npm run test:e2e:ui

**Ejecutar pruebas en modo visible (ver navegador):**
bash npm run test:e2e:headed

**Modo de depuración (paso a paso):**
bash npm run test:e2e:debug

**Ver último reporte de pruebas:**
bash npm run test:e2e:report

### Comandos Avanzados

**Ejecutar archivo de prueba específico:**
bash npx playwright test e2e/home.spec.ts

**Ejecutar pruebas en navegador específico:**
bash npx playwright test --project=chromium

**Ejecutar pruebas que coincidan con un patrón:**
bash npx playwright test --grep "flujo de alquiler"

**Ejecutar pruebas con visor de trazas en vivo:**
bash npx playwright test --trace on

---

## Escribir Pruebas

### Estructura de Archivo de Prueba

Crea archivos de prueba en el directorio `e2e/` con extensión `.spec.ts`.

**Ejemplo: `e2e/home.spec.ts`**
typescript import { test, expect } from '@playwright/test';
test.describe('Página de Inicio', () => { test('debe mostrar el encabezado principal', async ({ page }) => { await page.goto('/');
});
test('debe navegar a la página de búsqueda', async ({ page }) => { await page.goto('/');
await page.getByRole('link', { name: /Explorar/i }).click();

await expect(page).toHaveURL('/search');
}); });

### Patrones Comunes de Prueba

**Navegación:**

typescript await page.goto('/'); await page.goto('/search');

**Hacer clic en elementos:**

typescript await page.getByRole('button', { name: 'Buscar' }).click(); await page.getByText('Destacados').click();

**Llenar formularios:**
typescript await page.getByLabel('Email').fill('usuario@ejemplo.com'); await page.getByPlaceholder('Buscar…').fill('vestido');

**Seleccionar desplegables:**
typescript await page.getByLabel('Talla').selectOption('M');

**Aserciones:**
typescript await expect(page).toHaveURL('/items/1'); await expect(page.getByText('Éxito')).toBeVisible(); await expect(page.getByRole('heading')).toContainText('GlamRent');

**Esperar respuestas de API:**
typescript await page.waitForResponse(response => response.url().includes('/api/items') && response.status() === 200 );


### Ejemplo: Prueba de Flujo Completo de Alquiler
typescript import { test, expect } from '@playwright/test';
test.describe('Flujo de Alquiler', () => { test('el usuario puede completar una reserva de alquiler', async ({ page }) => { // Navegar a inicio await page.goto('/');
// Hacer clic en el primer artículo destacado
await page.getByRole('link', { name: /Ver detalles/i }).first().click();

// Verificar que estamos en la página del artículo
await expect(page).toHaveURL(/\/items\/\d+/);

// Llenar formulario de alquiler
await page.getByLabel('Nombre').fill('Juan Pérez');
await page.getByLabel('Email').fill('juan@ejemplo.com');
await page.getByLabel('Teléfono').fill('555-0123');

// Seleccionar fechas
const hoy = new Date();
const manana = new Date(hoy);
manana.setDate(hoy.getDate() + 1);

await page.getByLabel('Fecha de inicio').fill(hoy.toISOString().slice(0, 10));
await page.getByLabel('Fecha de fin').fill(manana.toISOString().slice(0, 10));

// Enviar formulario
await page.getByRole('button', { name: /Reservar ahora/i }).click();

// Verificar éxito
await expect(page).toHaveURL(/success=1/);
await expect(page.getByText(/éxito/i)).toBeVisible();
}); });

---

## Mejores Prácticas

### 1. Usa Nombres Descriptivos para las Pruebas
typescript // ✅ Bueno test('el usuario puede buscar vestidos por color', async ({ page }) => {});
// ❌ Malo test('prueba1', async ({ page }) => {});

### 2. Usa el Modelo de Objeto de Página para Páginas Complejas

Crea `e2e/pages/PaginaInicio.ts`:
typescript export class PaginaInicio { constructor(private page: any) {}
async irA() { await this.page.goto('/'); }
async buscarVestidos(consulta: string) { await this.page.getByPlaceholder('Buscar…').fill(consulta); await this.page.getByRole('button', { name: 'Buscar' }).click(); }
async seleccionarArticuloDestacado(indice: number) { await this.page.getByRole('link', { name: /Ver detalles/i }) .nth(indice) .click(); } }

Úsalo en las pruebas:
typescript import { PaginaInicio } from './pages/PaginaInicio';
test('flujo de búsqueda', async ({ page }) => { const paginaInicio = new PaginaInicio(page); await paginaInicio.irA(); await paginaInicio.buscarVestidos('seda'); });

### 3. Aisla las Pruebas
Cada prueba debe ser independiente y no depender del estado de otras pruebas.

### 4. Usa Fixtures para Configuración Común
typescript import { test as base } from '@playwright/test'; import { PaginaInicio } from './pages/PaginaInicio';
const test = base.extend<{ paginaInicio: PaginaInicio }>({ paginaInicio: async ({ page }, use) => { const paginaInicio = new PaginaInicio(page); await paginaInicio.irA(); await use(paginaInicio); }, });
test('prueba con fixture', async ({ paginaInicio }) => { await paginaInicio.buscarVestidos('vestido'); });

### 5. Usa Espera Automática
Playwright espera automáticamente por los elementos. Evita `waitForTimeout` manual.

typescript // ✅ Bueno (espera automática) await page.getByRole('button').click();
// ❌ Malo await page.waitForTimeout(1000); await page.getByRole('button').click();


---

## Solución de Problemas

### Las Pruebas Exceden el Tiempo de Espera

**Problema**: Las pruebas fallan con errores de tiempo de espera.

**Solución**:
- Aumenta el tiempo de espera en `playwright.config.ts`:
  ```typescript
  use: {
    actionTimeout: 10000, // 10 segundos
    navigationTimeout: 30000, // 30 segundos
  }
  ```
- O por prueba:
  ```typescript
  test('prueba lenta', async ({ page }) => {
    test.setTimeout(60000); // 60 segundos
    await page.goto('/');
  });
  ```

### Puerto Ya en Uso

**Problema**: El servidor de desarrollo no puede iniciar en el puerto 3000.

Primero, verifica y mata el proceso que está usando el puerto 3000.

macOS/Linux:

**Problema**: Error sobre navegadores faltantes.

**Solución**:
bash npx playwright install

### Windows Defender / Antivirus Bloquea Playwright

**Problema**: Los navegadores no se inician en Windows.

**Solución**:
- Agrega excepción para la carpeta `node_modules\.playwright`
- O temporalmente desactiva la protección en tiempo real durante la instalación

### WSL2 en Windows

Si usas WSL2, instala los navegadores con dependencias:
bash npx playwright install --with-deps

### Modo de Depuración No Funciona

**Problema**: El flag `--debug` no abre el inspector.

**Solución**:
- Asegúrate de tener un servidor de pantalla (X11 en Linux, nativo en macOS/Windows)
- Usa el modo UI en su lugar:
  ```bash
  npm run test:e2e:ui
  ```

### Pruebas Inestables

**Problema**: Las pruebas a veces pasan y a veces fallan.

**Soluciones**:
1. Usa localizadores adecuados (evita XPath cuando sea posible)
2. Espera por solicitudes de red:
   ```typescript
   await page.waitForLoadState('networkidle');
   ```
3. Usa `expect.poll()` para aserciones eventuales:
   ```typescript
   await expect.poll(async () => {
     return await page.getByText('Cargado').isVisible();
   }).toBeTruthy();
   ```

### Integración CI/CD

Para GitHub Actions, agrega `.github/workflows/playwright.yml`:
yaml name: Pruebas Playwright on: [push, pull_request]
jobs: test: runs-on: ubuntu-latest steps: - uses: actions/checkout@v4 - uses: actions/setup-node@v4 with: node-version: 20 - name: Instalar dependencias run: npm ci - name: Instalar Navegadores de Playwright run: npx playwright install --with-deps - name: Ejecutar pruebas Playwright run: npm run test:e2e - uses: actions/upload-artifact@v4 if: always() with: name: reporte-playwright path: playwright-report/

---

## Recursos Adicionales

- [Documentación de Playwright](https://playwright.dev/)
- [Mejores Prácticas de Playwright](https://playwright.dev/docs/best-practices)
- [Referencia de API de Playwright](https://playwright.dev/docs/api/class-playwright)
- [Documentación de Testing de Next.js](https://nextjs.org/docs/app/building-your-application/testing/playwright)

---

## Obtener Ayuda

Si encuentras problemas no cubiertos aquí:

1. Revisa la [Guía de Solución de Problemas de Playwright](https://playwright.dev/docs/troubleshooting)
2. Busca en [Issues de GitHub de Playwright](https://github.com/microsoft/playwright/issues)
3. Pregunta en [Discord de Playwright](https://aka.ms/playwright/discord)
4. Revisa problemas específicos del proyecto en este repositorio

