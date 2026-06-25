import { mockNuxtImport } from "@nuxt/test-utils/runtime"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { readonly, ref } from "vue"

// useFetch のみモック（useRoute/useRouter は Nuxt テスト環境の実物を使う）
const mockUseFetchFn = vi.hoisted(() => vi.fn())
mockNuxtImport("useFetch", () => mockUseFetchFn)

const defaultFetchResult = () => ({
  data: ref({
    articles: [
      {
        id: 1,
        title: "テスト記事",
        publisherName: "Zenn",
        url: "https://example.com",
        author: "author",
        publishedAt: "2026-01-01",
      },
    ],
    total: 1,
    publishers: [{ id: 1, name: "Zenn" }],
  }),
  status: ref("success"),
})

describe("useArticles", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseFetchFn.mockReturnValue(defaultFetchResult())
  })

  it("articles が data.articles を返す", async () => {
    const { articles } = await useArticles({ articleLimit: readonly(ref(10)) })
    expect(articles.value).toHaveLength(1)
    expect(articles.value[0].title).toBe("テスト記事")
  })

  it("total が data.total を返す", async () => {
    const { total } = await useArticles({ articleLimit: readonly(ref(10)) })
    expect(total.value).toBe(1)
  })

  it("publishers が data.publishers を返す", async () => {
    const { publishers } = await useArticles({ articleLimit: readonly(ref(10)) })
    expect(publishers.value).toEqual([{ id: 1, name: "Zenn" }])
  })

  it("data が null のとき articles は空配列を返す", async () => {
    mockUseFetchFn.mockReturnValue({
      data: ref(null),
      status: ref("idle"),
    })
    const { articles } = await useArticles({ articleLimit: readonly(ref(10)) })
    expect(articles.value).toEqual([])
  })

  it("data が null のとき total は 0 を返す", async () => {
    mockUseFetchFn.mockReturnValue({
      data: ref(null),
      status: ref("idle"),
    })
    const { total } = await useArticles({ articleLimit: readonly(ref(10)) })
    expect(total.value).toBe(0)
  })

  it("data が null のとき publishers は空配列を返す", async () => {
    mockUseFetchFn.mockReturnValue({
      data: ref(null),
      status: ref("idle"),
    })
    const { publishers } = await useArticles({ articleLimit: readonly(ref(10)) })
    expect(publishers.value).toEqual([])
  })

  it("articleLimit が返り値に含まれる", async () => {
    const limit = readonly(ref(20))
    const { articleLimit } = await useArticles({ articleLimit: limit })
    expect(articleLimit.value).toBe(20)
  })

  it("初期状態で page は 1 になる", async () => {
    const { page } = await useArticles({ articleLimit: readonly(ref(10)) })
    expect(page.value).toBe(1)
  })

  it("初期状態で selectedPublisher は null になる", async () => {
    const { selectedPublisher } = await useArticles({
      articleLimit: readonly(ref(10)),
    })
    expect(selectedPublisher.value).toBeNull()
  })
})
