import "server-only";

import type { AuthTokenClaims, User as PrivyUser } from "@privy-io/server-auth";
import { type User as PrismaUser, prisma } from "@surgexrp/db";
import { cookies, headers } from "next/headers";
import { cache } from "react";

/**
 * Privy session bridge.
 *
 * - {@link getPrivyClaims} verifies the Privy auth token from the incoming
 *   request (cookie `privy-token` or `Authorization: Bearer …` header).
 * - {@link getPrivyUser} fetches the full Privy user object for those claims.
 * - {@link getOrCreateUser} upserts the Prisma `User` row keyed off
 *   `privyUserId`, bumps `lastLoginAt`, and returns it.
 * - {@link getSessionUser} composes all of the above for App Router code paths.
 *
 * Each helper is wrapped in React `cache()` so a single request only verifies
 * once even when called from tRPC ctx, server actions, and RSCs in parallel.
 */

const PRIVY_TOKEN_COOKIE = "privy-token";

let _privyClient: import("@privy-io/server-auth").PrivyClient | null = null;

/**
 * Lazy-load `@privy-io/server-auth` so we don't drag node-only deps into edge
 * routes or client bundles. Returns `null` if env vars are missing — the rest
 * of the stack treats this as "no session" rather than crashing.
 */
async function getPrivyClient(): Promise<import("@privy-io/server-auth").PrivyClient | null> {
  if (_privyClient) return _privyClient;
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  if (!appId || !appSecret) return null;
  const { PrivyClient } = await import("@privy-io/server-auth");
  _privyClient = new PrivyClient(appId, appSecret);
  return _privyClient;
}

function extractToken(req?: Request): string | null {
  // 1. Explicit Request (fetchRequestHandler, route handlers)
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.toLowerCase().startsWith("bearer ")) {
      return authHeader.slice(7).trim() || null;
    }
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      for (const part of cookieHeader.split(";")) {
        const [k, ...v] = part.trim().split("=");
        if (k === PRIVY_TOKEN_COOKIE) return decodeURIComponent(v.join("=")) || null;
      }
    }
  }
  return null;
}

/**
 * Read & verify the Privy auth token for the current request.
 *
 * Returns null when:
 *   - no token is present
 *   - the verifier rejects the token (expired / forged)
 *   - PRIVY_APP_SECRET is not configured (dev fallback)
 */
export const getPrivyClaims = cache(async (req?: Request): Promise<AuthTokenClaims | null> => {
  let token = extractToken(req);

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(PRIVY_TOKEN_COOKIE)?.value ?? null;
    } catch {
      // cookies() throws outside a request scope — fine for tests.
    }
  }

  if (!token) {
    try {
      const h = await headers();
      const authHeader = h.get("authorization");
      if (authHeader?.toLowerCase().startsWith("bearer ")) {
        token = authHeader.slice(7).trim() || null;
      }
    } catch {
      // headers() also throws outside a request scope.
    }
  }

  if (!token) return null;

  const client = await getPrivyClient();
  if (!client) return null;

  try {
    return await client.verifyAuthToken(token);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[auth] verifyAuthToken failed:", (err as Error)?.message);
    }
    return null;
  }
});

/** Fetch the full Privy user object for the current request. */
export const getPrivyUser = cache(async (req?: Request): Promise<PrivyUser | null> => {
  const claims = await getPrivyClaims(req);
  if (!claims) return null;
  const client = await getPrivyClient();
  if (!client) return null;
  try {
    return await client.getUserById(claims.userId);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[auth] getUserById failed:", (err as Error)?.message);
    }
    return null;
  }
});

type LinkedAccountLite = {
  type?: string;
  address?: string;
  chainType?: string;
};

function pickXrpAddress(privyUser: PrivyUser): string | null {
  // Privy XRPL embedded wallets surface with chainType === 'xrpl' in linkedAccounts.
  // We fall back to `wallet` (most-recently linked) if no XRPL-specific match.
  const accounts = (privyUser.linkedAccounts ?? []) as LinkedAccountLite[];
  for (const acct of accounts) {
    if (acct?.type === "wallet" && typeof acct.address === "string") {
      const chain = String(acct.chainType ?? "").toLowerCase();
      if (chain === "xrpl" || chain === "xrp") return acct.address;
    }
  }
  if (privyUser.wallet?.address) return privyUser.wallet.address;
  return null;
}

/**
 * Upsert the Prisma `User` row for this Privy user.
 *
 * Strategy: match on `privyUserId` first; if the row was previously created
 * (e.g. via seed) with an email match, we link the privyUserId at that point.
 * `xrpAddress` is required & unique in the schema, so until Privy has minted
 * an XRPL wallet we synthesize a placeholder `privy:{id}` value the issuer
 * code can recognize and overwrite later.
 */
export const getOrCreateUser = cache(async (privyUser: PrivyUser): Promise<PrismaUser> => {
  const email = privyUser.email?.address ?? null;
  const xrpAddress = pickXrpAddress(privyUser) ?? `privy:${privyUser.id}`;
  const now = new Date();

  const existingByPrivy = await prisma.user.findUnique({
    where: { privyUserId: privyUser.id },
  });
  if (existingByPrivy) {
    return prisma.user.update({
      where: { id: existingByPrivy.id },
      data: {
        lastLoginAt: now,
        // Backfill these if Privy now reports them and we previously didn't have them.
        ...(email && existingByPrivy.email !== email ? { email } : {}),
        ...(xrpAddress &&
        existingByPrivy.xrpAddress.startsWith("privy:") &&
        !xrpAddress.startsWith("privy:")
          ? { xrpAddress }
          : {}),
      },
    });
  }

  if (email) {
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      return prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          privyUserId: privyUser.id,
          lastLoginAt: now,
          ...(xrpAddress &&
          existingByEmail.xrpAddress.startsWith("privy:") &&
          !xrpAddress.startsWith("privy:")
            ? { xrpAddress }
            : {}),
        },
      });
    }
  }

  return prisma.user.create({
    data: {
      privyUserId: privyUser.id,
      email: email ?? `${privyUser.id}@privy.placeholder`,
      xrpAddress,
      lastLoginAt: now,
    },
  });
});

/** Compose `getPrivyUser` + `getOrCreateUser` — returns null if not signed in. */
export const getSessionUser = cache(async (req?: Request): Promise<PrismaUser | null> => {
  const privyUser = await getPrivyUser(req);
  if (!privyUser) return null;
  return getOrCreateUser(privyUser);
});
