import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getRssFeedsByUserId } from "@/actions/rss-feed";
import { upsertUserFromClerk } from "@/actions/user";
import { NewsletterForm } from "@/components/dashboard/NewsletterForm";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export async function NewsletterGenerator() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await upsertUserFromClerk(userId);
  const feeds = await getRssFeedsByUserId(user.id);

  if (feeds.length === 0) {
    return (
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Generate Newsletter</CardTitle>
          <CardDescription className="text-base">
            Add RSS feeds first to generate newsletters
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <NewsletterForm
      feeds={feeds.map((f) => ({
        id: f.id,
        title: f.title,
        url: f.url,
      }))}
    />
  );
}
