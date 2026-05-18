import { describe, expect, it } from "vitest";
import { computeTotal, formatUsd } from "../../src/lib/money";

describe("computeTotal", () => {
  it("multiplies integer units by integer price without decimals", () => {
    expect(computeTotal(300, 430)).toBe("129000");
  });

  it("accepts decimal-string prices (the API shape)", () => {
    expect(computeTotal(3, "430.00")).toBe("1290.00");
    expect(computeTotal(2, "12.50")).toBe("25.00");
  });

  it("returns '0' for non-finite inputs", () => {
    expect(computeTotal(Number.NaN, 10)).toBe("0");
    expect(computeTotal(10, "not-a-number")).toBe("0");
    expect(computeTotal(Number.POSITIVE_INFINITY, 1)).toBe("0");
  });

  it("handles zero units", () => {
    expect(computeTotal(0, 430)).toBe("0");
  });
});

describe("formatUsd", () => {
  it("formats integers with a dollar sign and grouping", () => {
    expect(formatUsd(129000)).toBe("$129,000");
  });

  it("strips fractional digits", () => {
    expect(formatUsd("12587.55")).toBe("$12,588");
  });

  it("returns $0 for garbage", () => {
    expect(formatUsd("nope")).toBe("$0");
  });
});
