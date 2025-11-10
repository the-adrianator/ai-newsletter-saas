import { auth } from "@clerk/nextjs/server";
import { Home } from "lucide-react";
import { getRssFeedsByUserId } from "@/actions/rss-feed";
import { upsertUserFromClerk } from "@/actions/user";
import { NewsletterGeneratorClient } from "@/components/dashboard/NewsletterGeneratorClient";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RssFeedManagerClient } from "@/components/dashboard/RSSFeedManagerClient";

export default async function Dashboard() {
  const { userId, has } = await auth();

  if (!userId) {
    return null;
  }

  const isPro = await has({ plan: "pro" });
  const user = await upsertUserFromClerk(userId);
  const feeds = await getRssFeedsByUserId(user.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      <div className="container mx-auto px-6 py-12 lg:px-8 space-y-12">
        {/* Page Header */}
        <PageHeader
          icon={Home}
          title="Dashboard"
          description="Manage your RSS feeds and generate AI-powered newsletters"
        />

        {/* Main Content - Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - RSS Feed Manager */}
          <RssFeedManagerClient feeds={feeds} isPro={isPro} />

          {/* Right Column - Newsletter Generator */}
          <NewsletterGeneratorClient feeds={feeds} />
        </div>
      </div>
    </div>
  );
}
