"use server";

import { ToggleAutoReinvestSchema } from "@surgexrp/shared";
import { authActionClient } from "./safe-action";

export const toggleAutoReinvest = authActionClient
  .metadata({ actionName: "toggleAutoReinvest" })
  .schema(ToggleAutoReinvestSchema)
  .action(async ({ parsedInput }) => {
    return { ok: true as const, enabled: parsedInput.enabled };
  });
