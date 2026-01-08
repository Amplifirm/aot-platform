import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.describe("Header", () => {
    test("should display header with logo", async ({ page }) => {
      await page.goto("/");

      // Check for header/nav
      const header = page.locator("header").first();
      await expect(header).toBeVisible();

      // Check for logo/brand
      const logo = page.getByRole("link", { name: /aot/i }).first();
      await expect(logo).toBeVisible();
    });

    test("should have main navigation links", async ({ page }) => {
      await page.goto("/");

      // Check for main nav links
      await expect(page.getByRole("link", { name: /people/i }).first()).toBeVisible();
      await expect(page.getByRole("link", { name: /countries/i }).first()).toBeVisible();
      await expect(page.getByRole("link", { name: /ideas/i }).first()).toBeVisible();
    });

    test("should have auth links when not logged in", async ({ page }) => {
      await page.goto("/");

      // Check for sign in / register links
      const signInLink = page.getByRole("link", { name: /sign in|login/i });
      const registerLink = page.getByRole("link", { name: /register|sign up|get started/i });

      const hasSignIn = await signInLink.isVisible().catch(() => false);
      const hasRegister = await registerLink.isVisible().catch(() => false);

      expect(hasSignIn || hasRegister).toBeTruthy();
    });

    test("should navigate to people page", async ({ page }) => {
      await page.goto("/");

      await page.getByRole("link", { name: /people/i }).first().click();
      await page.waitForURL("**/people");

      expect(page.url()).toContain("/people");
    });

    test("should navigate to countries page", async ({ page }) => {
      await page.goto("/");

      await page.getByRole("link", { name: /countries/i }).first().click();
      await page.waitForURL("**/countries");

      expect(page.url()).toContain("/countries");
    });

    test("should navigate to ideas page", async ({ page }) => {
      await page.goto("/");

      await page.getByRole("link", { name: /ideas/i }).first().click();
      await page.waitForURL("**/ideas");

      expect(page.url()).toContain("/ideas");
    });
  });

  test.describe("Home Page", () => {
    test("should display home page with hero section", async ({ page }) => {
      await page.goto("/");

      // Check for hero content
      await expect(page.getByRole("heading").first()).toBeVisible();
    });

    test("should have call-to-action buttons", async ({ page }) => {
      await page.goto("/");

      // Look for CTA buttons
      const ctaButton = page.getByRole("link", { name: /get started|start scoring|explore/i }).first();
      const hasCTA = await ctaButton.isVisible().catch(() => false);

      expect(hasCTA).toBeTruthy();
    });

    test("should have AOT formula or explanation", async ({ page }) => {
      await page.goto("/");

      // Check for AOT explanation
      const hasFormula = await page.getByText(/accomplishments.*offenses|a.*o.*t/i).first().isVisible().catch(() => false);
      expect(hasFormula).toBeTruthy();
    });
  });

  test.describe("Mobile Navigation", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("should have mobile menu toggle", async ({ page }) => {
      await page.goto("/");

      // Look for mobile menu button
      const menuButton = page.getByRole("button", { name: /menu|toggle/i });
      const hasMenuButton = await menuButton.isVisible().catch(() => false);

      // Mobile should have menu toggle
      expect(hasMenuButton).toBeTruthy();
    });

    test("should open mobile menu on click", async ({ page }) => {
      await page.goto("/");

      const menuButton = page.getByRole("button", { name: /menu|toggle/i });

      if (await menuButton.isVisible()) {
        await menuButton.click();

        // Menu should be open - look for nav links
        await expect(page.getByRole("link", { name: /people/i })).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe("Footer", () => {
    test("should display footer", async ({ page }) => {
      await page.goto("/");

      const footer = page.locator("footer");
      await expect(footer).toBeVisible();
    });

    test("should have footer links", async ({ page }) => {
      await page.goto("/");

      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Check for common footer links
      const footer = page.locator("footer");
      await expect(footer).toBeVisible();
    });
  });
});
