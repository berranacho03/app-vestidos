import { Page, expect } from '@playwright/test';

/**
 * Page Object Model para los diálogos de SweetAlert2
 */
export class SweetAlertDialog {
  constructor(private page: Page) {}

  // Locators
  private readonly dialog = () => this.page.locator('.swal2-popup');
  private readonly title = () => this.dialog().locator('.swal2-title');
  private readonly content = () => this.dialog().locator('.swal2-html-container, .swal2-content');
  private readonly confirmButton = () => this.dialog().locator('button.swal2-confirm');
  private readonly cancelButton = () => this.dialog().locator('button.swal2-cancel');

  // Actions
  async waitForDialog(timeout: number = 10000) {
    await this.page.waitForSelector('.swal2-popup', { timeout });
    await expect(this.dialog()).toBeVisible();
  }

  async confirm() {
    await expect(this.confirmButton()).toBeVisible();
    await this.confirmButton().click();
  }

  async cancel() {
    await expect(this.cancelButton()).toBeVisible();
    await this.cancelButton().click();
  }

  async waitForAndConfirm(timeout: number = 10000) {
    await this.waitForDialog(timeout);
    await this.confirm();
  }

  async waitForSuccessAndClose(timeout: number = 3000) {
    await this.waitForDialog();
    await this.page.waitForTimeout(timeout); // Esperar que el modal se cierre automáticamente si tiene timer
    
    // Verificar si el modal aún está visible
    const isModalVisible = await this.dialog().isVisible().catch(() => false);
    
    if (isModalVisible) {
      // Verificar si el botón de confirmación está visible y habilitado antes de hacer clic
      const isButtonVisible = await this.confirmButton().isVisible().catch(() => false);
      const isButtonEnabled = await this.confirmButton().isEnabled().catch(() => false);
      
      if (isButtonVisible && isButtonEnabled) {
        await this.confirmButton().click();
        // Esperar a que el modal se oculte después del clic
        await this.page.waitForSelector('.swal2-popup', { state: 'hidden', timeout: 5000 }).catch(() => {
          // Si no se oculta, continuar de todas formas
        });
      } else {
        // Si el botón no está visible pero el modal sí, esperar a que se oculte
        await this.page.waitForSelector('.swal2-popup', { state: 'hidden', timeout: 5000 }).catch(() => {
          // Si no se oculta, continuar de todas formas
        });
      }
    }
  }

  // Verifications
  async expectTitle(expectedText: string | RegExp) {
    await expect(this.title()).toBeVisible();
    if (typeof expectedText === 'string') {
      await expect(this.title()).toContainText(expectedText);
    } else {
      const titleText = await this.title().textContent();
      expect(titleText).toMatch(expectedText);
    }
  }

  async expectContent(expectedText: string | RegExp) {
    await expect(this.content()).toBeVisible();
    if (typeof expectedText === 'string') {
      await expect(this.content()).toContainText(expectedText);
    } else {
      const contentText = await this.content().textContent();
      expect(contentText).toMatch(expectedText);
    }
  }

  async expectConfirmButtonText(expectedText: string | RegExp) {
    if (typeof expectedText === 'string') {
      await expect(this.confirmButton()).toContainText(expectedText);
    } else {
      const buttonText = await this.confirmButton().textContent();
      expect(buttonText).toMatch(expectedText);
    }
  }

  async expectVisible() {
    await expect(this.dialog()).toBeVisible();
  }

  // Getters públicos para acceder a los locators desde los tests cuando sea necesario
  getDialog() {
    return this.dialog();
  }

  getTitle() {
    return this.title();
  }

  getContent() {
    return this.content();
  }

  getConfirmButton() {
    return this.confirmButton();
  }

  getCancelButton() {
    return this.cancelButton();
  }
}

