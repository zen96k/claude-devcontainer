import type { Ref } from "vue"

export const useArticles = async ({
  articleLimit
}: {
  articleLimit: Readonly<Ref<number>>
}) => {
  const route = useRoute()
  const router = useRouter()
  const page = ref(Number(route.query.page) || 1)

  const selectedPublisher = ref<string | null>(
    (route.query.publisher as string) || null
  )

  watch(
    () => {
      return route.query.page
    },
    (value) => {
      page.value = Number(value) || 1
    }
  )

  watch(
    () => {
      return route.query.publisher
    },
    (value) => {
      selectedPublisher.value = (value as string) || null
    }
  )

  watch(page, (value) => {
    router.replace({
      query: {
        page: value === 1 ? undefined : value,
        publisher: selectedPublisher.value ?? undefined
      }
    })
  })

  watch(selectedPublisher, (value) => {
    page.value = 1
    router.replace({ query: { publisher: value ?? undefined } })
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

  return {
    selectedPublisher,
    page,
    total,
    articles,
    publishers,
    status
  }
}
