"use client";

import { useAuth } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ClerkUserButton } from "@/components/providers/ClerkUserButton";
import { Button } from "@/components/ui/button";

export function CTAButtonsClient() {
  const { isLoaded, userId, has } = useAuth();

  if (!isLoaded) {
    return null;
  }

  const hasPaidPlan = has?.({ plan: "pro" }) || has?.({ plan: "starter" });

  // Signed out users
  if (!userId) {
    return (
      <>
        <Button size="lg" className="w-full sm:w-auto" asChild>
          <Link href="/sign-in?redirect_url=/#pricing">
            Get Started <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Link href="#pricing">View Pricing</Link>
        </Button>
      </>
    );
  }

  // Signed in users with a plan
  if (hasPaidPlan) {
    return (
      <Button size="lg" className="w-full sm:w-auto" asChild>
        <Link href="/dashboard" className="flex items-center justify-center">
          Go to Dashboard <ArrowRight className="ml-2 size-4" />
        </Link>
      </Button>
    );
  }

  // Signed in users without a plan
  return (
    <>
      <Button size="lg" className="w-full sm:w-auto" asChild>
        <Link href="/#pricing" className="flex items-center justify-center">
          Choose a Plan <ArrowRight className="ml-2 size-4" />
        </Link>
      </Button>
      <Button
        asChild
        size="lg"
        variant="outline"
        className="w-full sm:w-auto"
      >
        <Link href="#pricing">View Pricing</Link>
      </Button>
    </>
  );
}

