import { sql } from "drizzle-orm"
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const articleLabel = sqliteTable(
  "article_label",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").$type<"new" | "popular">().notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
  },
  (table) => [
    check("chk_article_label_name", sql`${table.name} IN ('new', 'popular')`)
  ]
)
