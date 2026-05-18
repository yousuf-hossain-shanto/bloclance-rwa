"use client";

import { updateProfile } from "@/actions/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { type UpdateProfileInput, UpdateProfileSchema } from "@surgexrp/shared";
import { Button, TextField } from "@surgexrp/ui";
import { useAction } from "next-safe-action/hooks";
import type { ReactElement } from "react";
import { type Resolver, useForm } from "react-hook-form";

export interface ProfileDetailsClientProps {
  /** Auth-bound email from the session — read-only on this screen. */
  email: string;
  /** Initial display name pulled from the profile record. */
  initialDisplayName?: string;
}

/**
 * "Your Details" form on Profile — Display Name (RHF + zod) + the
 * read-only Email Address pulled from auth. Submit goes through the
 * `updateProfile` next-safe-action.
 */
export function ProfileDetailsClient({
  email,
  initialDisplayName,
}: ProfileDetailsClientProps): ReactElement {
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema) as Resolver<UpdateProfileInput>,
    defaultValues: { displayName: initialDisplayName ?? "" },
  });

  const { execute, status } = useAction(updateProfile);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit((values) => execute(values))}>
      <TextField
        label="Display Name"
        placeholder="Enter a display name"
        errorText={form.formState.errors.displayName?.message}
        {...form.register("displayName")}
      />
      <TextField label="Email Address" readOnly value={email} />
      <div className="pt-2">
        <Button type="submit" variant="primary" size="md" loading={status === "executing"}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
