import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

interface SessionUser {
  id: string;
  email: string;
  xrpAddress: string;
  kycStatus: "NotVerified" | "Pending" | "Verified";
}

/** Stub session loader — wire to Privy in M1. */
async function getSessionUser(): Promise<SessionUser | null> {
  return null;
}

export const baseActionClient = createSafeActionClient({
  defineMetadataSchema: () => z.object({ actionName: z.string() }),
  handleServerError: (e) => {
    if (e instanceof ActionError) return e.message;
    console.error("safe-action server error", e);
    return "Something went wrong. Please try again.";
  },
});

export const authActionClient = baseActionClient.use(async ({ next }) => {
  const user = await getSessionUser();
  if (!user) throw new ActionError("Sign in required");
  return next({ ctx: { user } });
});

export const kycActionClient = authActionClient.use(async ({ ctx, next }) => {
  if (ctx.user.kycStatus !== "Verified") {
    throw new ActionError("KYC verification required");
  }
  return next({ ctx });
});

export { ActionError };
