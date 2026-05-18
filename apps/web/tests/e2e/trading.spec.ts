import { expect, test } from "@playwright/test";

test("trading view renders ticket and opens confirm modal on Buy", async ({ page }) => {
  await page.goto("/marketplace");
  await page
    .getByText(/the azure penthouse/i)
    .first()
    .click();
  await expect(page).toHaveURL(/\/marketplace\/[a-z0-9-]+$/i);

  // AssetHeader name visible.
  await expect(page.getByText(/the azure penthouse/i).first()).toBeVisible();

  // Buy + Sell toggle on the ticket.
  await expect(page.getByRole("button", { name: /^buy$/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /^sell$/i }).first()).toBeVisible();

  // Units stepper input. The TradingClient seeds units = 3, so we don't
  // need to type — just assert the field is reachable, then submit.
  const unitsInput = page.getByRole("spinbutton").first();
  await expect(unitsInput).toBeVisible();
  await unitsInput.fill("3");

  // The ticket's submit button is labelled "Buy" (matches `side`). It opens
  // the Confirm Order modal which is a role=dialog.
  await page.getByRole("button", { name: /^buy$/i }).last().click();
  await expect(page.getByRole("dialog").first()).toBeVisible();
});
