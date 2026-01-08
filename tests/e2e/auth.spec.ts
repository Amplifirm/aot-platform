import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.describe("Login Page", () => {
    test("should display login form", async ({ page }) => {
      await page.goto("/login");

      await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    });

    test("should show validation errors for empty form", async ({ page }) => {
      await page.goto("/login");

      await page.getByRole("button", { name: /sign in/i }).click();

      // Form should show validation errors
      await expect(page.getByText(/invalid email/i)).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/login");

      await page.getByLabel(/email/i).fill("invalid@example.com");
      await page.getByLabel(/password/i).fill("wrongpassword");
      await page.getByRole("button", { name: /sign in/i }).click();

      // Should show error message
      await expect(page.getByText(/invalid credentials|no user found/i)).toBeVisible({ timeout: 10000 });
    });

    test("should have link to register page", async ({ page }) => {
      await page.goto("/login");

      const registerLink = page.getByRole("link", { name: /create.*account|register|sign up/i });
      await expect(registerLink).toBeVisible();
    });

    test("should have OAuth sign in buttons", async ({ page }) => {
      await page.goto("/login");

      // Check for OAuth buttons (Google/Twitter)
      const googleButton = page.getByRole("button", { name: /google/i });
      const twitterButton = page.getByRole("button", { name: /twitter|x/i });

      // At least one OAuth option should be present
      const hasOAuth = await googleButton.isVisible().catch(() => false) ||
                       await twitterButton.isVisible().catch(() => false);
      expect(hasOAuth).toBeTruthy();
    });
  });

  test.describe("Register Page", () => {
    test("should display registration form", async ({ page }) => {
      await page.goto("/register");

      await expect(page.getByRole("heading", { name: /create.*account|register|sign up/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i).first()).toBeVisible();
    });

    test("should validate email format", async ({ page }) => {
      await page.goto("/register");

      await page.getByLabel(/email/i).fill("invalidemail");
      await page.getByLabel(/password/i).first().fill("password123");

      await page.getByRole("button", { name: /create|register|sign up/i }).click();

      await expect(page.getByText(/invalid email/i)).toBeVisible();
    });

    test("should have link to login page", async ({ page }) => {
      await page.goto("/register");

      const loginLink = page.getByRole("link", { name: /sign in|login|already have/i });
      await expect(loginLink).toBeVisible();
    });
  });
});
