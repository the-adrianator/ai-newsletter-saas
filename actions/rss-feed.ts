"use server";

import { wrapDatabaseOperation } from "@/lib/database/error-handler";
import {
  FEED_ORDER_BY_CREATED_DESC,
  FEED_WITH_COUNT_INCLUDE,
} from "@/lib/database/prisma-helpers";
import { prisma } from "@/lib/prisma";

// ============================================
// RSS FEED ACTIONS
// ============================================

/**
 * Fetches all RSS feeds for a specific user with article counts
 */
export async function getRssFeedsByUserId(userId: string) {
  return wrapDatabaseOperation(async () => {
    return await prisma.rssFeed.findMany({
      where: {
        userId,
      },
      include: FEED_WITH_COUNT_INCLUDE,
      orderBy: FEED_ORDER_BY_CREATED_DESC,
    });
  }, "fetch RSS feeds");
}

/**
 * Updates the lastFetched timestamp for an RSS feed
 */
export async function updateFeedLastFetched(feedId: string) {
  return wrapDatabaseOperation(async () => {
    return await prisma.rssFeed.update({
      where: { id: feedId },
      data: {
        lastFetched: new Date(),
      },
    });
  }, "update feed last fetched");
}

/**
 * Validates and filters feed IDs to ensure they belong to the specified user
 * 
 * @param feedIds - Array of feed IDs to validate
 * @param userId - User ID to validate ownership against
 * @returns Array of validated feed IDs that belong to the user
 * @throws Error if any feed ID is invalid or doesn't belong to the user
 */
export async function validateFeedOwnership(
  feedIds: string[],
  userId: string,
): Promise<string[]> {
  return wrapDatabaseOperation(async () => {
    // Fetch all feeds with the given IDs that belong to the user
    const ownedFeeds = await prisma.rssFeed.findMany({
      where: {
        id: { in: feedIds },
        userId,
      },
      select: {
        id: true,
      },
    });

    const ownedFeedIds = ownedFeeds.map((feed) => feed.id);

    // Check if all requested feed IDs are owned by the user
    const unauthorizedFeedIds = feedIds.filter(
      (id) => !ownedFeedIds.includes(id),
    );

    if (unauthorizedFeedIds.length > 0) {
      throw new Error(
        `Unauthorized: You don't have access to the following feed(s): ${unauthorizedFeedIds.join(", ")}`,
      );
    }

    return ownedFeedIds;
  }, "validate feed ownership");
}

/**
 * Permanently deletes an RSS feed and cleans up articles not referenced by other feeds
 */
export async function deleteRssFeed(feedId: string) {
  return wrapDatabaseOperation(async () => {
    // MongoDB-specific: Remove feedId from sourceFeedIds arrays
    await prisma.$runCommandRaw({
      update: "RssArticle",
      updates: [
        {
          q: { sourceFeedIds: feedId },
          u: { $pull: { sourceFeedIds: feedId } },
          multi: true,
        },
      ],
    });

    // Delete articles that have no more feed references (empty sourceFeedIds)
    await prisma.rssArticle.deleteMany({
      where: {
        sourceFeedIds: {
          isEmpty: true,
        },
      },
    });

    // Finally, delete the feed itself
    await prisma.rssFeed.delete({
      where: { id: feedId },
    });

    return { success: true };
  }, "delete RSS feed");
}