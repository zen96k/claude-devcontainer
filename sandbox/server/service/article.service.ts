import { asc, desc } from "drizzle-orm"
import { article } from "../db/schema"
import type { Article, ReadOption } from "../repository/article.repository"

export type ArticleRepository = {
  readArticles(option?: ReadOption): Promise<Article[]>
}

const orderableColumns = {
  publishedAt: article.publishedAt,
  title: article.title,
  author: article.author
} as const

type OrderableColumn = keyof typeof orderableColumns

export type GetArticlesOption = {
  orderBy?: { column: string; direction: "asc" | "desc" }[]
  limit?: number
  offset?: number
}

export const generateArticleService = (repository: ArticleRepository) => {
  const service = {
    readArticles: async (option?: GetArticlesOption): Promise<Article[]> => {
      const orderExpressions = option?.orderBy?.map(({ column, direction }) => {
        const designatedColumn =
          column in orderableColumns
            ? orderableColumns[column as OrderableColumn]
            : article.id

        switch (direction) {
          case "asc":
            return asc(designatedColumn)
          case "desc":
            return desc(designatedColumn)
          default:
            return asc(designatedColumn)
        }
      })

      const articles = await repository.readArticles({
        orderBy: orderExpressions,
        limit: option?.limit,
        offset: option?.offset
      })

      return articles
    }
  }

  return service
}
