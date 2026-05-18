import { z } from "zod";

export const UpdateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(120).optional(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const ToggleAutoReinvestSchema = z.object({
  enabled: z.boolean(),
});
export type ToggleAutoReinvestInput = z.infer<typeof ToggleAutoReinvestSchema>;
