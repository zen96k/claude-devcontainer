import { type SQL, count, eq } from "drizzle-orm"
import type { LibSQLDatabase } from "drizzle-orm/libsql"
import type * as schema from "../db/schema"
import { article, publisher } from "../db/schema"

export type Article = {
  id: number
  title: string
  url: string
  author: string
  publishedAt: Date
  publisherName: string
}

export type Publisher = { id: number; name: string }

export type ReadOption = {
  where?: SQL
  orderBy?: SQL[]
  limit?: number
  offset?: number
}

export const generateArticleRepository = (
  db: LibSQLDatabase<typeof schema>
) => {
  return {
    readArticles: async ({
      where,
      orderBy,
      limit,
      offset
    }: ReadOption = {}): Promise<Article[]> => {
      let query = db
        .select({
          id: article.id,
          title: article.title,
          url: article.url,
          author: article.author,
          publishedAt: article.publishedAt,
          publisherName: publisher.name
        })
        .from(article)
        .innerJoin(publisher, eq(article.publisherId, publisher.id))
        .$dynamic()

      if (where) {
        query = query.where(where)
      }
      if (orderBy) {
        query = query.orderBy(...orderBy)
      }
      if (limit) {
        query = query.limit(limit)
      }
      if (offset) {
        query = query.offset(offset)
      }

      return await query
    },

    countArticles: async ({ where }: { where?: SQL } = {}): Promise<number> => {
      let query = db
        .select({ count: count() })
        .from(article)
        .innerJoin(publisher, eq(article.publisherId, publisher.id))
        .$dynamic()

      if (where) {
        query = query.where(where)
      }

      const [{ count: total }] = (await query) as [{ count: number }]

      return total
    },

    readPublishers: async (): Promise<Publisher[]> => {
      return await db
        .selectDistinct({ id: publisher.id, name: publisher.name })
        .from(article)
        .innerJoin(publisher, eq(article.publisherId, publisher.id))
        .orderBy(publisher.name)
    }
  }
}
