import { expect, test } from "@playwright/test";

test("explore page lists properties and links to detail", async ({ page }) => {
  await page.goto("/explore");

  // Section header is the canonical landmark for the route.
  await expect(page.getByRole("heading", { name: /explore available properties/i })).toBeVisible();

  // At least one card renders — find via the seeded property name.
  const card = page.getByText(/the azure penthouse/i).first();
  await expect(card).toBeVisible();

  // Clicking a card should route to /explore/<id>.
  await card.click();
  await expect(page).toHaveURL(/\/explore\/[a-z0-9-]+$/i);
});
