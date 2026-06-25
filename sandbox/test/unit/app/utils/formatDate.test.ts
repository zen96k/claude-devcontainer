import { describe, expect, test } from "vitest"
import { formatDate } from "../../../../app/utils/formatDate"

describe("formatDate", () => {
  test("Date オブジェクトを YYYY-MM-DD HH:mm:ss 形式にフォーマットする", () => {
    const result = formatDate({ date: new Date("2026-01-15T10:30:00") })
    expect(result).toBe("2026-01-15 10:30:00")
  })

  test("文字列の日付を YYYY-MM-DD HH:mm:ss 形式にフォーマットする", () => {
    const result = formatDate({ date: "2026-06-25T08:00:00" })
    expect(result).toBe("2026-06-25 08:00:00")
  })

  test("ISO 文字列を受け取ってフォーマットできる", () => {
    const result = formatDate({ date: "2024-12-31T23:59:59.000Z" })
    expect(typeof result).toBe("string")
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
  })
})
