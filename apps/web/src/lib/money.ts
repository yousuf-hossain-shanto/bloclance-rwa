/**
 * Money / unit math helpers used in the purchase + trading flows.
 *
 * We keep these as pure functions (no Prisma / no Decimal) so they're trivial
 * to test from Vitest, and we return strings to preserve precision when
 * passing back through the tRPC boundary. JS `Number` is fine for the small
 * unit counts the UI sees; we round to 2 dp for fiat display.
 */

/**
 * `units * pricePerUnit`, returned as a string with up to 2 fractional digits.
 *
 * Accepts `pricePerUnit` as either `number` or `string` (the API hands prices
 * back as decimal strings to dodge JS float drift). NaN inputs yield `"0"`.
 */
export function computeTotal(units: number, pricePerUnit: string | number): string {
  const priceIsDecimalString = typeof pricePerUnit === "string" && pricePerUnit.includes(".");
  const price = typeof pricePerUnit === "string" ? Number(pricePerUnit) : pricePerUnit;
  if (!Number.isFinite(units) || !Number.isFinite(price)) return "0";
  const total = units * price;
  if (!Number.isFinite(total)) return "0";
  // If the price came in as a fractional string, keep fixed-2 formatting so
  // money displays consistently. Otherwise use integer math when both
  // operands are integers (so 300 * 430 = "129000", not "129000.00").
  if (priceIsDecimalString) return total.toFixed(2);
  if (Number.isInteger(units) && Number.isInteger(price)) return String(total);
  return total.toFixed(2);
}

/** Format a numeric total as `$X,XXX` (no decimals). */
export function formatUsd(value: string | number): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "$0";
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
