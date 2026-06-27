import { type SQL, and, asc, desc, eq } from "drizzle-orm"
import { article, publisher } from "../../db/schema"

const orderableColumns = {
  publishedAt: article.publishedAt,
  title: article.title,
  author: article.author
} as const
const filterableColumns = { publisherName: publisher.name } as const

type OrderableColumn = keyof typeof orderableColumns
type FilterableColumn = keyof typeof filterableColumns

export type WhereCondition = {
  column: FilterableColumn
  operator: "eq"
  value: string
}
export type OrderByCondition = {
  column: OrderableColumn
  direction: "asc" | "desc"
}

export const buildWhereSQL = ({
  conditions
}: { conditions?: WhereCondition[] } = {}): SQL | undefined => {
  const expressions = conditions?.map(({ column, operator, value }) => {
    const col = filterableColumns[column]
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
}: { orderBy?: OrderByCondition[] } = {}): SQL[] | undefined => {
  const expressions = orderBy
    ?.filter(({ column }) => {
      return column in orderableColumns
    })
    .map(({ column, direction }) => {
      const col = orderableColumns[column]
      return direction === "desc" ? desc(col) : asc(col)
    })

  return expressions?.length ? expressions : undefined
}
