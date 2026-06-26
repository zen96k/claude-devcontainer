import { sql } from "drizzle-orm"
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { article } from "./article"

export const articleSummaryStatus = {
  pending: "pending",
  processing: "processing",
  completed: "completed",
  failed: "failed"
} as const

export const articleSummaryStatuses = [
  articleSummaryStatus.pending,
  articleSummaryStatus.processing,
  articleSummaryStatus.completed,
  articleSummaryStatus.failed
] as const

export type ArticleSummaryStatus = (typeof articleSummaryStatuses)[number]

const articleSummaryStatusCheckValues = articleSummaryStatuses
  .map((status) => {
    return `'${status}'`
  })
  .join(", ")

export const articleSummary = sqliteTable(
  "article_summary",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    articleId: integer("article_id")
      .notNull()
      .unique()
      .references(
        () => {
          return article.id
        },
        { onDelete: "cascade", onUpdate: "cascade" }
      ),
    contentHash: text("content_hash"),
    summary: text("summary"),
    status: text("status", { enum: articleSummaryStatuses })
      .notNull()
      .default(articleSummaryStatus.pending),
    error: text("error"),
    summarizedAt: integer("summarized_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
  },
  (table) => {
    return [
      check(
        "article_summary_status_check",
        sql`${table.status} in (${sql.raw(articleSummaryStatusCheckValues)})`
      )
    ]
  }
)
