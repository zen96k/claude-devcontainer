import { describe, expect, it } from "vitest"
import { formatDate } from "../../../../app/utils/formatDate"

describe("formatDate", () => {
  it("Date オブジェクトを YYYY-MM-DD HH:mm:ss 形式にフォーマットする", () => {
    const result = formatDate(new Date("2026-01-15T10:30:00"))
    expect(result).toBe("2026-01-15 10:30:00")
  })

  it("文字列の日付を YYYY-MM-DD HH:mm:ss 形式にフォーマットする", () => {
    const result = formatDate("2026-06-25T08:00:00")
    expect(result).toBe("2026-06-25 08:00:00")
  })

  it("ISO 文字列を受け取ってフォーマットできる", () => {
    const result = formatDate("2024-12-31T23:59:59.000Z")
    expect(typeof result).toBe("string")
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
  })
})
