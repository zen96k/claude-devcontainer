import { describe, expect, test } from "vitest"
import { bodySchema } from "../../../../../server/api/article/schema/body-schema"

describe("bodySchema", () => {
  test("空オブジェクトを受け入れる", () => {
    expect(() => {
      return bodySchema.parse({})
    }).not.toThrow()
  })

  test("有効なボディを受け入れる", () => {
    expect(() => {
      return bodySchema.parse({
        where: [{ column: "publisherName", operator: "eq", value: "Zenn" }],
        orderBy: [{ column: "publishedAt", direction: "desc" }],
        limit: 10,
        offset: 0
      })
    }).not.toThrow()
  })

  test("direction が asc/desc 以外のとき拒否する", () => {
    expect(() => {
      return bodySchema.parse({
        orderBy: [{ column: "publishedAt", direction: "invalid" }]
      })
    }).toThrow()
  })

  test("operator が eq 以外のとき拒否する", () => {
    expect(() => {
      return bodySchema.parse({
        where: [{ column: "publisherName", operator: "like", value: "Zenn" }]
      })
    }).toThrow()
  })

  test("limit が 0 のとき拒否する", () => {
    expect(() => {
      return bodySchema.parse({ limit: 0 })
    }).toThrow()
  })

  test("limit が負数のとき拒否する", () => {
    expect(() => {
      return bodySchema.parse({ limit: -1 })
    }).toThrow()
  })

  test("offset が負数のとき拒否する", () => {
    expect(() => {
      return bodySchema.parse({ offset: -1 })
    }).toThrow()
  })

  test("limit が小数のとき拒否する", () => {
    expect(() => {
      return bodySchema.parse({ limit: 1.5 })
    }).toThrow()
  })

  test("offset が小数のとき拒否する", () => {
    expect(() => {
      return bodySchema.parse({ offset: 1.5 })
    }).toThrow()
  })

  test("offset が 0 のとき受け入れる", () => {
    expect(() => {
      return bodySchema.parse({ offset: 0 })
    }).not.toThrow()
  })
})
