<template>
  <UContainer class="py-8">
    <h1 class="mb-6 text-2xl font-bold">記事一覧</h1>
    <div
      v-if="status === 'pending'"
      class="flex justify-center py-12"
    >
      <UIcon
        class="animate-spin text-4xl text-gray-400"
        name="i-lucide-loader-circle"
      />
    </div>
    <div
      v-else-if="status === 'error'"
      class="py-12 text-center text-gray-500"
    >
      エラーが発生しました
    </div>
    <template v-else>
      <div class="mb-4 flex flex-wrap gap-2">
        <UButton
          :variant="selectedPublisher === null ? 'solid' : 'ghost'"
          @click="selectedPublisher = null"
        >
          全て
        </UButton>
        <UButton
          v-for="p in publishers"
          :key="p.id"
          :variant="selectedPublisher === p.name ? 'solid' : 'ghost'"
          @click="selectedPublisher = p.name"
        >
          {{ p.name }}
        </UButton>
      </div>
      <div
        v-if="!articles.length"
        class="py-12 text-center text-gray-500"
      >
        記事がありません
      </div>
      <template v-else>
        <div class="mb-4 flex justify-center">
          <UPagination
            v-model:page="page"
            :items-per-page="articleLimit"
            :total="total"
          />
        </div>
        <ul class="space-y-4">
          <li
            v-for="article in articles"
            :key="article.id"
            class="hover:border-primary-400 rounded-lg border border-gray-200 p-4 transition-colors"
          >
            <a
              class="group block"
              :href="article.url"
              rel="noopener noreferrer"
              target="_blank"
            >
              <h2
                class="group-hover:text-primary-500 mb-1 text-base font-semibold transition-colors"
              >
                {{ article.title }}
              </h2>
              <div class="flex items-center gap-3 text-sm text-gray-500">
                <span>
                  From:
                  <UBadge variant="soft">
                    {{ article.publisherName }}
                  </UBadge>
                </span>
                <span>Author: {{ article.author }}</span>
                <ClientOnly>
                  <span>
                    Published At: {{ formatDate(article.publishedAt) }}
                  </span>
                </ClientOnly>
              </div>
            </a>
          </li>
        </ul>
        <div class="mt-8 flex justify-center">
          <UPagination
            v-model:page="page"
            :items-per-page="articleLimit"
            :total="total"
          />
        </div>
      </template>
    </template>
  </UContainer>
</template>

<script setup lang="ts">
  import { format } from "@formkit/tempo"

  const route = useRoute()
  const router = useRouter()
  const page = ref(Number(route.query.page) || 1)
  const selectedPublisher = ref<string | null>(
    (route.query.publisher as string) || null
  )
  const articleLimit = 10

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
    body: computed(() => ({
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
      limit: articleLimit,
      offset: (page.value - 1) * articleLimit
    }))
  })

  const articles = computed(() => data.value?.articles ?? [])
  const total = computed(() => data.value?.total ?? 0)
  const publishers = computed(() => data.value?.publishers ?? [])

  const formatDate = (date: string | Date) =>
    format(new Date(date), "YYYY-MM-DD HH:mm:ss")
</script>
