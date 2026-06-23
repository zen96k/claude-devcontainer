import { describe, expect, it, vi } from "vitest"
import type {
  Article,
  Publisher
} from "../../../../server/repository/article.repository"
import { generateArticleService } from "../../../../server/service/article.service"

const articles: Article[] = [
  {
    id: 1,
    title: "Nuxt testing",
    url: "https://example.com/nuxt-testing",
    author: "Author",
    publishedAt: new Date("2026-06-23T00:00:00.000Z"),
    publisherName: "Example Publisher"
  }
]

const publishers: Publisher[] = [{ id: 1, name: "Example Publisher" }]

describe("generateArticleService", () => {
  it("forwards pagination and builds supported filters/order expressions", async () => {
    const repository = {
      readArticles: vi.fn().mockResolvedValue(articles),
      countArticles: vi.fn(),
      readPublishers: vi.fn()
    }
    const service = generateArticleService(repository)

    await expect(
      service.readArticles({
        where: [
          {
            column: "publisherName",
            operator: "eq",
            value: "Example Publisher"
          }
        ],
        orderBy: [{ column: "publishedAt", direction: "desc" }],
        limit: 10,
        offset: 20
      })
    ).resolves.toEqual(articles)

    expect(repository.readArticles).toHaveBeenCalledOnce()
    expect(repository.readArticles).toHaveBeenCalledWith({
      where: expect.anything(),
      orderBy: [expect.anything()],
      limit: 10,
      offset: 20
    })
  })

  it("ignores unsupported filters and falls back unsupported order columns to id", async () => {
    const repository = {
      readArticles: vi.fn().mockResolvedValue(articles),
      countArticles: vi.fn(),
      readPublishers: vi.fn()
    }
    const service = generateArticleService(repository)

    await service.readArticles({
      where: [{ column: "unknown", operator: "eq", value: "ignored" }],
      orderBy: [{ column: "unknown", direction: "asc" }]
    })

    expect(repository.readArticles).toHaveBeenCalledWith({
      where: undefined,
      orderBy: [expect.anything()],
      limit: undefined,
      offset: undefined
    })
  })

  it("delegates countArticles with supported filters", async () => {
    const repository = {
      readArticles: vi.fn(),
      countArticles: vi.fn().mockResolvedValue(3),
      readPublishers: vi.fn()
    }
    const service = generateArticleService(repository)

    await expect(
      service.countArticles({
        where: [
          {
            column: "publisherName",
            operator: "eq",
            value: "Example Publisher"
          }
        ]
      })
    ).resolves.toBe(3)

    expect(repository.countArticles).toHaveBeenCalledWith({
      where: expect.anything()
    })
  })

  it("delegates readPublishers", async () => {
    const repository = {
      readArticles: vi.fn(),
      countArticles: vi.fn(),
      readPublishers: vi.fn().mockResolvedValue(publishers)
    }
    const service = generateArticleService(repository)

    await expect(service.readPublishers()).resolves.toEqual(publishers)

    expect(repository.readPublishers).toHaveBeenCalledOnce()
  })
})
