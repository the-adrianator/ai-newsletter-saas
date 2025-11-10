"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";

export function ClerkUserButton() {
  return (
    <SignedIn>
      <div className="fixed top-4 right-4">
        <UserButton />
      </div>
    </SignedIn>
  );
}

