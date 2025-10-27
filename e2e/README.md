# Pruebas E2E con Playwright - GlamRent

Este directorio contiene las pruebas End-to-End (E2E) de la aplicación GlamRent usando **Playwright** y el patrón **Page Object Model (POM)**.

## 🎯 Resumen

- **27 pruebas** funcionales en **3 archivos**
- Arquitectura **Page Object Model (POM)**
- Cobertura de flujos principales de usuario
- Pruebas organizadas y mantenibles

## 📁 Estructura del Proyecto

```
e2e/
├── pages/                      # Page Objects (POM)
│   ├── README.md              # Documentación del patrón POM
│   ├── BasePage.ts            # Clase base con métodos comunes
│   ├── HomePage.ts            # Página de inicio
│   ├── ItemDetailPage.ts      # Página de detalle de artículo
│   └── SearchPage.ts          # Página de búsqueda
│
└── tests/                      # Pruebas funcionales
    ├── home-page.spec.ts      # 12 pruebas de la página de inicio
    ├── item-detail.spec.ts    # 9 pruebas de detalles de artículo
    └── navigation.spec.ts     # 6 pruebas de navegación y E2E
```

## 🚀 Ejecutar las Pruebas

### Comandos Básicos

```bash
# Ejecutar todas las pruebas (headless)
npm run test:e2e

# Modo UI - interfaz visual (RECOMENDADO)
npm run test:e2e:ui

# Ver el navegador mientras corren las pruebas
npm run test:e2e:headed

# Modo debug paso a paso
npm run test:e2e:debug

# Ver reporte del último test
npm run test:e2e:report
```

### Ejecutar Pruebas Específicas

```bash
# Solo pruebas de la página de inicio
npx playwright test home-page

# Solo pruebas de detalles de artículo
npx playwright test item-detail

# Solo pruebas de navegación
npx playwright test navigation

# Una prueba específica por nombre
npx playwright test -g "debe mostrar 4 items destacados"
```

## 📊 Cobertura de Pruebas

### 🏠 Página de Inicio (12 pruebas)

- ✅ Carga correcta de la página
- ✅ Elementos del header (navegación, logo, botones)
- ✅ Formulario de búsqueda completo
- ✅ Búsqueda por texto simple
- ✅ Búsqueda con todos los filtros (fecha, talla)
- ✅ 4 items destacados visibles
- ✅ Nombres correctos de los items
- ✅ Navegación a detalles desde featured items
- ✅ Sección "How it works" con 3 pasos
- ✅ Navegación a Browse
- ✅ Formulario de newsletter
- ✅ Todas las secciones principales visibles

### 🔍 Página de Detalles (9 pruebas)

- ✅ Mostrar todos los detalles del artículo
- ✅ Precio correcto del artículo
- ✅ Nombre correcto del artículo
- ✅ Sección de disponibilidad visible
- ✅ Formulario de reserva completo
- ✅ Llenar formulario de reserva
- ✅ Validación de campos requeridos
- ✅ Información de tallas y colores
- ✅ **Flujo completo de reserva de principio a fin**

### 🧭 Navegación y E2E (6 pruebas)

- ✅ Navegación entre Home y Detalles
- ✅ Navegación a búsqueda desde múltiples lugares
- ✅ Mantener estado al navegar hacia atrás
- ✅ Acceso directo por URL
- ✅ Navegación al admin
- ✅ **Flujo completo: Usuario busca, explora y reserva un vestido**

## 🎨 Patrón Page Object Model (POM)

### ¿Por qué POM?

El **Page Object Model** separa la lógica de la UI de las pruebas:

```typescript
// ❌ Sin POM - difícil de mantener
test('buscar vestido', async ({ page }) => {
  await page.locator('input#query').fill('silk');
  await page.locator('button[type="submit"]').click();
});

// ✅ Con POM - fácil de mantener
test('buscar vestido', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.searchByText('silk');
});
```

### Ventajas

1. **Reutilización**: Métodos compartidos entre pruebas
2. **Mantenimiento**: Un cambio en la UI = un cambio en el Page Object
3. **Legibilidad**: Código más claro y expresivo
4. **Escalabilidad**: Fácil agregar nuevas páginas y pruebas

## 📝 Ejemplo de Uso

### Crear un Page Object

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page, '/');
    this.searchInput = page.locator('input#query');
  }

  async searchByText(query: string) {
    await this.fillField(this.searchInput, query);
    await this.clickElement(this.searchButton);
  }
}
```

### Usar en una Prueba

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test('buscar vestidos', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.searchByText('evening gown');
  
  expect(page.url()).toContain('/search');
});
```

## 🎯 Pruebas Destacadas

### Flujo E2E Completo

La prueba más importante simula un usuario real:

```typescript
test('Usuario busca, explora y reserva un vestido', async ({ page }) => {
  // 1. Ir a la home
  const homePage = new HomePage(page);
  await homePage.goto();
  
  // 2. Ver items destacados
  const itemName = await homePage.getFeaturedItemName(0);
  
  // 3. Hacer clic en un item
  await homePage.clickFirstFeaturedItem();
  
  // 4. Ver detalles
  const itemPage = new ItemDetailPage(page);
  expect(await itemPage.getItemName()).toBe(itemName);
  
  // 5. Llenar formulario de reserva
  await itemPage.fillRentalForm({
    name: 'Ana Martínez',
    email: 'ana@example.com',
    phone: '+54 11 5555-1234',
    startDate: '2025-10-25',
    endDate: '2025-11-01'
  });
});
```

## 🔧 Mantenimiento

### Agregar una Nueva Prueba

1. Identificar la página o flujo a probar
2. Usar el Page Object correspondiente
3. Escribir la prueba en `tests/`

```typescript
test('mi nueva prueba', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  // ... resto de la prueba
});
```

### Agregar un Nuevo Page Object

1. Crear archivo en `pages/NuevaPage.ts`
2. Extender `BasePage`
3. Definir locators y métodos
4. Documentar en este README

Ver `pages/README.md` para guía completa.

## 📈 Resultados de las Pruebas

Después de ejecutar las pruebas, puedes ver:

- **Consola**: Resultados inmediatos
- **HTML Report**: `npm run test:e2e:report`
- **Screenshots**: `test-results/`
- **Videos**: Solo en fallos (configurable)

## 🐛 Debugging

### Ver las pruebas en acción

```bash
# Modo headed - ver el navegador
npm run test:e2e:headed

# Modo UI - interfaz completa con timeline
npm run test:e2e:ui

# Modo debug - paso a paso
npm run test:e2e:debug
```

### Generar selectores automáticamente

```bash
# Codegen abre un navegador y genera código
npx playwright codegen http://localhost:3000
```

## 📚 Recursos

- [Documentación Playwright](https://playwright.dev/docs/intro)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Mejores Prácticas](https://playwright.dev/docs/best-practices)
- [Guía POM del Proyecto](./pages/README.md)
- [Guía Completa de Testing](../TESTING.md)

## ✨ Próximos Pasos

Ideas para expandir las pruebas:

- [ ] Pruebas de la página de admin
- [ ] Pruebas de autenticación
- [ ] Pruebas de API endpoints
- [ ] Pruebas de accesibilidad
- [ ] Pruebas visuales (screenshots)
- [ ] Pruebas en múltiples navegadores
- [ ] Pruebas en mobile viewport
- [ ] Integración con CI/CD

## 🤝 Contribuir

Para agregar nuevas pruebas:

1. Sigue el patrón POM existente
2. Usa nombres descriptivos
3. Documenta casos complejos
4. Verifica que pasen localmente
5. Actualiza este README si es necesario

---

**¿Necesitas ayuda?** Revisa `TESTING.md` en la raíz del proyecto para guía completa.
