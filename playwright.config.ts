import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para pruebas E2E
 * Documentación: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Directorio donde se encuentran las pruebas
  testDir: './e2e',
  
  // Ejecutar pruebas en paralelo
  fullyParallel: true,
  
  // Fallar si se usa test.only en CI
  forbidOnly: !!process.env.CI,
  
  // Reintentos en caso de fallo (2 reintentos en CI, 0 en local)
  retries: process.env.CI ? 2 : 0,
  
  // Número de workers (1 en CI, automático en local)
  workers: process.env.CI ? 1 : undefined,
  
  // Tipo de reporte
  reporter: 'html',
  
  // Opciones compartidas para todos los tests
  use: {
    // URL base para usar en page.goto('/')
    baseURL: 'http://localhost:3000',
    
    // Capturar trazas en el primer reintento
    trace: 'on-first-retry',
    
    // Capturar screenshots solo en fallos
    screenshot: 'only-on-failure',
    
    // Timeouts
    actionTimeout: 10000, // 10 segundos para acciones
    navigationTimeout: 30000, // 30 segundos para navegación
  },

  // Configurar proyectos para diferentes navegadores
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Descomenta para probar en Firefox
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // Descomenta para probar en Safari (macOS)
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Pruebas en dispositivos móviles
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Servidor web para pruebas
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutos para que el servidor inicie
  },
});



