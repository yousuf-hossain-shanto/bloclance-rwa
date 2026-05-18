import { getSessionUser } from "@/server/auth";
import { prisma } from "@surgexrp/db";
import type { PrismaClient, User as PrismaUser } from "@surgexrp/db";
import { TRPCError, initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";

export type SessionUser = PrismaUser;

export interface TrpcContext {
  db: PrismaClient;
  user: SessionUser | null;
  /** Browser request headers, used to bridge session cookies. */
  reqHeaders: Headers;
}

/**
 * Wrapped in React `cache` so a single context is reused across the prefetch
 * tree on the server. Reads the Privy session from the request and upserts the
 * Prisma `User` row on first sign-in (see `@/server/auth`).
 */
export const createTRPCContext = cache(async (opts: { req: Request }): Promise<TrpcContext> => {
  const user = await getSessionUser(opts.req);
  return {
    db: prisma,
    user,
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
    throw new TRPCError({ code: "FORBIDDEN", message: "KYC_REQUIRED" });
  }
  return next({ ctx });
});
