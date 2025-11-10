"use client";

import { UserProfile } from "@clerk/nextjs";

export function ClerkUserProfile() {
  return (
    <UserProfile
      routing="hash"
      appearance={{
        elements: {
          rootBox: {
            width: "100%",
          },
          card: {
            boxShadow: "none",
            border: "1px solid hsl(var(--border))",
          },
        },
      }}
    />
  );
}

