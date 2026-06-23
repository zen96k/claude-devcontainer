import { sql } from "drizzle-orm"
import { beforeEach, describe, expect, it, vi } from "vitest"

type QueryCall =
  | "select"
  | "selectDistinct"
  | "from"
  | "innerJoin"
  | "$dynamic"
  | "where"
  | "orderBy"
  | "limit"
  | "offset"

const queryCalls: QueryCall[] = []
let queryResult: unknown[] = []

const createQuery = () => {
  const query = {
    from: vi.fn(() => {
      queryCalls.push("from")
      return query
    }),
    innerJoin: vi.fn(() => {
      queryCalls.push("innerJoin")
      return query
    }),
    $dynamic: vi.fn(() => {
      queryCalls.push("$dynamic")
      return query
    }),
    where: vi.fn(() => {
      queryCalls.push("where")
      return query
    }),
    orderBy: vi.fn(() => {
      queryCalls.push("orderBy")
      return query
    }),
    limit: vi.fn(() => {
      queryCalls.push("limit")
      return query
    }),
    offset: vi.fn(() => {
      queryCalls.push("offset")
      return query
    }),
    then: (resolve: (value: unknown[]) => unknown) => {
      return Promise.resolve(queryResult).then(resolve)
    }
  }

  return query
}

const db = {
  select: vi.fn(() => {
    queryCalls.push("select")
    return createQuery()
  }),
  selectDistinct: vi.fn(() => {
    queryCalls.push("selectDistinct")
    return createQuery()
  })
}

vi.mock("../../../../server/db", () => {
  return { db }
})

describe("articleRepository", () => {
  beforeEach(() => {
    queryCalls.length = 0
    queryResult = []
    vi.clearAllMocks()
  })

  it("reads articles and applies optional query clauses", async () => {
    const { articleRepository } =
      await import("../../../../server/repository/article.repository")
    const rows = [
      {
        id: 1,
        title: "Nuxt testing",
        url: "https://example.com/nuxt-testing",
        author: "Author",
        publishedAt: new Date("2026-06-23T00:00:00.000Z"),
        publisherName: "Example Publisher"
      }
    ]
    queryResult = rows

    await expect(
      articleRepository.readArticles({
        where: sql`publisher.name = ${"Example Publisher"}`,
        orderBy: [sql`article.published_at desc`],
        limit: 10,
        offset: 20
      })
    ).resolves.toEqual(rows)

    expect(queryCalls).toEqual([
      "select",
      "from",
      "innerJoin",
      "$dynamic",
      "where",
      "orderBy",
      "limit",
      "offset"
    ])
  })

  it("does not apply absent or zero-valued read options", async () => {
    const { articleRepository } =
      await import("../../../../server/repository/article.repository")

    await articleRepository.readArticles({ limit: 0, offset: 0 })

    expect(queryCalls).toEqual(["select", "from", "innerJoin", "$dynamic"])
  })

  it("counts articles and returns the selected count", async () => {
    const { articleRepository } =
      await import("../../../../server/repository/article.repository")
    queryResult = [{ count: 42 }]

    await expect(
      articleRepository.countArticles({
        where: sql`publisher.name = ${"Example Publisher"}`
      })
    ).resolves.toBe(42)

    expect(queryCalls).toEqual([
      "select",
      "from",
      "innerJoin",
      "$dynamic",
      "where"
    ])
  })

  it("reads distinct publishers ordered by name", async () => {
    const { articleRepository } =
      await import("../../../../server/repository/article.repository")
    const rows = [{ id: 1, name: "Example Publisher" }]
    queryResult = rows

    await expect(articleRepository.readPublishers()).resolves.toEqual(rows)

    expect(queryCalls).toEqual([
      "selectDistinct",
      "from",
      "innerJoin",
      "orderBy"
    ])
  })
})
