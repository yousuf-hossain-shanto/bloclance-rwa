"use server";

import { authActionClient } from "./safe-action";

export const startKyc = authActionClient.metadata({ actionName: "startKyc" }).action(async () => {
  // TODO: call Sumsub server SDK to create applicant + access token
  return { ok: true as const, accessToken: "MOCK_SUMSUB_TOKEN" };
});
