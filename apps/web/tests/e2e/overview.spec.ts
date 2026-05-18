import { expect, test } from "@playwright/test";

test("overview page renders KPIs and opens withdraw modal", async ({ page }) => {
  await page.goto("/overview");

  // Portfolio Value KPI label + mock value.
  await expect(page.getByText(/portfolio value/i).first()).toBeVisible();
  await expect(page.getByText(/\$16,587,811/).first()).toBeVisible();

  // Withdraw Earnings CTA in the header.
  const withdraw = page.getByRole("button", { name: /withdraw earnings/i }).first();
  await expect(withdraw).toBeVisible();

  await withdraw.click();
  await expect(page.getByRole("dialog").first()).toBeVisible();
});
