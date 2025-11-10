import { Suspense } from "react";
import { Home } from "lucide-react";
import { NewsletterGenerator } from "@/components/dashboard/NewsletterGenerator";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RssFeedManager } from "@/components/dashboard/RSSFeedManager";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

function LoadingCard() {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardContent className="flex items-center justify-center py-12">
        <Spinner />
      </CardContent>
    </Card>
  );
}

export default async function Dashboard() {
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
          <Suspense fallback={<LoadingCard />}>
            <RssFeedManager />
          </Suspense>

          {/* Right Column - Newsletter Generator */}
          <Suspense fallback={<LoadingCard />}>
            <NewsletterGenerator />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
