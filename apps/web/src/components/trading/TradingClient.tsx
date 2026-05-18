"use client";

import { buildOfferCreateParams, placeOrder } from "@/actions/orders";
import { useXrpl } from "@/hooks/use-xrpl";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlaceOrderSchema } from "@surgexrp/shared";
import type { Candle, OrderBookLevel, PropertyCard } from "@surgexrp/shared";
import { mockCandles, mockOrderBook } from "@surgexrp/shared/mocks";
import {
  Button,
  BuySellTicket,
  ChartPanel,
  ConfirmOrderModal,
  EmptyState,
  type OrderBookSide,
  type OrderBookTab,
  OrderBookTable,
  TradingPageLayout,
} from "@surgexrp/ui";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { type ReactElement, type ReactNode, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

export interface TradingClientProps {
  property: PropertyCard;
  marketPriceUsd: string;
  availableBalance: string;
  /** Server-rendered AssetHeader, slotted into the trading layout. */
  assetHeader: ReactNode;
}

type FormValues = z.input<typeof PlaceOrderSchema>;

type ChartTab = "price" | "yield";
type ChartTimeframe = "all" | "3m" | "6m" | "1y";

function fmtPriceUsd(v: string | number): string {
  const n = typeof v === "string" ? Number(v) : v;
  if (Number.isNaN(n)) return "—";
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function bookLevelsToRows(bids: OrderBookLevel[], asks: OrderBookLevel[]) {
  const len = Math.max(bids.length, asks.length);
  return Array.from({ length: len }, (_, i) => ({
    bidUnits: bids[i]?.units,
    bidPrice: bids[i]?.pricePerUnit,
    askUnits: asks[i]?.units,
    askPrice: asks[i]?.pricePerUnit,
  }));
}

/**
 * Trading view client island. Composes TradingPageLayout's slots, owns the
 * RHF + zod order-entry form, and renders the Confirm Order modal.
 */
export function TradingClient({
  property,
  marketPriceUsd,
  availableBalance,
  assetHeader,
}: TradingClientProps): ReactElement {
  const router = useRouter();
  const [chartTab, setChartTab] = useState<ChartTab>("price");
  const [chartTf, setChartTf] = useState<ChartTimeframe>("all");
  const [bookTab, setBookTab] = useState<OrderBookTab>("open");
  const [bookSide, setBookSide] = useState<OrderBookSide>("buy");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { control, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(PlaceOrderSchema),
    defaultValues: {
      propertyId: property.id,
      side: "Buy",
      type: "Market",
      units: 3,
      pricePerUnit: marketPriceUsd,
      asset: "RLUSD",
    },
    mode: "onChange",
  });

  const values = watch();

  const xrpl = useXrpl();
  const orderAction = useAction(placeOrder, {
    onSuccess: () => {
      setConfirmOpen(false);
      reset({
        propertyId: property.id,
        side: "Buy",
        type: "Market",
        units: 0,
        pricePerUnit: marketPriceUsd,
        asset: "RLUSD",
      });
    },
  });

  const totalNumber = useMemo(() => {
    const unitPrice = Number(
      values.type === "Market" ? marketPriceUsd : (values.pricePerUnit ?? "0"),
    );
    return Number.isFinite(unitPrice) ? unitPrice * (values.units ?? 0) : 0;
  }, [marketPriceUsd, values.pricePerUnit, values.type, values.units]);

  const totalFormatted = fmtPriceUsd(totalNumber);

  const chartData = useMemo(
    () =>
      mockCandles.slice(0, 6).map((c: Candle) => ({
        x: new Date(c.t).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        y: Number(c.c),
      })),
    [],
  );

  const bookRows = useMemo(
    () => (bookTab === "open" ? bookLevelsToRows(mockOrderBook.bids, mockOrderBook.asks) : []),
    [bookTab],
  );

  const submitToConfirm = handleSubmit(() => {
    setConfirmOpen(true);
  });

  const onConfirm = async (): Promise<void> => {
    let signedTxBlob: string | undefined;
    if (xrpl.available) {
      try {
        const params = await buildOfferCreateParams({
          propertyId: values.propertyId,
          side: values.side,
          type: values.type,
          units: values.units,
          pricePerUnit: values.pricePerUnit,
          asset: values.asset,
          // Account is resolved server-side from session if needed; the hook
          // signs against the embedded Privy wallet so we pass empty here.
          account: "",
        });
        const signed = await xrpl.signOfferCreate(params);
        if (signed) signedTxBlob = signed.tx_blob;
      } catch (err) {
        // Fall through — server will persist as Pending.
        console.warn("[trading] xrpl sign failed:", (err as Error)?.message);
      }
    }
    orderAction.execute({
      propertyId: values.propertyId,
      side: values.side,
      type: values.type,
      units: values.units,
      pricePerUnit: values.type === "Limit" ? values.pricePerUnit : undefined,
      asset: values.asset,
      ...(signedTxBlob ? { signedTxBlob } : {}),
    });
  };

  const chart = (
    <ChartPanel
      variant="trading"
      tabs={[
        { label: "Price", value: "price" },
        { label: "Yield", value: "yield" },
      ]}
      activeTab={chartTab}
      onTabChange={(v) => setChartTab(v as ChartTab)}
      timeframes={[
        { label: "All", value: "all" },
        { label: "3M", value: "3m" },
        { label: "6M", value: "6m" },
        { label: "1Y", value: "1y" },
      ]}
      activeTimeframe={chartTf}
      onTimeframeChange={(v) => setChartTf(v as ChartTimeframe)}
      data={chartData}
    />
  );

  const orderBook =
    bookTab === "open" ? (
      <OrderBookTable
        activeTab={bookTab}
        onTabChange={setBookTab}
        side={bookSide}
        onSideChange={setBookSide}
        rows={bookRows}
      />
    ) : (
      <div className="space-y-4">
        <OrderBookTable
          activeTab={bookTab}
          onTabChange={setBookTab}
          side={bookSide}
          onSideChange={setBookSide}
          rows={[]}
        />
        <EmptyState
          title={bookTab === "filled" ? "No filled orders yet" : "No trade history yet"}
          description="Orders you submit will appear here once they are matched on-chain."
        />
      </div>
    );

  const ticket = (
    <Controller
      control={control}
      name="side"
      render={({ field: sideField }) => (
        <Controller
          control={control}
          name="type"
          render={({ field: typeField }) => (
            <Controller
              control={control}
              name="units"
              render={({ field: unitsField }) => (
                <Controller
                  control={control}
                  name="pricePerUnit"
                  render={({ field: priceField }) => (
                    <Controller
                      control={control}
                      name="asset"
                      render={({ field: assetField }) => (
                        <BuySellTicket
                          side={sideField.value === "Buy" ? "buy" : "sell"}
                          onSideChange={(s) => sideField.onChange(s === "buy" ? "Buy" : "Sell")}
                          orderType={typeField.value === "Market" ? "market" : "limit"}
                          onOrderTypeChange={(t) => {
                            typeField.onChange(t === "market" ? "Market" : "Limit");
                            if (t === "market") {
                              setValue("pricePerUnit", marketPriceUsd);
                            }
                          }}
                          units={unitsField.value}
                          onUnitsChange={(n) => unitsField.onChange(n)}
                          pricePerUnit={priceField.value ?? ""}
                          onPricePerUnitChange={(p) => priceField.onChange(p)}
                          marketPrice={marketPriceUsd}
                          total={totalFormatted}
                          availableBalance={availableBalance}
                          selectedAsset={assetField.value}
                          onAssetChange={(a) => assetField.onChange(a)}
                          onSubmit={() => void submitToConfirm()}
                          loading={orderAction.status === "executing"}
                        />
                      )}
                    />
                  )}
                />
              )}
            />
          )}
        />
      )}
    />
  );

  return (
    <>
      <TradingPageLayout
        back={
          <Button variant="ghost" size="sm" onClick={() => router.push("/marketplace")}>
            Go back
          </Button>
        }
        assetHeader={assetHeader}
        chart={chart}
        orderBook={orderBook}
        ticket={ticket}
      />

      <ConfirmOrderModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        side={values.side === "Buy" ? "buy" : "sell"}
        property={{
          name: property.name,
          locationCity: property.locationCity,
          locationRegion: property.locationRegion,
          roiAnnualPct: property.roiAnnualPct,
        }}
        orderType={values.type === "Market" ? "market" : "limit"}
        units={values.units}
        pricePerUnit={values.type === "Market" ? marketPriceUsd : (values.pricePerUnit ?? "0")}
        selectedAsset={values.asset}
        total={totalFormatted}
        onConfirm={() => {
          void onConfirm();
        }}
        loading={orderAction.status === "executing"}
      />
    </>
  );
}
