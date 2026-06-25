import { describe, expect, test, vi } from "vitest"
import type { Publisher } from "../../../../../server/repository/article"
import { generateArticleService } from "../../../../../server/service/article"

describe("generateArticleService", () => {
  const publishers: Publisher[] = [{ id: 1, name: "Example Publisher" }]

  test("limitとoffsetをリポジトリに渡す", async () => {
    const repository = {
      readArticles: vi.fn().mockResolvedValue([]),
      countArticles: vi.fn(),
      readPublishers: vi.fn()
    }
    const service = generateArticleService({ repository })

    await service.readArticles({ limit: 10, offset: 20 })

    expect(repository.readArticles).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, offset: 20 })
    )
  })

  test("countArticlesをリポジトリに委譲して件数を返す", async () => {
    const repository = {
      readArticles: vi.fn(),
      countArticles: vi.fn().mockResolvedValue(3),
      readPublishers: vi.fn()
    }
    const service = generateArticleService({ repository })

    await expect(service.countArticles({})).resolves.toBe(3)
  })

  test("readPublishersをリポジトリに委譲する", async () => {
    const repository = {
      readArticles: vi.fn(),
      countArticles: vi.fn(),
      readPublishers: vi.fn().mockResolvedValue(publishers)
    }
    const service = generateArticleService({ repository })

    await expect(service.readPublishers()).resolves.toEqual(publishers)
  })
})
