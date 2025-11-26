import { Page, expect } from '@playwright/test';

/**
 * Page Object Model para la página de login de administrador
 */
export class AdminLoginPage {
  constructor(private page: Page) {}

  // Locators
  private readonly usernameInput = () => this.page.locator('input[name="username"]');
  private readonly passwordInput = () => this.page.locator('input[name="password"]');
  private readonly submitButton = () => this.page.locator('button[type="submit"]');

  // Actions
  async goto() {
    await this.page.goto('/admin/login');
  }

  async fillUsername(username: string = process.env.ADMIN_USERNAME || 'admin') {
    await this.usernameInput().fill(username);
  }

  async fillPassword(password: string = process.env.ADMIN_PASSWORD || 'admin123') {
    await this.passwordInput().fill(password);
  }

  async login(username?: string, password?: string) {
    await this.goto();
    await this.fillUsername(username);
    await this.fillPassword(password);
    
    await expect(this.submitButton()).toBeEnabled();

    // Configurar listener para esperar la respuesta de la API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiResponsePromise = this.page.waitForResponse(
      (response: any) => 
        response.url().includes('/api/admin/login') &&
        response.request().method() === 'POST',
      { timeout: 15000 }
    );

    await this.submitButton().click();

    const apiResponse = await apiResponsePromise;
    expect(apiResponse.status()).toBe(200);
    expect(apiResponse.ok()).toBe(true);

    // Esperar a que la redirección complete
    await this.page.waitForURL(/\/admin$/, { timeout: 10000 });
  }

  // Verifications
  async expectToBeOnLoginPage() {
    await expect(this.page).toHaveURL(/\/admin\/login/);
  }

  async expectSubmitButtonEnabled() {
    await expect(this.submitButton()).toBeEnabled();
  }

  // Getter público para acceso directo cuando sea necesario
  getSubmitButton() {
    return this.submitButton();
  }
}

