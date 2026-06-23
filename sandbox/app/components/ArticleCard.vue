<template>
  <li
    class="hover:border-primary-400 h-44 overflow-hidden rounded-lg border border-gray-200 p-4 transition-colors"
  >
    <a
      class="group flex h-full flex-col"
      :href="article.url"
      rel="noopener noreferrer"
      target="_blank"
    >
      <h2
        class="group-hover:text-primary-500 line-clamp-3 text-base font-semibold transition-colors"
      >
        {{ article.title }}
      </h2>
      <div
        class="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500"
      >
        <span>
          From:
          <UBadge variant="soft">{{ article.publisherName }}</UBadge>
        </span>
        <span>Author: {{ article.author }}</span>
        <ClientOnly>
          <span>Published At: {{ formatDate(article.publishedAt) }}</span>
        </ClientOnly>
      </div>
    </a>
  </li>
</template>

<script setup lang="ts">
  defineProps<{
    article: {
      id: string | number
      publisherName: string
      title: string
      url: string
      author: string
      publishedAt: string | Date
    }
    formatDate: (date: string | Date) => string
  }>()
</script>
