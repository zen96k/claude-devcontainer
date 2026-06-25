import { asc, desc, eq } from "drizzle-orm"
import { describe, expect, test, vi } from "vitest"
import { article, publisher } from "../../../../../server/db/schema"
import type { Publisher } from "../../../../../server/repository/article.repository"
import {
  buildOrderSQL,
  buildWhereSQL
} from "../../../../../server/service/article/query-builder"
import { generateArticleService } from "../../../../../server/service/article/service"

describe("buildWhereSQL", () => {
  test("returns undefined when no conditions given", () => {
    expect(buildWhereSQL()).toBeUndefined()
  })

  test("returns undefined when conditions is empty array", () => {
    expect(buildWhereSQL({ conditions: [] })).toBeUndefined()
  })

  test("returns undefined when all columns are unsupported", () => {
    expect(
      buildWhereSQL({
        conditions: [{ column: "unknown", operator: "eq", value: "x" }]
      })
    ).toBeUndefined()
  })

  test("builds eq expression for supported column", () => {
    const result = buildWhereSQL({
      conditions: [
        { column: "publisherName", operator: "eq", value: "Example Publisher" }
      ]
    })
    expect(result).toEqual(eq(publisher.name, "Example Publisher"))
  })

  test("ignores unsupported columns and uses only supported ones", () => {
    const result = buildWhereSQL({
      conditions: [
        { column: "unknown", operator: "eq", value: "ignored" },
        { column: "publisherName", operator: "eq", value: "Example Publisher" }
      ]
    })
    expect(result).toEqual(eq(publisher.name, "Example Publisher"))
  })
})

describe("buildOrderSQL", () => {
  test("returns undefined when no orderBy given", () => {
    expect(buildOrderSQL(undefined)).toBeUndefined()
  })

  test("returns undefined for unsupported column", () => {
    expect(
      buildOrderSQL([{ column: "unknown", direction: "asc" }])
    ).toBeUndefined()
  })

  test("builds asc expression for supported column", () => {
    expect(
      buildOrderSQL([{ column: "publishedAt", direction: "asc" }])
    ).toEqual([asc(article.publishedAt)])
  })

  test("builds desc expression for supported column", () => {
    expect(
      buildOrderSQL([{ column: "publishedAt", direction: "desc" }])
    ).toEqual([desc(article.publishedAt)])
  })

  test("handles multiple order expressions", () => {
    expect(
      buildOrderSQL([
        { column: "publishedAt", direction: "desc" },
        { column: "title", direction: "asc" }
      ])
    ).toEqual([desc(article.publishedAt), asc(article.title)])
  })

  test("ignores unsupported columns and uses only supported ones", () => {
    expect(
      buildOrderSQL([
        { column: "unknown", direction: "asc" },
        { column: "publishedAt", direction: "desc" }
      ])
    ).toEqual([desc(article.publishedAt)])
  })
})

describe("generateArticleService", () => {
  const publishers: Publisher[] = [{ id: 1, name: "Example Publisher" }]

  test("forwards limit and offset to repository", async () => {
    const repository = {
      readArticles: vi.fn().mockResolvedValue([]),
      countArticles: vi.fn(),
      readPublishers: vi.fn()
    }
    const service = generateArticleService(repository)

    await service.readArticles({ limit: 10, offset: 20 })

    expect(repository.readArticles).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, offset: 20 })
    )
  })

  test("delegates countArticles and returns the count", async () => {
    const repository = {
      readArticles: vi.fn(),
      countArticles: vi.fn().mockResolvedValue(3),
      readPublishers: vi.fn()
    }
    const service = generateArticleService(repository)

    await expect(service.countArticles({})).resolves.toBe(3)
  })

  test("delegates readPublishers", async () => {
    const repository = {
      readArticles: vi.fn(),
      countArticles: vi.fn(),
      readPublishers: vi.fn().mockResolvedValue(publishers)
    }
    const service = generateArticleService(repository)

    await expect(service.readPublishers()).resolves.toEqual(publishers)
  })
})
