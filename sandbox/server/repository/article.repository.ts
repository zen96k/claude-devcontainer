import { type SQL, eq } from "drizzle-orm"
import { db } from "../db"
import { article, publisher } from "../db/schema"

export type Article = {
  id: number
  title: string
  url: string
  author: string
  publishedAt: Date
  publisherName: string
}

export type ReadOption = { orderBy?: SQL[]; limit?: number; offset?: number }

export const articleRepository = {
  readArticles: async ({ orderBy, limit, offset }: ReadOption = {}): Promise<
    Article[]
  > => {
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
  }
}
