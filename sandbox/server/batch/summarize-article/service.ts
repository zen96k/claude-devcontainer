import type { summarizeArticle as SummarizeFn } from "./gemini"
import type { generateArticleSummaryRepository } from "./repository"
import { extractText, fetchHtml, generateContentHash } from "./scraper"

const processingTimeoutSeconds = 3600

export type ArticleSummaryRepository = ReturnType<
  typeof generateArticleSummaryRepository
>

type PendingArticle = Awaited<
  ReturnType<ArticleSummaryRepository["readPendingArticles"]>
>[number]

export const generateArticleSummaryService = ({
  repository,
  summarizeArticle
}: {
  repository: ArticleSummaryRepository
  summarizeArticle: typeof SummarizeFn
}) => {
  return {
    readPendingArticles: async ({ limit }: { limit?: number } = {}) => {
      const timeoutAt = new Date(Date.now() - processingTimeoutSeconds * 1000)

      return await repository.readPendingArticles({ timeoutAt, limit })
    },

    summarizeArticle: async ({ article }: { article: PendingArticle }) => {
      await repository.markArticleSummaryStatusProcessing({
        articleId: article.id
      })

      const html = await fetchHtml({ url: article.url })
      const text = extractText({ html, url: article.url })
      const contentHash = generateContentHash({ text })

      if (article.summary && article.contentHash === contentHash) {
        await repository.markArticleSummaryStatusSkipped({
          articleId: article.id
        })
        console.log(
          `${article.title} は本文に変更がないため要約をスキップしました`
        )
      } else {
        const summary = await summarizeArticle({ title: article.title, text })
        await repository.markArticleSummaryStatusCompleted({
          articleId: article.id,
          contentHash,
          summary
        })
        console.log(`${article.title} の要約を更新しました`)
      }
    },

    markArticleSummaryStatusFailed: async ({
      articleId,
      error
    }: {
      articleId: number
      error: unknown
    }) => {
      return await repository.markArticleSummaryStatusFailed({
        articleId,
        error
      })
    }
  }
}
