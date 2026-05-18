import { TRPCError, initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";

export interface SessionUser {
  id: string;
  email: string;
  xrpAddress: string;
  kycStatus: "NotVerified" | "Pending" | "Verified";
}

export interface TrpcContext {
  user: SessionUser | null;
  /** Browser request headers, used to bridge session cookies. */
  reqHeaders: Headers;
}

/**
 * Wrapped in React `cache` so a single context is reused across the prefetch
 * tree on the server. Wire to Privy session here in M1.
 */
export const createTRPCContext = cache(async (opts: { req: Request }): Promise<TrpcContext> => {
  return {
    user: null,
    reqHeaders: opts.req.headers,
  };
});

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign in required" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const kycProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.kycStatus !== "Verified") {
    throw new TRPCError({ code: "FORBIDDEN", message: "KYC verification required" });
  }
  return next({ ctx });
});
