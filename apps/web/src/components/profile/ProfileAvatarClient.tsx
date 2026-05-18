"use client";

import { Avatar, Button } from "@surgexrp/ui";
import type { ReactElement } from "react";

export interface ProfileAvatarClientProps {
  name: string;
  src?: string;
}

/**
 * Avatar + "Change Profile Picture" CTA. Click handler is a stub —
 * real upload wiring (Vercel Blob + native file picker portal) lands
 * in M1 via the `uploadAvatar` action. We deliberately do not inline
 * a raw `<input type="file">` here: per `packages/ui/README.md` no bare
 * inputs in pages; file-picker support gets added to the UI library
 * once needed.
 */
export function ProfileAvatarClient({ name, src }: ProfileAvatarClientProps): ReactElement {
  return (
    <>
      <Avatar size="lg" name={name} src={src} />
      <Button variant="ghost" size="sm" onClick={() => undefined}>
        Change Profile Picture
      </Button>
    </>
  );
}
