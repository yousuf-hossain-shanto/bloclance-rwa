import { expect, test } from "@playwright/test";

test("marketplace lists properties and routes into trading view", async ({ page }) => {
  await page.goto("/marketplace");

  // The list counter is rendered from `${total} Properties Available`.
  await expect(page.getByText(/properties available/i).first()).toBeVisible();

  // Trade volume is a fixed mock string for the demo dataset.
  await expect(page.getByText(/\$12,587,971/).first()).toBeVisible();

  // First card → /marketplace/<id> trading view.
  const card = page.getByText(/the azure penthouse/i).first();
  await expect(card).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(/\/marketplace\/[a-z0-9-]+$/i);
});
