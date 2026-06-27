import { describe, expect, test } from "vitest"
import { requestBodySchema } from "../../../../../server/api/article/schema/request-body-schema"

describe("requestBodySchema", () => {
  test("空オブジェクトを受け入れる", () => {
    expect(() => {
      return requestBodySchema.parse({})
    }).not.toThrow()
  })

  test("有効なボディを受け入れる", () => {
    expect(() => {
      return requestBodySchema.parse({
        where: [{ column: "publisherName", operator: "eq", value: "Zenn" }],
        orderBy: [{ column: "publishedAt", direction: "desc" }],
        limit: 10,
        offset: 0
      })
    }).not.toThrow()
  })

  test("direction が asc/desc 以外のとき拒否する", () => {
    expect(() => {
      return requestBodySchema.parse({
        orderBy: [{ column: "publishedAt", direction: "invalid" }]
      })
    }).toThrow()
  })

  test("where.column が不明なカラムのとき拒否する", () => {
    expect(() => {
      return requestBodySchema.parse({
        where: [{ column: "unknown", operator: "eq", value: "x" }]
      })
    }).toThrow()
  })

  test("orderBy.column が不明なカラムのとき拒否する", () => {
    expect(() => {
      return requestBodySchema.parse({
        orderBy: [{ column: "unknown", direction: "asc" }]
      })
    }).toThrow()
  })

  test("operator が eq 以外のとき拒否する", () => {
    expect(() => {
      return requestBodySchema.parse({
        where: [{ column: "publisherName", operator: "like", value: "Zenn" }]
      })
    }).toThrow()
  })

  test("limit が 0 のとき拒否する", () => {
    expect(() => {
      return requestBodySchema.parse({ limit: 0 })
    }).toThrow()
  })

  test("limit が負数のとき拒否する", () => {
    expect(() => {
      return requestBodySchema.parse({ limit: -1 })
    }).toThrow()
  })

  test("offset が負数のとき拒否する", () => {
    expect(() => {
      return requestBodySchema.parse({ offset: -1 })
    }).toThrow()
  })

  test("limit が小数のとき拒否する", () => {
    expect(() => {
      return requestBodySchema.parse({ limit: 1.5 })
    }).toThrow()
  })

  test("offset が小数のとき拒否する", () => {
    expect(() => {
      return requestBodySchema.parse({ offset: 1.5 })
    }).toThrow()
  })

  test("offset が 0 のとき受け入れる", () => {
    expect(() => {
      return requestBodySchema.parse({ offset: 0 })
    }).not.toThrow()
  })
})
