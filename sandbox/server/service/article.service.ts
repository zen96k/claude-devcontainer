import { type SQL, and, asc, desc, eq } from "drizzle-orm"
import { article, publisher } from "../db/schema"
import type {
  Article,
  Publisher,
  ReadOption
} from "../repository/article.repository"

export type ArticleRepository = {
  readArticles(option?: ReadOption): Promise<Article[]>
  countArticles(option?: { where?: SQL }): Promise<number>
  readPublishers(): Promise<Publisher[]>
}

const orderableColumns = {
  publishedAt: article.publishedAt,
  title: article.title,
  author: article.author
} as const

type OrderableColumn = keyof typeof orderableColumns

const filterableColumns = { publisherName: publisher.name } as const

type FilterableColumn = keyof typeof filterableColumns

export type WhereCondition = { column: string; operator: "eq"; value: string }

export type GetArticlesOption = {
  where?: WhereCondition[]
  orderBy?: { column: string; direction: "asc" | "desc" }[]
  limit?: number
  offset?: number
}

const buildWhereSQL = ({ conditions }: { conditions?: WhereCondition[] } = {}):
  | SQL
  | undefined => {
  const expressions = conditions
    ?.filter(({ column }) => {
      return column in filterableColumns
    })
    .map(({ column, operator, value }) => {
      const col = filterableColumns[column as FilterableColumn]
      switch (operator) {
        case "eq":
          return eq(col, value)
      }
    })

  if (!expressions?.length) {
    return undefined
  } else {
    return expressions.length === 1 ? expressions[0] : and(...expressions)
  }
}

export const generateArticleService = (repository: ArticleRepository) => {
  const service = {
    readArticles: async ({
      where,
      orderBy,
      limit,
      offset
    }: GetArticlesOption = {}): Promise<Article[]> => {
      const orderExpressions = orderBy?.map(({ column, direction }) => {
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

      return await repository.readArticles({
        where: buildWhereSQL({ conditions: where }),
        orderBy: orderExpressions,
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

  return service
}
