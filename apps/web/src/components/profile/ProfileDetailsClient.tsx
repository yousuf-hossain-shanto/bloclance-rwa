"use client";

import { updateProfile } from "@/actions/profile";
import { toggleAutoReinvest } from "@/actions/settings";
import { useActionToast } from "@/hooks/use-action-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { type UpdateProfileInput, UpdateProfileSchema } from "@surgexrp/shared";
import { Button, NoticeBanner, TextField } from "@surgexrp/ui";
import { useAction } from "next-safe-action/hooks";
import { type ReactElement, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";

export interface ProfileDetailsClientProps {
  /** Auth-bound email from the session — read-only on this screen. */
  email: string;
  /** Initial display name pulled from the profile record. */
  initialDisplayName?: string;
  /** Initial auto-reinvest preference pulled from the user record. */
  initialAutoReinvest?: boolean;
}

/**
 * "Your Details" form on Profile — Display Name (RHF + zod) + the
 * read-only Email Address pulled from auth. Submit goes through the
 * `updateProfile` next-safe-action. Also owns the optimistic auto-reinvest
 * toggle.
 */
export function ProfileDetailsClient({
  email,
  initialDisplayName,
  initialAutoReinvest = false,
}: ProfileDetailsClientProps): ReactElement {
  const { showError, showSuccess } = useActionToast();
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema) as Resolver<UpdateProfileInput>,
    defaultValues: { displayName: initialDisplayName ?? "" },
  });

  // Inline form-level error surface for field-related failures.
  const [serverErrorText, setServerErrorText] = useState<string | undefined>(undefined);

  const { execute, status } = useAction(updateProfile, {
    onSuccess: () => {
      setServerErrorText(undefined);
      showSuccess("Profile updated");
    },
    onError: ({ error }) => {
      const message = error.serverError ?? "Couldn't save your profile.";
      setServerErrorText(message);
      showError(message);
    },
  });

  // Optimistic auto-reinvest: flip local state immediately, revert on error.
  const [autoReinvest, setAutoReinvest] = useState<boolean>(initialAutoReinvest);
  const reinvestAction = useAction(toggleAutoReinvest, {
    onSuccess: ({ data }) => {
      if (data?.user) setAutoReinvest(data.user.autoReinvest);
      showSuccess("Auto-reinvest preference saved");
    },
    onError: ({ error, input }) => {
      // Revert optimistic flip.
      setAutoReinvest(!input.enabled);
      showError(error.serverError ?? "Couldn't update auto-reinvest.");
    },
  });

  function handleAutoReinvestToggle(): void {
    const next = !autoReinvest;
    setAutoReinvest(next); // optimistic
    reinvestAction.execute({ enabled: next });
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit((values) => execute(values))}>
      {serverErrorText && <NoticeBanner tone="error">{serverErrorText}</NoticeBanner>}
      <TextField
        label="Display Name"
        placeholder="Enter a display name"
        errorText={form.formState.errors.displayName?.message}
        {...form.register("displayName")}
      />
      <TextField label="Email Address" readOnly value={email} />

      <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">Auto-reinvest earnings</p>
          <p className="text-xs text-text-muted">
            Automatically reinvest rental yield back into your holdings.
          </p>
        </div>
        <Button
          type="button"
          variant={autoReinvest ? "primary" : "secondary"}
          size="sm"
          onClick={handleAutoReinvestToggle}
          loading={reinvestAction.status === "executing"}
        >
          {autoReinvest ? "On" : "Off"}
        </Button>
      </div>

      <div className="pt-2">
        <Button type="submit" variant="primary" size="md" loading={status === "executing"}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
