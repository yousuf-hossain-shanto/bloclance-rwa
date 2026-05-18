import { expect, test } from "@playwright/test";

test("asset detail page renders name + Invest now CTA", async ({ page }) => {
  await page.goto("/explore");

  // Open the first property card.
  await page
    .getByText(/the azure penthouse/i)
    .first()
    .click();
  await expect(page).toHaveURL(/\/explore\/[a-z0-9-]+$/i);

  // Asset name shows up in the AssetHeader.
  await expect(page.getByText(/the azure penthouse/i).first()).toBeVisible();

  // Primary CTA.
  const cta = page.getByRole("button", { name: /invest now/i }).first();
  await expect(cta).toBeVisible();

  // Clicking opens either the auth-gate modal (unauth) or the purchase modal.
  await cta.click();
  await expect(page.getByRole("dialog").first()).toBeVisible();
});
