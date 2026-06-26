import { and, desc, eq, isNull, lt, or, sql } from "drizzle-orm"
import type { LibSQLDatabase } from "drizzle-orm/libsql"
import type * as schema from "../../db/schema"
import { article, articleSummary, articleSummaryStatus } from "../../db/schema"

export const generateArticleSummaryRepository = ({
  db
}: {
  db: LibSQLDatabase<typeof schema>
}) => {
  return {
    readPendingArticles: async ({
      timeoutAt,
      limit
    }: {
      timeoutAt: Date
      limit?: number
    }) => {
      let query = db
        .select({
          id: article.id,
          title: article.title,
          url: article.url,
          contentHash: articleSummary.contentHash,
          summary: articleSummary.summary
        })
        .from(article)
        .leftJoin(articleSummary, eq(article.id, articleSummary.articleId))
        .where(
          or(
            isNull(articleSummary.articleId),
            eq(articleSummary.status, articleSummaryStatus.pending),
            eq(articleSummary.status, articleSummaryStatus.failed),
            and(
              eq(articleSummary.status, articleSummaryStatus.processing),
              lt(articleSummary.updatedAt, timeoutAt)
            )
          )
        )
        .orderBy(desc(article.publishedAt))
        .$dynamic()

      if (limit) {
        query = query.limit(limit)
      }

      return await query
    },

    markArticleSummaryStatusProcessing: async ({
      articleId
    }: {
      articleId: number
    }) => {
      await db
        .insert(articleSummary)
        .values({
          articleId,
          status: articleSummaryStatus.processing,
          error: null
        })
        .onConflictDoUpdate({
          target: articleSummary.articleId,
          set: {
            status: articleSummaryStatus.processing,
            error: null,
            updatedAt: sql`(unixepoch())`
          }
        })
    },

    markArticleSummaryStatusCompleted: async ({
      articleId,
      contentHash,
      summary
    }: {
      articleId: number
      contentHash: string
      summary: string
    }) => {
      await db
        .update(articleSummary)
        .set({
          contentHash,
          summary,
          status: articleSummaryStatus.completed,
          error: null,
          summarizedAt: sql`(unixepoch())`,
          updatedAt: sql`(unixepoch())`
        })
        .where(eq(articleSummary.articleId, articleId))
    },

    markArticleSummaryStatusSkipped: async ({
      articleId
    }: {
      articleId: number
    }) => {
      await db
        .update(articleSummary)
        .set({
          status: articleSummaryStatus.completed,
          error: null,
          updatedAt: sql`(unixepoch())`
        })
        .where(eq(articleSummary.articleId, articleId))
    },

    markArticleSummaryStatusFailed: async ({
      articleId,
      error
    }: {
      articleId: number
      error: unknown
    }) => {
      await db
        .update(articleSummary)
        .set({
          status: articleSummaryStatus.failed,
          error: error instanceof Error ? error.message : String(error),
          updatedAt: sql`(unixepoch())`
        })
        .where(eq(articleSummary.articleId, articleId))
    }
  }
}
