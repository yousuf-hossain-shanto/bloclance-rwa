import { createTRPCRouter } from "../init";
import { authRouter } from "./auth";
import { ordersRouter } from "./orders";
import { portfolioRouter } from "./portfolio";
import { propertiesRouter } from "./properties";
import { purchasesRouter } from "./purchases";
import { txRouter } from "./tx";
import { walletsRouter } from "./wallets";
import { withdrawalsRouter } from "./withdrawals";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  properties: propertiesRouter,
  portfolio: portfolioRouter,
  orders: ordersRouter,
  purchases: purchasesRouter,
  withdrawals: withdrawalsRouter,
  wallets: walletsRouter,
  tx: txRouter,
});

export type AppRouter = typeof appRouter;
