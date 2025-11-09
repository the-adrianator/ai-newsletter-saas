import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserSettingsByUserId } from "@/actions/user-settings";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  buildArticleSummaries,
  buildNewsletterPrompt,
} from "@/lib/newsletter/prompt-builder";
import { prepareFeedsAndArticles } from "@/lib/rss/feed-refresh";

export const maxDuration = 300; // 5 minutes for Vercel Pro

/**
 * Newsletter generation result schema
 */
const NewsletterSchema = z.object({
  suggestedTitles: z.array(z.string()).length(5),
  suggestedSubjectLines: z.array(z.string()).length(5),
  body: z.string(),
  topAnnouncements: z.array(z.string()).length(5),
  additionalInfo: z.string().optional(),
});

/**
 * POST /api/newsletter/generate-stream
 *
 * Streams newsletter generation in real-time using Vercel AI SDK.
 * The AI SDK handles all streaming complexity automatically.
 *
 * @returns AI SDK text stream response
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { feedIds, startDate, endDate, userInput } = body;

    // Validate required parameters
    if (!feedIds || !Array.isArray(feedIds) || feedIds.length === 0) {
      return NextResponse.json(
        { error: "feedIds is required and must be a non-empty array" },
        { status: 400 },
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 },
      );
    }

    // Validate date strings can be parsed into valid Date objects
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (Number.isNaN(parsedStartDate.getTime())) {
      return NextResponse.json(
        { error: "startDate is not a valid date" },
        { status: 400 },
      );
    }

    if (Number.isNaN(parsedEndDate.getTime())) {
      return NextResponse.json(
        { error: "endDate is not a valid date" },
        { status: 400 },
      );
    }

    // Get authenticated user and settings
    const user = await getCurrentUser();
    const settings = await getUserSettingsByUserId(user.id);

    // Fetch and prepare articles with ownership validation
    const articles = await prepareFeedsAndArticles({
      userId: user.id,
      feedIds,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    });

    // Build the AI prompt
    const articleSummaries = buildArticleSummaries(articles);
    const prompt = buildNewsletterPrompt({
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      articleSummaries,
      articleCount: articles.length,
      userInput,
      settings,
    });

    // Stream newsletter generation with AI SDK
    const result = streamObject({
      model: openai("gpt-4o"),
      schema: NewsletterSchema,
      prompt,
      onFinish: async () => {
        // Optional: Add any post-generation logic here
      },
    });

    // Return AI SDK's native stream response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error in generate-stream:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: `Failed to generate newsletter: ${errorMessage}` },
      { status: 500 },
    );
  }
}