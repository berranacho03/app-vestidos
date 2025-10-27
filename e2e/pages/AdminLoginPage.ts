import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para la página de login del admin
 */
export class AdminLoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page, '/admin/login');
    
    this.pageTitle = page.locator('h1', { hasText: 'Admin sign in' });
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.signInButton = page.locator('button', { hasText: 'Sign in' });
  }

  /**
   * Hacer login como admin
   * La contraseña por defecto es "admin123"
   */
  async login(username: string = 'admin', password: string = 'admin123') {
    await this.fillField(this.usernameInput, username);
    await this.fillField(this.passwordInput, password);
    await this.clickElement(this.signInButton);
    
    // Esperar a que se redirija al admin panel
    await this.page.waitForURL('**/admin', { timeout: 10000 });
  }
}


