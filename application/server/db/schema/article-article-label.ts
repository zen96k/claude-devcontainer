import { sql } from "drizzle-orm"
import { integer, sqliteTable } from "drizzle-orm/sqlite-core"
import { article } from "./article"
import { articleLabel } from "./article-label"

export const articleArticleLabel = sqliteTable("article_article_label", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  articleId: integer("article_id")
    .notNull()
    .references(() => article.id, { onDelete: "cascade", onUpdate: "cascade" }),
  articleLabelId: integer("article_label_id")
    .notNull()
    .references(() => articleLabel.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
})
