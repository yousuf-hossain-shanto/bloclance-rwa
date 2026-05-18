"use client";

import { type FormEvent, type ReactElement, useState } from "react";
import { ModalShell } from "../layouts/modal-shell";
import { Button } from "./button";
import { TextField } from "./text-field";

export interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void | Promise<void>;
  loading?: boolean;
  errorText?: string;
}

export function AuthModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  errorText,
}: AuthModalProps): ReactElement {
  const [email, setEmail] = useState("");

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    await onSubmit(email);
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Log in or Sign up"
      subtitle="Provide your details below to authenticate"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          errorText={errorText}
          autoFocus
          required
        />
        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Continue
        </Button>
        <p className="text-xs text-text-subtle">
          By clicking on continue, you agree to our{" "}
          <span className="font-semibold text-white">user terms</span> and{" "}
          <span className="font-semibold text-white">agreement</span>
        </p>
      </form>
    </ModalShell>
  );
}
