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
      記事を取得できませんでした
    </div>
    <template v-else>
      <ArticlePublisherFilter
        v-model="selectedPublisher"
        :publishers="publishers"
      />
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
        <UPageGrid as="ul">
          <ArticleCard
            v-for="article in articles"
            :key="article.id"
            :article="article"
          />
        </UPageGrid>
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
  import { breakpointsTailwind } from "@vueuse/core"

  const requestUrl = useRequestURL()

  useSeoMeta({
    title: "Sandbox | 記事一覧",
    description: "Qiita/Zennの個人用RSSリーダー",
    ogTitle: "Sandbox | 記事一覧",
    ogDescription: "Qiita/Zennの個人用RSSリーダー",
    ogType: "website",
    ogUrl: `${requestUrl.origin}/article`,
    ogImage: `${requestUrl.origin}/ogp.png`,
    twitterCard: "summary_large_image"
  })

  const breakpoints = useBreakpoints(breakpointsTailwind, { ssrWidth: 768 })
  const isDesktop = breakpoints.greaterOrEqual("lg")
  const articleLimit = computed(() => {
    return isDesktop.value ? 15 : 10
  })

  const { selectedPublisher, page, total, articles, publishers, status } =
    await useArticles({ articleLimit })
</script>
