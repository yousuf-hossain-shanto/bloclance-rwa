"use server";

import { SubmitPurchaseSchema } from "@surgexrp/shared";
import { kycActionClient } from "./safe-action";

export const submitPurchase = kycActionClient
  .metadata({ actionName: "submitPurchase" })
  .schema(SubmitPurchaseSchema)
  .action(async ({ parsedInput }) => {
    // TODO: build Payment, sign via Privy on client, submit via xrplcluster
    return {
      ok: true as const,
      purchaseId: "00000000-0000-0000-0000-000000000000",
      txHash: "MOCK_HASH",
      input: parsedInput,
    };
  });
