import { test, expect } from '@playwright/test';

test.describe('Theme Ambience & Homepage Concierge Portal', () => {
  test('User can switch luxury themes with persistent HTML class update', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Open Theme Selector in Navbar or mobile drawer
    const mobileMenuBtn = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click();
    }

    const themeSelectorBtn = page.locator('[data-testid="theme-selector"]:visible');
    await expect(themeSelectorBtn).toBeVisible();
    await themeSelectorBtn.click();

    // Select Imperial Gold theme
    const goldOption = page.locator('[data-testid="theme-option-gold"]:visible');
    await expect(goldOption).toBeVisible();
    await goldOption.click();

    // Verify HTML root class changed to theme-gold
    await expect(page.locator('html')).toHaveClass(/theme-gold/);

    // Switch to Emerald Noir
    await themeSelectorBtn.click();
    const emeraldOption = page.locator('[data-testid="theme-option-emerald"]:visible');
    await emeraldOption.click();
    await expect(page.locator('html')).toHaveClass(/theme-emerald/);

    // Switch to Nordic Ivory
    await themeSelectorBtn.click();
    const lightOption = page.locator('[data-testid="theme-option-light"]:visible');
    await lightOption.click();
    await expect(page.locator('html')).toHaveClass(/theme-light/);

    // Restore Architectural Slate
    await themeSelectorBtn.click();
    const slateOption = page.locator('[data-testid="theme-option-slate"]:visible');
    await slateOption.click();
    await expect(page.locator('html')).toHaveClass(/theme-slate/);
  });

  test('Homepage Concierge Portal enables 1-click test authentication and direct sign-in', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Locate HomeAuthHelper on homepage
    const homeAuth = page.locator('[data-testid="home-auth-helper"]');
    await expect(homeAuth).toBeVisible();

    // Switch to 1-Click Fast Sandbox tab
    await page.locator('[data-testid="home-auth-tab-quick"]').click();

    // Click Sandbox Buyer Account 1-click login
    await page.locator('[data-testid="home-sandbox-buyer-btn"]').click();

    // Verify Authenticated VIP Lounge banner is visible with user info
    const authBanner = page.locator('[data-testid="home-auth-authenticated-banner"]');
    await expect(authBanner).toBeVisible();
    await expect(authBanner).toContainText('buyer@example.com');

    // Logout from Home Concierge
    await page.locator('[data-testid="home-auth-logout-btn"]').click();
    await expect(authBanner).not.toBeVisible();

    // Switch to Sign In tab and test direct home login form
    await page.locator('[data-testid="home-auth-tab-login"]').click();
    await page.locator('[data-testid="home-login-email-input"]').fill('admin@example.com');
    await page.locator('[data-testid="home-login-password-input"]').fill('AdminSecret123!');
    await page.locator('[data-testid="home-login-submit-btn"]').click();

    // Verify logged in as admin
    await expect(authBanner).toBeVisible();
    await expect(authBanner).toContainText('admin@example.com');
    await expect(authBanner).toContainText('admin');

    // Clean up: logout
    await page.locator('[data-testid="home-auth-logout-btn"]').click();
    await expect(authBanner).not.toBeVisible();
  });
});
