"use client";

import { useAuth } from "@clerk/nextjs";
import { Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

export function PlanBadge() {
  const { isLoaded, has } = useAuth();

  if (!isLoaded) return <Spinner />;

  const isPro = has?.({ plan: "pro" });
  const isStarter = has?.({ plan: "starter" });

  return (
    <Link href="/dashboard/pricing">
      {isPro && (
        <Badge className="gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 transition-all cursor-pointer">
          <Crown className="h-3.5 w-3.5" />
          <span className="font-semibold">Pro</span>
        </Badge>
      )}

      {isStarter && (
        <Badge
          variant="secondary"
          className="gap-1.5 px-3 py-1.5 hover:bg-secondary/80 transition-all cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="font-semibold">Starter</span>
        </Badge>
      )}
    </Link>
  );
}
