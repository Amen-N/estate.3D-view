import { test, expect } from '@playwright/test';

test.describe('Responsive Property Directory & Filters', () => {
  test('Applies filters and updates grid across mobile and desktop viewports', async ({ page }) => {
    await page.goto('/properties');

    // On mobile screens, activate filter drawer
    const mobileFilterTrigger = page.locator('[data-testid="filter-bottom-sheet-btn"]');
    if (await mobileFilterTrigger.isVisible()) {
      await mobileFilterTrigger.click();
    }

    // Toggle 3D showroom filter checkbox
    await page.locator('[data-testid="filter-has-showroom-toggle"]').click();

    if (await mobileFilterTrigger.isVisible()) {
      await page.locator('[data-testid="apply-filters-btn"]').click();
    }

    // Verify property card attributes
    const firstCard = page.locator('[data-testid="property-card"]').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.locator('[data-testid="showroom-badge"]')).toBeVisible();
  });
});
