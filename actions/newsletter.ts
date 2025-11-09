"use server";

import type { Newsletter } from "@prisma/client";
import { wrapDatabaseOperation } from "@/lib/database/error-handler";
import { prisma } from "@/lib/prisma";

// ============================================
// TYPES FOR LEGACY DATA HANDLING
// ============================================

/**
 * Legacy newsletter data that may contain typo field names from older schema versions
 * This interface represents the union of current and legacy field structures
 */
interface NewsletterWithLegacyFields {
  startDate?: Date | string; // Current field name
  starteDate?: Date | string; // Legacy typo of "startDate"
  feedsUsed?: string[]; // Current field name
  feedUsed?: string[]; // Legacy typo of "feedsUsed"
}

/**
 * Normalized newsletter with corrected field names
 */
type NormalizedNewsletter = Omit<Newsletter, "startDate" | "feedsUsed"> & {
  startDate: Date | string | null;
  feedsUsed: string[];
};

/**
 * Type guard to check if an object has legacy fields
 *
 * @param obj - Any object to check
 * @returns True if object has legacy newsletter fields
 */
function hasLegacyFields(obj: unknown): obj is NewsletterWithLegacyFields {
  return (
    obj !== null &&
    typeof obj === "object" &&
    ("startDate" in obj ||
      "starteDate" in obj ||
      "feedsUsed" in obj ||
      "feedUsed" in obj)
  );
}

/**
 * Normalizes newsletter data by handling legacy field names
 *
 * This function safely reads from both current and legacy field names,
 * providing proper fallbacks for backwards compatibility. It uses
 * optional chaining and nullish coalescing to avoid unsafe type casts.
 *
 * @param raw - Newsletter data from Prisma that may contain legacy fields
 * @returns Normalized newsletter with correct field names and proper defaults
 */
function normalizeNewsletterFields(raw: Newsletter): NormalizedNewsletter {
  // Cast to unknown first, then use type guard for safe narrowing
  const possiblyLegacy = raw as unknown;

  let startDate: Date | string | null = null;
  let feedsUsed: string[] = [];

  if (hasLegacyFields(possiblyLegacy)) {
    // Handle startDate: prefer current field, fall back to legacy typo, then null
    startDate = possiblyLegacy.startDate ?? possiblyLegacy.starteDate ?? null;

    // Handle feedsUsed: prefer current field, fall back to legacy typo, then empty array
    feedsUsed = possiblyLegacy.feedsUsed ?? possiblyLegacy.feedUsed ?? [];
  }

  return {
    ...raw,
    startDate,
    feedsUsed,
  };
}

// ============================================
// NEWSLETTER ACTIONS
// ============================================

/**
 * Creates and saves a generated newsletter to the database
 *
 * This function is called after AI generation completes (Pro users only).
 * It stores all newsletter components for future reference.
 *
 * @param data - Complete newsletter data and metadata
 * @returns Created newsletter record
 */
export async function createNewsletter(data: {
  userId: string;
  suggestedTitles: string[];
  suggestedSubjectLines: string[];
  body: string;
  topAnnouncements: string[];
  additionalInfo?: string;
  startDate: Date;
  endDate: Date;
  userInput?: string;
  feedsUsed: string[];
}) {
  return wrapDatabaseOperation(async () => {
    return await prisma.newsletter.create({
      data: {
        userId: data.userId,
        suggestedTitles: data.suggestedTitles,
        suggestedSubjectLines: data.suggestedSubjectLines,
        body: data.body,
        topAnnouncements: data.topAnnouncements,
        additionalInfo: data.additionalInfo,
        startDate: data.startDate,
        endDate: data.endDate,
        userInput: data.userInput,
        feedsUsed: data.feedsUsed,
      },
    });
  }, "create newsletter");
}

/**
 * Gets all newsletters for a user, ordered by most recent first
 *
 * Supports pagination via limit and skip options.
 * Used for displaying newsletter history.
 *
 * @param userId - User's database ID
 * @param options - Optional pagination parameters
 * @returns Array of newsletters
 */
export async function getNewslettersByUserId(
  userId: string,
  options?: {
    limit?: number;
    skip?: number;
  },
) {
  return wrapDatabaseOperation(async () => {
    const newsletters = await prisma.newsletter.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: options?.limit,
      skip: options?.skip,
    });

    // Normalize field names to handle legacy data with typos
    return newsletters.map((newsletter) =>
      normalizeNewsletterFields(newsletter),
    );
  }, "fetch newsletters by user");
}

/**
 * Gets a single newsletter by ID with authorization check
 *
 * Ensures the newsletter belongs to the requesting user
 * for security. Returns null if not found.
 *
 * @param id - Newsletter ID
 * @param userId - User's database ID for authorization
 * @returns Newsletter or null if not found/unauthorized
 */
export async function getNewsletterById(id: string, userId: string) {
  return wrapDatabaseOperation(async () => {
    const newsletter = await prisma.newsletter.findUnique({
      where: {
        id,
      },
    });

    // Newsletter not found
    if (!newsletter) {
      return null;
    }

    // Authorization: ensure newsletter belongs to user
    if (newsletter.userId !== userId) {
      throw new Error("Unauthorized: Newsletter does not belong to user");
    }

    // Normalize field names to handle legacy data with typos
    return normalizeNewsletterFields(newsletter);
  }, "fetch newsletter by ID");
}

/**
 * Gets the total count of newsletters for a user
 *
 * Useful for pagination and displaying totals.
 *
 * @param userId - User's database ID
 * @returns Number of newsletters
 */
export async function getNewslettersCountByUserId(userId: string) {
  return wrapDatabaseOperation(async () => {
    return await prisma.newsletter.count({
      where: {
        userId,
      },
    });
  }, "count newsletters by user");
}

/**
 * Deletes a newsletter by ID with authorization check
 *
 * Verifies the newsletter exists and belongs to the user
 * before deletion. Throws error if not authorized.
 *
 * @param id - Newsletter ID to delete
 * @param userId - User's database ID for authorization
 * @returns Deleted newsletter record
 */
export async function deleteNewsletter(id: string, userId: string) {
  return wrapDatabaseOperation(async () => {
    // Verify the newsletter exists and belongs to the user
    const newsletter = await prisma.newsletter.findUnique({
      where: {
        id,
      },
    });

    if (!newsletter) {
      throw new Error("Newsletter not found");
    }

    if (newsletter.userId !== userId) {
      throw new Error("Unauthorized: Newsletter does not belong to user");
    }

    // Delete the newsletter
    return await prisma.newsletter.delete({
      where: {
        id,
      },
    });
  }, "delete newsletter");
}
