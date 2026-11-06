import { test, expect } from '@playwright/test';

test.describe('Virtual Showroom Viewer & Node Navigation', () => {
  test('Initializes viewer and navigates between rooms on click', async ({ page }) => {
    await page.goto('/properties/luxury-penthouse');

    // Click CTA to open showroom
    const openBtn = page.locator('[data-testid="open-showroom-btn"]');
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    // Verify 360 panorama canvas is mounted
    const canvas = page.locator('canvas.pnlm-render-canvas');
    await expect(canvas).toBeVisible();

    // Click navigation hotspot to transition to the Kitchen scene
    const navHotspot = page.locator('[data-testid="hotspot-nav-kitchen"]');
    await expect(navHotspot).toBeVisible();
    await navHotspot.click();

    // Confirm scene change label updates to Kitchen
    await expect(page.locator('[data-testid="current-room-label"]')).toHaveText(/Kitchen/i);
  });

  test('Toggles between 360 Panorama mode and 3D architectural model mode', async ({ page }) => {
    await page.goto('/properties/luxury-penthouse');
    await page.locator('[data-testid="open-showroom-btn"]').click();

    // Verify initial 360 panorama canvas is visible
    await expect(page.locator('canvas.pnlm-render-canvas')).toBeVisible();

    // Switch to 3D Model mode
    const mode3dBtn = page.locator('[data-testid="mode-toggle-3d"]');
    await expect(mode3dBtn).toBeVisible();
    await mode3dBtn.click();

    // Verify 3D canvas is mounted
    await expect(page.locator('canvas:not(.pnlm-render-canvas)')).toBeVisible();

    // Switch back to 360 mode
    const mode360Btn = page.locator('[data-testid="mode-toggle-360"]');
    await mode360Btn.click();
    await expect(page.locator('canvas.pnlm-render-canvas')).toBeVisible();
  });
});
