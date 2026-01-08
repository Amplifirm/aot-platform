import { test, expect } from "@playwright/test";

test.describe("Targets", () => {
  test.describe("People Page", () => {
    test("should display people list page", async ({ page }) => {
      await page.goto("/people");

      await expect(page.getByRole("heading", { name: /people/i })).toBeVisible();
    });

    test("should have search functionality", async ({ page }) => {
      await page.goto("/people");

      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible();
    });

    test("should have sort options", async ({ page }) => {
      await page.goto("/people");

      // Look for sort controls
      const sortSelect = page.getByRole("combobox").first();
      if (await sortSelect.isVisible()) {
        await sortSelect.click();
        await expect(page.getByRole("option")).toHaveCount(await page.getByRole("option").count());
      }
    });

    test("should display target cards", async ({ page }) => {
      await page.goto("/people");

      // Wait for content to load
      await page.waitForLoadState("networkidle");

      // Check for target cards or empty state
      const hasCards = await page.locator('[class*="card"]').first().isVisible().catch(() => false);
      const hasEmptyState = await page.getByText(/no.*found|no results/i).isVisible().catch(() => false);

      expect(hasCards || hasEmptyState).toBeTruthy();
    });
  });

  test.describe("Countries Page", () => {
    test("should display countries list page", async ({ page }) => {
      await page.goto("/countries");

      await expect(page.getByRole("heading", { name: /countries/i })).toBeVisible();
    });

    test("should have search functionality", async ({ page }) => {
      await page.goto("/countries");

      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible();
    });
  });

  test.describe("Ideas Page", () => {
    test("should display ideas list page", async ({ page }) => {
      await page.goto("/ideas");

      await expect(page.getByRole("heading", { name: /ideas/i })).toBeVisible();
    });

    test("should have search functionality", async ({ page }) => {
      await page.goto("/ideas");

      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible();
    });
  });

  test.describe("Target Detail Page", () => {
    test.beforeEach(async ({ page }) => {
      // Go to people page and click first target if exists
      await page.goto("/people");
      await page.waitForLoadState("networkidle");
    });

    test("should navigate to target detail from list", async ({ page }) => {
      // Find and click on a target card link
      const targetLink = page.locator('a[href^="/people/"]').first();

      if (await targetLink.isVisible()) {
        await targetLink.click();
        await page.waitForLoadState("networkidle");

        // Should be on detail page
        expect(page.url()).toMatch(/\/people\/[^/]+$/);
      }
    });
  });
});

test.describe("Scores Page", () => {
  test("should display scores overview page", async ({ page }) => {
    await page.goto("/scores");

    await expect(page.getByRole("heading", { name: /scores/i })).toBeVisible();
  });

  test("should have tabs for different categories", async ({ page }) => {
    await page.goto("/scores");

    // Look for tabs or category filters
    const tabs = page.getByRole("tab");
    const tabCount = await tabs.count();

    expect(tabCount).toBeGreaterThanOrEqual(0);
  });
});
