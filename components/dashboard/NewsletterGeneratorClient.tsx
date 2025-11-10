"use client";

import { NewsletterForm } from "@/components/dashboard/NewsletterForm";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Feed {
  id: string;
  title: string | null;
  url: string;
}

interface NewsletterGeneratorClientProps {
  feeds: Feed[];
}

export function NewsletterGeneratorClient({
  feeds,
}: NewsletterGeneratorClientProps) {
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

