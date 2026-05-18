import { describe, expect, it } from "vitest";
import { type Trade, aggregateCandles } from "../../src/index";

/**
 * Build a fake trade for a fixed wall-clock day. `dayUtcIso` should be a
 * midnight-UTC ISO string so trades on the same day land in the same 1d
 * bucket regardless of host timezone.
 */
function makeTrade(id: string, dayUtcIso: string, pricePerUnit: string, units: number): Trade {
  return {
    id,
    hash: id,
    ledgerIndex: Number.parseInt(id.replace(/\D/g, ""), 10) || 0,
    occurredAtMs: new Date(dayUtcIso).getTime(),
    side: "Buy",
    units,
    pricePerUnit,
  };
}

describe("aggregateCandles (1d)", () => {
  const DAY_A = "2026-05-10T";
  const DAY_B = "2026-05-11T";

  const trades: Trade[] = [
    // Day A — open 100, high 120, low 90, close 110, vol 60
    makeTrade("t1", `${DAY_A}01:00:00Z`, "100", 10),
    makeTrade("t2", `${DAY_A}05:00:00Z`, "120", 20),
    makeTrade("t3", `${DAY_A}10:00:00Z`, "90", 5),
    makeTrade("t4", `${DAY_A}23:00:00Z`, "110", 25),
    // Day B — open 115, high 130, low 115, close 130, vol 15
    makeTrade("t5", `${DAY_B}02:00:00Z`, "115", 7),
    makeTrade("t6", `${DAY_B}20:00:00Z`, "130", 8),
  ];

  it("yields one candle per UTC day", () => {
    const candles = aggregateCandles(trades, "1d");
    expect(candles).toHaveLength(2);
  });

  it("computes correct OHLCV for day A", () => {
    const [a] = aggregateCandles(trades, "1d");
    expect(a).toBeDefined();
    if (!a) return;
    expect(a.o).toBe("100");
    expect(Number(a.h)).toBe(120);
    expect(Number(a.l)).toBe(90);
    expect(a.c).toBe("110");
    expect(Number(a.v)).toBe(60);
  });

  it("computes correct OHLCV for day B", () => {
    const [, b] = aggregateCandles(trades, "1d");
    expect(b).toBeDefined();
    if (!b) return;
    expect(b.o).toBe("115");
    expect(Number(b.h)).toBe(130);
    expect(Number(b.l)).toBe(115);
    expect(b.c).toBe("130");
    expect(Number(b.v)).toBe(15);
  });

  it("returns candles in ascending time order", () => {
    const candles = aggregateCandles(trades, "1d");
    for (let i = 1; i < candles.length; i++) {
      const cur = candles[i];
      const prev = candles[i - 1];
      if (!cur || !prev) continue;
      expect(cur.t).toBeGreaterThan(prev.t);
    }
  });

  it("handles an empty input", () => {
    expect(aggregateCandles([], "1d")).toEqual([]);
  });
});
