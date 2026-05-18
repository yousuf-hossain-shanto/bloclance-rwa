import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { createCallerFactory, createTRPCContext } from "./init";
import { type AppRouter, appRouter } from "./routers/_app";

const createCaller = createCallerFactory(appRouter);

/**
 * Server-side tRPC caller for Server Components / Server Actions.
 * Returns a fresh caller bound to the current request's context.
 *
 * Usage in RSC:
 *   const caller = await getServerCaller();
 *   const properties = await caller.properties.list({ page: 1, pageSize: 8 });
 */
export const getServerCaller = cache(async () => {
  const reqHeaders = await headers();
  const ctx = await createTRPCContext({
    req: new Request("http://internal", { headers: reqHeaders }),
  });
  return createCaller(ctx);
});

export type { AppRouter };
