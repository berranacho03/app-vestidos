import { Page, expect } from '@playwright/test';

/**
 * Page Object Model para el componente de formulario de alquiler
 */
export class RentalFormComponent {
  constructor(private page: Page) {}

  // Locators
  private readonly form = () => this.page.locator('form');
  private readonly nameInput = () => this.page.locator('input[name="name"][type="text"]');
  private readonly emailInput = () => this.page.locator('input[name="email"]');
  private readonly phoneInput = () => this.page.locator('input[name="phone"]');
  private readonly startDateInput = () => this.page.locator('input[name="start"]');
  private readonly endDateInput = () => this.page.locator('input[name="end"]');
  private readonly submitButton = () => this.page.locator('button[type="submit"]');
  private readonly userInfoSection = () => this.page.locator('text=/Alquilando como usuario/i');
  private readonly successModal = () => this.page.locator('.swal2-popup');
  private readonly errorModal = () => this.page.locator('.swal2-popup');

  // Actions
  async fillPersonalInfo(name: string, email: string, phone: string) {
    const isVisible = await this.nameInput().count() > 0 && 
                      await this.nameInput().isVisible().catch(() => false);
    
    if (isVisible) {
      await this.nameInput().fill(name);
      await this.emailInput().fill(email);
      await this.phoneInput().fill(phone);
    }
  }

  async fillDates(startDate: string, endDate: string) {
    await this.startDateInput().fill(startDate);
    await this.endDateInput().fill(endDate);
    await this.page.waitForTimeout(500); // Esperar que los inputs se actualicen
  }

  async fillFutureDates(daysOffset: number = 7, durationDays: number = 2) {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + daysOffset);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + durationDays);

    await this.fillDates(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  }

  async submit() {
    await expect(this.submitButton()).toBeEnabled();

    // Configurar listener para esperar la respuesta de la API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiResponsePromise = this.page.waitForResponse(
      (response: any) => 
        response.url().includes('/api/rentals') &&
        response.request().method() === 'POST',
      { timeout: 15000 }
    );

    await this.submitButton().click();

    const apiResponse = await apiResponsePromise;
    return apiResponse;
  }

  async submitWithRetry(retryDaysOffset: number = 90) {
    const apiResponse = await this.submit();

    // Si recibimos 409 (conflicto), reintentar con fechas más futuras
    if (apiResponse.status() === 409) {
      await this.fillFutureDates(retryDaysOffset, 2);
      return await this.submit();
    }

    return apiResponse;
  }

  async waitForSuccessModal() {
    await this.page.waitForSelector('.swal2-popup', { timeout: 10000 });
    await expect(this.successModal()).toBeVisible();
  }

  async closeSuccessModal() {
    const confirmButton = this.successModal().locator('.swal2-confirm');
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async submitCompleteRental(
    name: string = 'Ana Pérez',
    email: string = 'ana@mail.com',
    phone: string = '12345678',
    daysOffset: number = 60
  ) {
    await this.fillPersonalInfo(name, email, phone);
    await this.fillFutureDates(daysOffset, 2);
    
    const apiResponse = await this.submitWithRetry(90);
    expect(apiResponse.status()).toBe(200);

    await this.waitForSuccessModal();
    await this.closeSuccessModal();
  }

  // Verifications
  async expectFormVisible() {
    await expect(this.form()).toBeVisible();
  }

  async expectUserAuthenticated() {
    await expect(this.userInfoSection()).toBeVisible();
  }

  async expectUserNotAuthenticated() {
    const nameInputVisible = await this.nameInput().count() > 0 && 
                             await this.nameInput().isVisible().catch(() => false);
    expect(nameInputVisible).toBe(true);
  }

  async expectSuccessMessage() {
    await this.waitForSuccessModal();
    const modalTitle = this.successModal().locator('.swal2-title, h2, [class*="title"]');
    await expect(modalTitle).toBeVisible();
    const titleText = await modalTitle.textContent();
    expect(titleText?.toLowerCase()).toMatch(/reserva|éxito|success|enviada/i);
  }

  async expectErrorMessage() {
    await expect(this.errorModal()).toBeVisible();
  }

  // Getters públicos para acceder a los locators desde los tests cuando sea necesario
  getNameInput() {
    return this.nameInput();
  }

  getEmailInput() {
    return this.emailInput();
  }

  getPhoneInput() {
    return this.phoneInput();
  }

  getStartDateInput() {
    return this.startDateInput();
  }

  getEndDateInput() {
    return this.endDateInput();
  }

  getSubmitButton() {
    return this.submitButton();
  }
}

