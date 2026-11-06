import { test, expect } from '@playwright/test';

test.describe('In-Person Tour Booking & Auth Interception', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('Unauthenticated user is prompted to sign in and completes tour reservation', async ({
    page,
  }) => {
    // Ensure clean unauthenticated initial state
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    // Navigate to property detail page
    await page.goto('/properties/luxury-penthouse');

    // Click schedule tour CTA
    const scheduleTourBtn = page.locator('[data-testid="schedule-tour-btn"]').first();
    await expect(scheduleTourBtn).toBeVisible();
    await scheduleTourBtn.scrollIntoViewIfNeeded();
    await scheduleTourBtn.click();

    // Verify auth modal intercept
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await page.locator('[data-testid="auth-email-input"]').fill('buyer@example.com');
    await page.locator('[data-testid="auth-password-input"]').fill('Password123!');
    await page.locator('[data-testid="auth-submit-btn"]').click();

    // User is returned directly to slot selector modal
    await expect(page.locator('[data-testid="tour-booking-modal"]')).toBeVisible();

    // Select an available 45-minute slot
    const slotPill = page.locator('[data-testid="available-slot-pill"]').first();
    await expect(slotPill).toBeVisible();
    await slotPill.click();

    // Confirm the reservation
    await page.locator('[data-testid="confirm-booking-btn"]').click();

    // Confirmation message and .ics download banner displayed
    await expect(page.locator('[data-testid="booking-success-banner"]')).toBeVisible();
  });
});
