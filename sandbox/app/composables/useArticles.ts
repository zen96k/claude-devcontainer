import type { Ref } from "vue"

export const useArticles = async ({
  articleLimit
}: {
  articleLimit: Readonly<Ref<number>>
}) => {
  const route = useRoute()
  const router = useRouter()

  const _page = ref(Number(route.query.page) || 1)

  watch(
    () => {
      return route.query.page
    },
    (value) => {
      _page.value = Number(value) || 1
    }
  )

  const page = computed({
    get: () => {
      return _page.value
    },
    set: (value: number) => {
      _page.value = value
      router.push({
        query: {
          page: value === 1 ? undefined : value,
          publisher: (route.query.publisher as string) || undefined
        }
      })
    }
  })

  const selectedPublisher = computed({
    get: () => {
      return (route.query.publisher as string) || null
    },
    set: (value: string | null) => {
      _page.value = 1
      router.push({ query: { publisher: value ?? undefined } })
    }
  })

  const { data, status } = await useFetch("/api/article/fetch", {
    method: "POST",
    body: computed(() => {
      return {
        orderBy: [{ column: "publishedAt", direction: "desc" }],
        where: selectedPublisher.value
          ? [
              {
                column: "publisherName",
                operator: "eq",
                value: selectedPublisher.value
              }
            ]
          : undefined,
        limit: articleLimit.value,
        offset: (page.value - 1) * articleLimit.value
      }
    })
  })

  const articles = computed(() => {
    return data.value?.articles ?? []
  })
  const total = computed(() => {
    return data.value?.total ?? 0
  })
  const publishers = computed(() => {
    return data.value?.publishers ?? []
  })

  return { selectedPublisher, page, total, articles, publishers, status }
}
