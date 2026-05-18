import { expect, test } from "@playwright/test";

test("profile page renders wallets section with copy buttons", async ({ page }) => {
  await page.goto("/profile");

  // Section title.
  await expect(page.getByText(/your surge wallets/i).first()).toBeVisible();

  // Two wallet rows (XRP + RLUSD) each have a Copy button.
  const copyButtons = page.getByRole("button", { name: /^copy$/i });
  await expect(copyButtons).toHaveCount(2);
});
