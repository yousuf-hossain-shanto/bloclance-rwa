"use server";

import { prisma } from "@surgexrp/db";
import { UpdateProfileSchema } from "@surgexrp/shared";
import { put } from "@vercel/blob";
import { z } from "zod";
import { ActionError, authActionClient } from "./safe-action";

export const updateProfile = authActionClient
  .metadata({ actionName: "updateProfile" })
  .schema(UpdateProfileSchema)
  .action(async ({ parsedInput, ctx }) => {
    const user = await prisma.user.update({
      where: { id: ctx.user.id },
      data: {
        displayName: parsedInput.displayName ?? null,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        kycStatus: true,
        xrpAddress: true,
        autoReinvest: true,
      },
    });
    return { user };
  });

const UploadAvatarSchema = z.object({
  file: z.instanceof(File, { message: "Avatar file is required" }),
});

export const uploadAvatar = authActionClient
  .metadata({ actionName: "uploadAvatar" })
  .schema(UploadAvatarSchema)
  .action(async ({ parsedInput, ctx }) => {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new ActionError("Avatar upload is not configured");
    }

    const { file } = parsedInput;
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const pathname = `avatars/${ctx.user.id}-${Date.now()}.${ext}`;

    const blob = await put(pathname, file, {
      access: "public",
      token,
      contentType: file.type || undefined,
    });

    const user = await prisma.user.update({
      where: { id: ctx.user.id },
      data: { avatarUrl: blob.url },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        kycStatus: true,
        xrpAddress: true,
        autoReinvest: true,
      },
    });

    return { user, url: blob.url };
  });
