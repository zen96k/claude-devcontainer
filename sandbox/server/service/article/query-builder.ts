import { type SQL, and, asc, desc, eq } from "drizzle-orm"
import { article, publisher } from "../../db/schema"

export type WhereCondition = { column: string; operator: "eq"; value: string }
export type GetArticlesOption = {
  where?: WhereCondition[]
  orderBy?: { column: string; direction: "asc" | "desc" }[]
  limit?: number
  offset?: number
}

const orderableColumns = {
  publishedAt: article.publishedAt,
  title: article.title,
  author: article.author
} as const
const filterableColumns = { publisherName: publisher.name } as const

type OrderableColumn = keyof typeof orderableColumns
type FilterableColumn = keyof typeof filterableColumns

export const buildWhereSQL = ({
  conditions
}: { conditions?: WhereCondition[] } = {}): SQL | undefined => {
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

export const buildOrderSQL = ({
  orderBy
}: { orderBy?: GetArticlesOption["orderBy"] } = {}): SQL[] | undefined => {
  const expressions = orderBy
    ?.filter(({ column }) => {
      return column in orderableColumns
    })
    .map(({ column, direction }) => {
      const col = orderableColumns[column as OrderableColumn]
      return direction === "desc" ? desc(col) : asc(col)
    })

  return expressions?.length ? expressions : undefined
}
