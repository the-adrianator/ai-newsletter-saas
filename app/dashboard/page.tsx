import { Home } from "lucide-react";
import { NewsletterGenerator } from "@/components/dashboard/NewsletterGenerator";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RssFeedManager } from "@/components/dashboard/RSSFeedManager";

export default async function Dashboard() {
  try {
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
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {error instanceof Error ? error.message : "An unknown error occurred"}
          </p>
          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
            {error instanceof Error ? error.stack : String(error)}
          </pre>
        </div>
      </div>
    );
  }
}
