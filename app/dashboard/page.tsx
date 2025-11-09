import { Home } from "lucide-react";
import { NewsletterGenerator } from "@/components/dashboard/NewsletterGenerator";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RssFeedManager } from "@/components/dashboard/RSSFeedManager";

export default function Dashboard() {
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
          <RssFeedManager />

          {/* Right Column - Newsletter Generator */}
          <NewsletterGenerator />
        </div>
      </div>
    </div>
  );
}
