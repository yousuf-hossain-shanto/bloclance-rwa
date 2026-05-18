"use server";

import { UpdateProfileSchema } from "@surgexrp/shared";
import { authActionClient } from "./safe-action";

export const updateProfile = authActionClient
  .metadata({ actionName: "updateProfile" })
  .schema(UpdateProfileSchema)
  .action(async ({ parsedInput }) => {
    // TODO: persist via prisma in M1
    return { ok: true as const, displayName: parsedInput.displayName ?? null };
  });

export const uploadAvatar = authActionClient
  .metadata({ actionName: "uploadAvatar" })
  .action(async () => {
    // TODO: stream to Vercel Blob in M1
    return { ok: true as const, url: null };
  });
