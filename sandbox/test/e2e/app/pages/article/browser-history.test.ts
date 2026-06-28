import { getBrowser, setup, url } from "@nuxt/test-utils/e2e"
import { fileURLToPath } from "node:url"
import type { Page } from "playwright-core"
import { afterEach, describe, expect, test } from "vitest"

await setup({
  rootDir: fileURLToPath(new URL("../../../../..", import.meta.url)),
  browser: true,
  dev: true
})

// desktop (limit=15) で3ページ分確保するため 46 件
const ARTICLES = Array.from({ length: 46 }, (_, i) => {
  return {
    id: i + 1,
    title: `記事 ${i + 1}`,
    publisherName: i % 2 === 0 ? "Zenn" : "Qiita",
    url: `https://example.com/${i + 1}`,
    author: "author",
    publishedAt: "2026-01-01",
    summary: null
  }
})

const PUBLISHERS = [
  { id: 1, name: "Qiita" },
  { id: 2, name: "Zenn" }
]

const createMockedPage = async (): Promise<Page> => {
  const page = await (await getBrowser()).newPage()

  await page.route("**/api/article/fetch", async (route) => {
    const body = route.request().postDataJSON()
    const { where, offset = 0, limit = 10 } = body
    const publisherFilter = (
      where as { column: string; value: string }[] | undefined
    )?.find((w) => {
      return w.column === "publisherName"
    })
    const filtered = publisherFilter
      ? ARTICLES.filter((a) => {
          return a.publisherName === publisherFilter.value
        })
      : ARTICLES
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        articles: filtered.slice(offset, offset + limit),
        total: filtered.length,
        publishers: PUBLISHERS
      })
    })
  })

  return page
}

describe("記事一覧 - ブラウザ履歴", () => {
  let page: Page

  afterEach(async () => {
    await page.close()
  })

  test("ページ送りが履歴に積まれる", async () => {
    page = await createMockedPage()
    await page.goto(url("/article"))
    await page.waitForLoadState("networkidle")

    await page.locator('[aria-label="Page 2"]').first().click()
    await page.waitForURL(/page=2/)

    await page.locator('[aria-label="Page 3"]').first().click()
    await page.waitForURL(/page=3/)

    await page.goBack()
    await page.waitForURL(/page=2/)
    expect(page.url()).toContain("page=2")

    await page.goForward()
    await page.waitForURL(/page=3/)
    expect(page.url()).toContain("page=3")
  })

  test("配信元フィルターが履歴に積まれる", async () => {
    page = await createMockedPage()
    await page.goto(url("/article"))
    await page.waitForLoadState("networkidle")

    await page.getByRole("button", { name: "Zenn" }).click()
    await page.waitForURL(/publisher=Zenn/)

    await page.goBack()
    await page.waitForURL((u) => {
      return !u.toString().includes("publisher")
    })
    expect(page.url()).not.toContain("publisher")
  })

  test("配信元切り替え時にページが 1 にリセットされる", async () => {
    page = await createMockedPage()
    await page.goto(url("/article?page=3"))
    await page.waitForLoadState("networkidle")

    await page.getByRole("button", { name: "Zenn" }).click()
    await page.waitForURL(/publisher=Zenn/)
    expect(page.url()).not.toContain("page=")

    await page.goBack()
    await page.waitForURL(/page=3/)
    expect(page.url()).toContain("page=3")
  })

  test("URL直接アクセスが正しく表示される", async () => {
    page = await createMockedPage()
    await page.goto(url("/article?page=2&publisher=Zenn"))
    await page.waitForLoadState("networkidle")

    expect(page.url()).toContain("page=2")
    expect(page.url()).toContain("publisher=Zenn")
    expect(
      await page.getByRole("heading", { name: "記事一覧" }).isVisible()
    ).toBe(true)
  })
})
