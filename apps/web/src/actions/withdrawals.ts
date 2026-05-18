"use server";

import { SubmitWithdrawalSchema } from "@surgexrp/shared";
import { kycActionClient } from "./safe-action";

export const submitWithdrawal = kycActionClient
  .metadata({ actionName: "submitWithdrawal" })
  .schema(SubmitWithdrawalSchema)
  .action(async ({ parsedInput }) => {
    return {
      ok: true as const,
      withdrawalId: "00000000-0000-0000-0000-000000000000",
      txHash: "MOCK_HASH",
      input: parsedInput,
    };
  });
