import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { has } = await auth();
  const hasPaidPlan =
    (await has({ plan: "pro" })) || (await has({ plan: "starter" }));

  if (!hasPaidPlan) {
    return redirect("/#pricing");
  }
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      {children}
    </div>
  );
}
