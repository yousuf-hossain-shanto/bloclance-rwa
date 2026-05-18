import { describe, expect, it } from "vitest";
import { buildOfferCancel, buildOfferCreate, buildPayment, buildTrustSet } from "../../src/index";

const ACCOUNT = "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe";
const ISSUER = "rIssuerXRPLTestnetAddrxxxxxxxxxxx";
const COUNTERPARTY = "rDestinationXRPLTestnetxxxxxxxxxxx";

const PROPERTY_AMOUNT = { currency: "PRP", issuer: ISSUER, value: "10" };
const XRP_AMOUNT = "1000000"; // 1 XRP in drops

describe("buildOfferCreate", () => {
  it("returns a well-formed OfferCreate tx", () => {
    const tx = buildOfferCreate({
      account: ACCOUNT,
      takerGets: PROPERTY_AMOUNT,
      takerPays: XRP_AMOUNT,
    });
    expect(tx.TransactionType).toBe("OfferCreate");
    expect(tx.Account).toBe(ACCOUNT);
    expect(tx.TakerGets).toEqual(PROPERTY_AMOUNT);
    expect(tx.TakerPays).toBe(XRP_AMOUNT);
    expect(tx.Flags).toBeUndefined();
    expect(tx.Expiration).toBeUndefined();
  });

  it("propagates flags + expiration when provided", () => {
    const tx = buildOfferCreate({
      account: ACCOUNT,
      takerGets: PROPERTY_AMOUNT,
      takerPays: XRP_AMOUNT,
      flags: 0x0004_0000,
      expiration: 740_000_000,
    });
    expect(tx.Flags).toBe(0x0004_0000);
    expect(tx.Expiration).toBe(740_000_000);
  });

  it("hex-encodes memo type + data", () => {
    const tx = buildOfferCreate({
      account: ACCOUNT,
      takerGets: PROPERTY_AMOUNT,
      takerPays: XRP_AMOUNT,
      memos: [{ memoType: "order", memoData: "hi" }],
    });
    expect(tx.Memos).toBeDefined();
    expect(tx.Memos?.[0]?.Memo?.MemoType).toBe(
      Buffer.from("order", "utf8").toString("hex").toUpperCase(),
    );
    expect(tx.Memos?.[0]?.Memo?.MemoData).toBe(
      Buffer.from("hi", "utf8").toString("hex").toUpperCase(),
    );
  });
});

describe("buildOfferCancel", () => {
  it("returns a well-formed OfferCancel tx", () => {
    const tx = buildOfferCancel({ account: ACCOUNT, offerSequence: 42 });
    expect(tx).toEqual({
      TransactionType: "OfferCancel",
      Account: ACCOUNT,
      OfferSequence: 42,
    });
  });
});

describe("buildPayment", () => {
  it("returns a well-formed Payment tx", () => {
    const tx = buildPayment({
      account: ACCOUNT,
      destination: COUNTERPARTY,
      amount: XRP_AMOUNT,
    });
    expect(tx.TransactionType).toBe("Payment");
    expect(tx.Account).toBe(ACCOUNT);
    expect(tx.Destination).toBe(COUNTERPARTY);
    expect(tx.Amount).toBe(XRP_AMOUNT);
    expect(tx.DestinationTag).toBeUndefined();
  });

  it("includes a destinationTag when provided", () => {
    const tx = buildPayment({
      account: ACCOUNT,
      destination: COUNTERPARTY,
      amount: XRP_AMOUNT,
      destinationTag: 7,
    });
    expect(tx.DestinationTag).toBe(7);
  });
});

describe("buildTrustSet", () => {
  it("returns a well-formed TrustSet tx", () => {
    const tx = buildTrustSet({
      account: ACCOUNT,
      currency: "RLUSD",
      issuer: ISSUER,
      limit: "1000000",
    });
    expect(tx).toEqual({
      TransactionType: "TrustSet",
      Account: ACCOUNT,
      LimitAmount: { currency: "RLUSD", issuer: ISSUER, value: "1000000" },
    });
  });
});
