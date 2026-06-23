import { format } from "@formkit/tempo"

export const useArticleList = async () => {
  const route = useRoute()
  const router = useRouter()
  const page = ref(Number(route.query.page) || 1)

  const selectedPublisher = ref<string | null>(
    (route.query.publisher as string) || null
  )

  const articleLimit = ref(10)
  const updateArticleLimit = ({ matches }: Pick<MediaQueryList, "matches">) => {
    articleLimit.value = matches ? 15 : 10
  }

  let desktopMediaQuery: MediaQueryList | undefined

  onMounted(() => {
    desktopMediaQuery = window.matchMedia("(min-width: 1024px)")
    updateArticleLimit(desktopMediaQuery)
    desktopMediaQuery.addEventListener("change", updateArticleLimit)
  })

  onUnmounted(() => {
    desktopMediaQuery?.removeEventListener("change", updateArticleLimit)
  })

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

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "YYYY-MM-DD HH:mm:ss")
  }

  return {
    articleLimit,
    selectedPublisher,
    page,
    total,
    articles,
    publishers,
    status,
    formatDate
  }
}
