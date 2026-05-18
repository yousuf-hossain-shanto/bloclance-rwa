import { getSessionUser } from "@/server/auth";
import type { User as PrismaUser } from "@surgexrp/db";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export type SessionUser = PrismaUser;

export const baseActionClient = createSafeActionClient({
  defineMetadataSchema: () => z.object({ actionName: z.string() }),
  handleServerError: (e) => {
    if (e instanceof ActionError) return e.message;
    console.error("safe-action server error", e);
    return "Something went wrong. Please try again.";
  },
});

/**
 * Requires a signed-in Privy session bridged to a Prisma `User` row.
 * Throws `ActionError("UNAUTHORIZED")` if no session — the client surfaces
 * this by redirecting to the login modal.
 */
export const authActionClient = baseActionClient.use(async ({ next }) => {
  const user = await getSessionUser();
  if (!user) throw new ActionError("UNAUTHORIZED");
  return next({ ctx: { user } });
});

/**
 * Extends `authActionClient` with a KYC gate. Throws
 * `ActionError("KYC_REQUIRED")` when the user has not finished Sumsub; the
 * client KYC modal catches this and triggers the Sumsub flow.
 */
export const kycActionClient = authActionClient.use(async ({ ctx, next }) => {
  if (ctx.user.kycStatus !== "Verified") {
    throw new ActionError("KYC_REQUIRED");
  }
  return next({ ctx });
});

export { ActionError };
