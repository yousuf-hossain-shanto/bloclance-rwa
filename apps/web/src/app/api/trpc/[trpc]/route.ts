import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    onError({ path, error }) {
      if (process.env.NODE_ENV !== "production") {
        console.error(`tRPC error on ${path ?? "<unknown>"}:`, error);
      }
    },
  });
}

export { handler as GET, handler as POST };
