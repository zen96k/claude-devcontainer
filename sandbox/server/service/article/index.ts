import type { SQL } from "drizzle-orm"
import type { Article, Publisher, ReadOption } from "../../repository/article"
import {
  type GetArticlesOption,
  type WhereCondition,
  buildOrderSQL,
  buildWhereSQL
} from "./query-builder"

export type ArticleRepository = {
  readArticles(option?: ReadOption): Promise<Article[]>
  countArticles(option?: { where?: SQL }): Promise<number>
  readPublishers(): Promise<Publisher[]>
}

export const generateArticleService = ({
  repository
}: {
  repository: ArticleRepository
}) => {
  return {
    readArticles: async ({
      where,
      orderBy,
      limit,
      offset
    }: GetArticlesOption = {}): Promise<Article[]> => {
      return await repository.readArticles({
        where: buildWhereSQL({ conditions: where }),
        orderBy: buildOrderSQL({ orderBy }),
        limit,
        offset
      })
    },

    countArticles: async ({
      where
    }: { where?: WhereCondition[] } = {}): Promise<number> => {
      return await repository.countArticles({
        where: buildWhereSQL({ conditions: where })
      })
    },

    readPublishers: async (): Promise<Publisher[]> => {
      return await repository.readPublishers()
    }
  }
}
