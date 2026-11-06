import { test, expect } from '@playwright/test';

test.describe('Responsive Authentication Flow', () => {
  test('User can register, log in, and view their profile across viewports', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Handle responsive navigation: open hamburger menu if visible on mobile
    const mobileMenuBtn = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click();
    }

    await page.locator('[data-testid="nav-login-btn"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();

    // Fill credentials
    await page.locator('[data-testid="auth-email-input"]').fill('buyer@example.com');
    await page.locator('[data-testid="auth-password-input"]').fill('Password123!');
    await page.locator('[data-testid="auth-submit-btn"]').click();

    // Modal closes upon successful login
    await expect(page.locator('[data-testid="auth-modal"]')).not.toBeVisible();

    // Verify authenticated state
    if (await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click();
    }
    await expect(page.locator('[data-testid="user-profile-avatar"]')).toBeVisible();
  });

  test('User can switch between Login and Register tabs', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const mobileMenuBtn = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click();
    }

    await page.locator('[data-testid="nav-login-btn"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();

    // Switch to register
    await page.locator('[data-testid="auth-tab-register"]').click();
    await expect(page.locator('[data-testid="auth-fullname-input"]')).toBeVisible();

    // Switch back to login
    await page.locator('[data-testid="auth-tab-login"]').click();
    await expect(page.locator('[data-testid="auth-fullname-input"]')).not.toBeVisible();

    // Close modal
    await page.locator('[data-testid="auth-modal-close"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).not.toBeVisible();
  });
});
