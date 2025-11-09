import { getArticlesByFeedsAndDateRange } from "@/actions/rss-article";
import { validateFeedOwnership } from "@/actions/rss-feed";
import { fetchAndStoreFeed } from "@/actions/rss-fetch";
import { prisma } from "@/lib/prisma";
import type { PrepareFeedsParams } from "@/lib/rss/types";

// ============================================
// FEED REFRESH UTILITIES
// ============================================

/**
 * Cache window for RSS feeds (3 hours in milliseconds)
 *
 * Why 3 hours? This balances:
 * - Fresh content for users
 * - Reduced load on RSS feed servers
 * - Better performance (fewer network requests)
 */
export const CACHE_WINDOW = 3 * 60 * 60 * 1000; // 3 hours

/**
 * Maximum number of articles to fetch for newsletter generation
 *
 * Limits the number of articles to keep AI prompts manageable
 * and generation times reasonable
 */
export const ARTICLE_LIMIT = 100;

/**
 * Determines which feeds need refreshing (older than 3 hours)
 *
 * This function uses a global cache strategy: if ANY user has recently
 * fetched a feed URL, we use that cached data for all users. This:
 * - Reduces load on external RSS servers
 * - Improves performance across the platform
 * - Keeps data reasonably fresh for everyone
 *
 * @param feedIds - Array of feed IDs to check
 * @param userId - User ID to validate feed ownership
 * @returns Array of feed IDs that need refreshing
 * @throws Error if any feed doesn't belong to the user
 */
export async function getFeedsToRefresh(
  feedIds: string[],
  userId: string,
): Promise<string[]> {
  // Validate that all feed IDs belong to the user
  const validatedFeedIds = await validateFeedOwnership(feedIds, userId);

  const now = new Date();
  const cacheThreshold = new Date(now.getTime() - CACHE_WINDOW);

  // Get all requested feeds with their URLs
  const feeds = await prisma.rssFeed.findMany({
    where: {
      id: { in: validatedFeedIds },
      userId, // Double-check ownership at database layer
    },
    select: {
      id: true,
      url: true,
    },
  });

  // Get the most recent fetch time for each unique URL
  // This is done in a single query using aggregation
  const urlsToCheck = [...new Set(feeds.map((f) => f.url))];

  const recentFetches = await prisma.rssFeed.groupBy({
    by: ["url"],
    where: {
      url: { in: urlsToCheck },
      lastFetched: {
        gte: cacheThreshold,
      },
    },
    _max: {
      lastFetched: true,
    },
  });

  // Build a set of URLs that were recently fetched (don't need refresh)
  const recentlyFetchedUrls = new Set(
    recentFetches
      .filter((fetch) => fetch._max.lastFetched !== null)
      .map((fetch) => fetch.url),
  );

  // Feeds need refresh if their URL is NOT in the recently fetched set
  const feedsToRefresh = feeds
    .filter((feed) => !recentlyFetchedUrls.has(feed.url))
    .map((feed) => feed.id);

  return feedsToRefresh;
}

/**
 * Prepares feeds and fetches articles for newsletter generation
 *
 * This is the main function called when generating a newsletter. It:
 * 1. Validates feed ownership for the user
 * 2. Checks which feeds are stale (>3 hours old)
 * 3. Refreshes stale feeds by fetching new articles
 * 4. Retrieves articles from the database for the date range
 *
 * @param params - User ID, feed IDs and date range for the newsletter
 * @returns Array of articles ready for newsletter generation
 * @throws Error if no articles found in the date range or unauthorized access
 */
export async function prepareFeedsAndArticles(params: PrepareFeedsParams) {
  // Validate feed ownership before proceeding
  const validatedFeedIds = await validateFeedOwnership(
    params.feedIds,
    params.userId,
  );

  // Check which feeds need refreshing (skips fresh feeds)
  const feedsToRefresh = await getFeedsToRefresh(
    validatedFeedIds,
    params.userId,
  );

  if (feedsToRefresh.length > 0) {
    console.log(
      `Refreshing ${feedsToRefresh.length} stale feeds (out of ${validatedFeedIds.length} total)...`,
    );

    // Refresh all stale feeds in parallel for better performance
    // Using Promise.allSettled so one failure doesn't stop others
    const refreshResults = await Promise.allSettled(
      feedsToRefresh.map((feedId) => fetchAndStoreFeed(feedId)),
    );

    // Log results for monitoring
    const successful = refreshResults.filter(
      (r) => r.status === "fulfilled",
    ).length;
    const failed = refreshResults.filter((r) => r.status === "rejected").length;
    console.log(
      `Feed refresh complete: ${successful} successful, ${failed} failed`,
    );
  } else {
    console.log(
      `All ${validatedFeedIds.length} feeds are fresh (< 3 hours old), skipping refresh`,
    );
  }

  // Fetch articles from the database within the specified date range
  // Use validated feed IDs to ensure we only get articles from user's feeds
  const articles = await getArticlesByFeedsAndDateRange(
    validatedFeedIds,
    params.startDate,
    params.endDate,
    ARTICLE_LIMIT,
  );

  // Ensure we have articles to work with
  if (articles.length === 0) {
    throw new Error("No articles found for the selected feeds and date range");
  }

  return articles;
}