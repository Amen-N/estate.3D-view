import { test, expect } from '@playwright/test';

test.describe('Admin Visual Showroom Studio', () => {
  test('Admin clicks on 360 panorama canvas to pin a new hotspot dynamically', async ({ page }) => {
    // Log in as Admin
    await page.goto('/login');
    await page.locator('[data-testid="auth-email-input"]').fill('admin@example.com');
    await page.locator('[data-testid="auth-password-input"]').fill('AdminSecret123!');
    await page.locator('[data-testid="auth-submit-btn"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toBeHidden();

    // Navigate to Showroom Studio
    await page.goto('/admin/properties/luxury-penthouse/showroom-studio');

    // Click coordinate on the 360 viewer canvas
    const canvas = page.locator('canvas.pnlm-render-canvas');
    await expect(canvas).toBeVisible();
    await canvas.click({ position: { x: 350, y: 220 } });

    // Verify coordinate picker dialog opens with coordinates filled
    const modal = page.locator('[data-testid="hotspot-create-modal"]');
    await expect(modal).toBeVisible();
    await expect(modal.locator('[data-testid="hotspot-pitch-input"]')).not.toBeEmpty();
    await expect(modal.locator('[data-testid="hotspot-yaw-input"]')).not.toBeEmpty();

    // Fill form and submit
    await modal.locator('[data-testid="hotspot-title-input"]').fill('Dining Room Gateway');
    await modal.locator('[data-testid="save-hotspot-btn"]').click();

    // Confirm hotspot badge appears in the studio scene tree
    await expect(page.locator('[data-testid="hotspot-list"]')).toContainText('Dining Room Gateway');
  });

  test('Admin accesses Command Center to inspect KPIs, Audit Trail, and Master Tours', async ({ page }) => {
    // Log in as Admin
    await page.goto('/login');
    await page.locator('[data-testid="auth-email-input"]').fill('admin@example.com');
    await page.locator('[data-testid="auth-password-input"]').fill('AdminSecret123!');
    await page.locator('[data-testid="auth-submit-btn"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toBeHidden();

    // Navigate to Admin Dashboard
    await page.goto('/admin/dashboard');
    await expect(page.locator('h1')).toContainText('EstateView Super-Admin Command Center');
    await expect(page.locator('text=Total Listings')).toBeVisible();

    // Switch to Audit Logs tab
    await page.locator('[data-testid="admin-tab-audit"]').click();
    await expect(page.locator('text=System Audit Trail')).toBeVisible();

    // Switch to Master Tours tab
    await page.locator('[data-testid="admin-tab-tours"]').click();
    await expect(page.locator('text=All Scheduled Tours Across Agents')).toBeVisible();
  });

  test('Admin dynamically adds a new room scene via SceneCreateModal in Showroom Studio', async ({ page }) => {
    // Log in as Admin
    await page.goto('/login');
    await page.locator('[data-testid="auth-email-input"]').fill('admin@example.com');
    await page.locator('[data-testid="auth-password-input"]').fill('AdminSecret123!');
    await page.locator('[data-testid="auth-submit-btn"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toBeHidden();

    // Navigate to Showroom Studio
    await page.goto('/admin/properties/luxury-penthouse/showroom-studio');

    // Trigger "+ Add Room" modal
    const addSceneBtn = page.locator('[data-testid="add-scene-modal-btn"]');
    await expect(addSceneBtn).toBeVisible();
    await addSceneBtn.click();

    // Verify modal is open
    const sceneModal = page.locator('[data-testid="scene-create-modal"]');
    await expect(sceneModal).toBeVisible();

    // Enter room name and save
    await sceneModal.locator('[data-testid="scene-name-input"]').fill('Sky Lounge Oasis');
    await sceneModal.locator('[data-testid="save-scene-btn"]').click();

    // Verify modal closes and room appears in showroom scene tabs
    await expect(sceneModal).toBeHidden();
    await expect(page.locator('[data-testid="studio-scenes-list"]')).toContainText('Sky Lounge Oasis');
  });
});
