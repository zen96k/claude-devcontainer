import { mockNuxtImport } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { nextTick, readonly, ref } from "vue"

// useFetch のみモック（useRoute/useRouter は Nuxt テスト環境の実物を使う）
const mockUseFetchFn = vi.hoisted(() => {
  return vi.fn()
})
mockNuxtImport("useFetch", () => {
  return mockUseFetchFn
})

const defaultFetchResult = () => {
  return {
    data: ref({
      articles: [
        {
          id: 1,
          title: "テスト記事",
          publisherName: "Zenn",
          url: "https://example.com",
          author: "author",
          publishedAt: "2026-01-01"
        }
      ],
      total: 1,
      publishers: [{ id: 1, name: "Zenn" }]
    }),
    status: ref("success")
  }
}

describe("useArticles", () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockUseFetchFn.mockReturnValue(defaultFetchResult())
    await useRouter().replace({ query: {} })
  })

  test("articles が data.articles を返す", async () => {
    const { articles } = await useArticles({ articleLimit: readonly(ref(10)) })
    expect(articles.value).toHaveLength(1)
    expect(articles.value[0]!.title).toBe("テスト記事")
  })

  test("total が data.total を返す", async () => {
    const { total } = await useArticles({ articleLimit: readonly(ref(10)) })
    expect(total.value).toBe(1)
  })

  test("publishers が data.publishers を返す", async () => {
    const { publishers } = await useArticles({
      articleLimit: readonly(ref(10))
    })
    expect(publishers.value).toEqual([{ id: 1, name: "Zenn" }])
  })

  test("data が null のとき articles は空配列を返す", async () => {
    mockUseFetchFn.mockReturnValue({ data: ref(null), status: ref("idle") })
    const { articles } = await useArticles({ articleLimit: readonly(ref(10)) })
    expect(articles.value).toEqual([])
  })

  test("data が null のとき total は 0 を返す", async () => {
    mockUseFetchFn.mockReturnValue({ data: ref(null), status: ref("idle") })
    const { total } = await useArticles({ articleLimit: readonly(ref(10)) })
    expect(total.value).toBe(0)
  })

  test("data が null のとき publishers は空配列を返す", async () => {
    mockUseFetchFn.mockReturnValue({ data: ref(null), status: ref("idle") })
    const { publishers } = await useArticles({
      articleLimit: readonly(ref(10))
    })
    expect(publishers.value).toEqual([])
  })

  test("初期状態で page は 1 になる", async () => {
    const { page } = await useArticles({ articleLimit: readonly(ref(10)) })
    expect(page.value).toBe(1)
  })

  test("初期状態で selectedPublisher は null になる", async () => {
    const { selectedPublisher } = await useArticles({
      articleLimit: readonly(ref(10))
    })
    expect(selectedPublisher.value).toBeNull()
  })

  test("status が返り値に含まれる", async () => {
    const { status } = await useArticles({ articleLimit: readonly(ref(10)) })
    expect(status.value).toBe("success")
  })

  // ルートクエリによる初期化
  test("route.query.page=3 のとき page が 3 で初期化される", async () => {
    await useRouter().replace({ query: { page: "3" } })
    const { page } = await useArticles({ articleLimit: readonly(ref(10)) })
    expect(page.value).toBe(3)
  })

  test("route.query.publisher=Zenn のとき selectedPublisher が Zenn で初期化される", async () => {
    await useRouter().replace({ query: { publisher: "Zenn" } })
    const { selectedPublisher } = await useArticles({
      articleLimit: readonly(ref(10))
    })
    expect(selectedPublisher.value).toBe("Zenn")
  })

  // route.query → state のウォッチャー
  test("route.query.page が変わると page が追従する", async () => {
    const router = useRouter()
    const { page } = await useArticles({ articleLimit: readonly(ref(10)) })
    expect(page.value).toBe(1)

    await router.push({ query: { page: "5" } })
    await nextTick()
    expect(page.value).toBe(5)
  })

  test("route.query.publisher が変わると selectedPublisher が追従する", async () => {
    const router = useRouter()
    const { selectedPublisher } = await useArticles({
      articleLimit: readonly(ref(10))
    })
    expect(selectedPublisher.value).toBeNull()

    await router.push({ query: { publisher: "Qiita" } })
    await nextTick()
    expect(selectedPublisher.value).toBe("Qiita")
  })

  // state → router.replace のウォッチャー
  test("page が 2 に変わると URL クエリに page=2 が反映される", async () => {
    const router = useRouter()
    const { page } = await useArticles({ articleLimit: readonly(ref(10)) })

    page.value = 2
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.query.page).toBe("2")
  })

  test("page が 1 になると URL クエリから page が除去される", async () => {
    const router = useRouter()
    await router.replace({ query: { page: "3" } })
    const { page } = await useArticles({ articleLimit: readonly(ref(10)) })
    expect(page.value).toBe(3)

    page.value = 1
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.query.page).toBeUndefined()
  })

  test("selectedPublisher が変わると page が 1 にリセットされる", async () => {
    const router = useRouter()
    await router.replace({ query: { page: "3" } })
    const { page, selectedPublisher } = await useArticles({
      articleLimit: readonly(ref(10))
    })
    expect(page.value).toBe(3)

    selectedPublisher.value = "Zenn"
    await nextTick()

    expect(page.value).toBe(1)
  })

  test("selectedPublisher が変わると router.push に publisher が渡される", async () => {
    const router = useRouter()
    const pushSpy = vi.spyOn(router, "push")
    const { selectedPublisher } = await useArticles({
      articleLimit: readonly(ref(10))
    })

    selectedPublisher.value = "Zenn"
    await nextTick()

    expect(pushSpy).toHaveBeenCalledWith({ query: { publisher: "Zenn" } })
  })

  // useFetch のリクエストボディ
  test("useFetch が /api/article/fetch に POST で呼ばれる", async () => {
    await useArticles({ articleLimit: readonly(ref(10)) })
    expect(mockUseFetchFn.mock.calls[0]![0]).toBe("/api/article/fetch")
    expect(mockUseFetchFn.mock.calls[0]![1].method).toBe("POST")
  })

  test("selectedPublisher なしのとき useFetch body に where 句が含まれない", async () => {
    await useArticles({ articleLimit: readonly(ref(10)) })
    const body = mockUseFetchFn.mock.calls[0]![1].body
    expect(body.value.where).toBeUndefined()
  })

  test("selectedPublisher ありのとき useFetch body に publisherName の where 句が含まれる", async () => {
    await useRouter().replace({ query: { publisher: "Zenn" } })
    await useArticles({ articleLimit: readonly(ref(10)) })
    const body = mockUseFetchFn.mock.calls[0]![1].body
    expect(body.value.where).toEqual([
      { column: "publisherName", operator: "eq", value: "Zenn" }
    ])
  })

  test("page=3・limit=10 のとき offset が 20 になる", async () => {
    await useRouter().replace({ query: { page: "3" } })
    await useArticles({ articleLimit: readonly(ref(10)) })
    const body = mockUseFetchFn.mock.calls[0]![1].body
    expect(body.value.offset).toBe(20)
  })
})
