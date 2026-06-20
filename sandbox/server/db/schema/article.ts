import { sql } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { publisher } from "./publisher"

export const article = sqliteTable("article", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  publisherId: integer("publisher_id")
    .notNull()
    .references(() => publisher.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    }),
  title: text("title").notNull(),
  url: text("url").notNull().unique(),
  author: text("author").notNull(),
  publishedAt: integer("published_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
})
