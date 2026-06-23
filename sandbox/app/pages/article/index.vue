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
            :format-date="formatDate"
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
  const {
    articleLimit,
    selectedPublisher,
    page,
    total,
    articles,
    publishers,
    status,
    formatDate
  } = await useArticleList()
</script>
