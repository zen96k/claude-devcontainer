import { mountSuspended } from "@nuxt/test-utils/runtime"
import { describe, expect, it } from "vitest"
import ArticleCard from "~/components/article/ArticleCard.vue"

const formatDate = (date: string | Date) =>
  new Date(date).toISOString().slice(0, 10)

const mockArticle = {
  id: 1,
  publisherName: "Zenn",
  title: "Nuxt 4 のテスト入門",
  url: "https://example.com/article/1",
  author: "test-author",
  publishedAt: new Date("2026-01-15T10:00:00"),
}

describe("ArticleCard", () => {
  it("記事タイトルが表示される", async () => {
    const wrapper = await mountSuspended(ArticleCard, {
      props: { article: mockArticle, formatDate },
    })
    expect(wrapper.text()).toContain("Nuxt 4 のテスト入門")
  })

  it("publisher 名が表示される", async () => {
    const wrapper = await mountSuspended(ArticleCard, {
      props: { article: mockArticle, formatDate },
    })
    expect(wrapper.text()).toContain("Zenn")
  })

  it("author 名が表示される", async () => {
    const wrapper = await mountSuspended(ArticleCard, {
      props: { article: mockArticle, formatDate },
    })
    expect(wrapper.text()).toContain("test-author")
  })

  it("リンクの href が記事 URL になっている", async () => {
    const wrapper = await mountSuspended(ArticleCard, {
      props: { article: mockArticle, formatDate },
    })
    expect(wrapper.find("a").attributes("href")).toBe(
      "https://example.com/article/1",
    )
  })

  it("リンクが target=_blank で開く", async () => {
    const wrapper = await mountSuspended(ArticleCard, {
      props: { article: mockArticle, formatDate },
    })
    expect(wrapper.find("a").attributes("target")).toBe("_blank")
  })
})
