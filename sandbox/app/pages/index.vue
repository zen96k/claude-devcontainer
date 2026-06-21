<template>
  <UContainer class="py-8">
    <h1 class="mb-6 text-2xl font-bold">人気記事</h1>
    <div
      v-if="status === 'pending'"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="animate-spin text-4xl text-gray-400"
      />
    </div>
    <div
      v-else-if="!articles?.length"
      class="py-12 text-center text-gray-500"
    >
      記事がありません
    </div>
    <ul
      v-else
      class="space-y-4"
    >
      <li
        v-for="article in articles"
        :key="article.id"
        class="hover:border-primary-400 rounded-lg border border-gray-200 p-4 transition-colors"
      >
        <a
          :href="article.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group block"
        >
          <h2
            class="group-hover:text-primary-500 mb-1 text-base font-semibold transition-colors"
          >
            {{ article.title }}
          </h2>
          <div class="flex items-center gap-3 text-sm text-gray-500">
            <UBadge
              variant="soft"
              size="xs"
            >
              {{ article.publisherName }}
            </UBadge>
            <span>{{ article.author }}</span>
            <ClientOnly>
              <span>{{ formatDate(article.publishedAt) }}</span>
            </ClientOnly>
          </div>
        </a>
      </li>
    </ul>
  </UContainer>
</template>

<script setup lang="ts">
  import { format } from "@formkit/tempo"

  const { data: articles, status } = await useFetch("/api/article/fetch", {
    method: "POST",
    body: { orderBy: [{ column: "publishedAt", direction: "desc" }] }
  })

  const formatDate = (date: string | Date) => format(new Date(date), "long")
</script>
