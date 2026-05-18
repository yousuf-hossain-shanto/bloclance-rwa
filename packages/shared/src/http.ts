// Server-side HTTP client for outbound calls (xrplcluster, Sumsub, Resend, Privy).
// Never imported by client code.
import xior from "xior";

export const http = xior.create({
  timeout: 15_000,
  headers: { "content-type": "application/json" },
});

/** Pre-configured client for the XRPL public RPC. */
export const xrplHttp = xior.create({
  baseURL: process.env.XRPL_ENDPOINT ?? "https://xrplcluster.com",
  timeout: 10_000,
  headers: { "content-type": "application/json" },
});
