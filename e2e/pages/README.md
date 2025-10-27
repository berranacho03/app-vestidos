# Page Object Model (POM) - GlamRent

Esta carpeta contiene los **Page Objects** que representan las páginas de la aplicación siguiendo el patrón **Page Object Model (POM)**.

## 📁 Estructura

```
e2e/
├── pages/              # Page Objects (representan páginas)
│   ├── BasePage.ts     # Clase base con métodos comunes
│   ├── HomePage.ts     # Página de inicio
│   ├── ItemDetailPage.ts  # Página de detalle de artículo
│   └── SearchPage.ts   # Página de búsqueda
└── tests/              # Pruebas que usan los Page Objects
    ├── home-page.spec.ts
    ├── item-detail.spec.ts
    └── navigation.spec.ts
```

## 🎯 ¿Qué es Page Object Model?

**Page Object Model (POM)** es un patrón de diseño que:

1. **Separa** la lógica de la UI de la lógica de las pruebas
2. **Encapsula** los elementos de la página en clases
3. **Facilita** el mantenimiento (si cambia la UI, solo actualizas el Page Object)
4. **Reutiliza** código entre múltiples pruebas

## 🏗️ Arquitectura

### BasePage

Clase base que contiene métodos comunes a todas las páginas:

```typescript
class BasePage {
  goto()              // Navegar a la página
  getTitle()          // Obtener título
  fillField()         // Llenar campo de texto
  clickElement()      // Hacer clic
  getElementText()    // Obtener texto
  takeScreenshot()    // Capturar pantalla
}
```

### Páginas Específicas

Cada página extiende `BasePage` y define:

- **Locators**: Selectores de elementos
- **Métodos de acción**: Interacciones con la página
- **Métodos de obtención**: Extraer información

## 📝 Ejemplo de Uso

### Crear un Page Object

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly logo: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page, '/');
    this.logo = page.locator('text=GlamRent');
    this.searchInput = page.locator('input#query');
  }

  async search(query: string) {
    await this.fillField(this.searchInput, query);
    await this.page.keyboard.press('Enter');
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
  
  await homePage.search('silk dress');
  
  expect(page.url()).toContain('/search');
});
```

## 🎨 Ventajas del POM

### ✅ Sin POM (Malo)
```typescript
test('buscar', async ({ page }) => {
  await page.goto('/');
  await page.locator('input#query').fill('dress');
  await page.locator('button[type="submit"]').click();
  // Si cambia el selector, hay que cambiar TODAS las pruebas
});
```

### ✅ Con POM (Bueno)
```typescript
test('buscar', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.search('dress');
  // Si cambia el selector, solo actualizas HomePage.ts
});
```

## 🔧 Mantenimiento

### Cuando cambia la UI

Si un selector cambia, solo actualizas el Page Object:

```typescript
// Antes
this.searchButton = page.locator('button[type="submit"]');

// Después
this.searchButton = page.locator('button.search-btn');
```

Las pruebas siguen funcionando sin cambios.

## 📚 Mejores Prácticas

1. **Un Page Object por página**: Cada página tiene su propia clase
2. **Métodos descriptivos**: `clickSearchButton()` en lugar de `click()`
3. **Encapsular esperas**: Las esperas van en los Page Objects, no en las pruebas
4. **Retornar Page Objects**: Los métodos que navegan pueden retornar el nuevo Page Object
5. **No hacer aserciones en Page Objects**: Las aserciones van en las pruebas

### ❌ Malo
```typescript
// En el Page Object
async search(query: string) {
  await this.searchInput.fill(query);
  await expect(this.page.url()).toContain('/search'); // ❌ No hacer assert aquí
}
```

### ✅ Bueno
```typescript
// En el Page Object
async search(query: string) {
  await this.searchInput.fill(query);
  await this.searchButton.click();
}

// En la prueba
test('buscar', async ({ page }) => {
  await homePage.search('dress');
  expect(page.url()).toContain('/search'); // ✅ Assert en la prueba
});
```

## 🚀 Agregar Nuevas Páginas

Para agregar una nueva página:

1. Crear archivo en `pages/NombrePage.ts`
2. Extender `BasePage`
3. Definir locators en el constructor
4. Agregar métodos de interacción
5. Crear pruebas en `tests/nombre.spec.ts`

Ejemplo:

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminPage extends BasePage {
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page, '/admin');
    this.loginButton = page.locator('button#login');
  }

  async login(email: string, password: string) {
    // implementación
  }
}
```

## 📖 Recursos

- [Documentación Playwright - POM](https://playwright.dev/docs/pom)
- [Mejores Prácticas de Testing](https://playwright.dev/docs/best-practices)
- [Locators en Playwright](https://playwright.dev/docs/locators)



