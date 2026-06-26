import { db } from "../../db"
import { summarizeArticle } from "./gemini"
import { generateArticleSummaryRepository } from "./repository"
import { generateArticleSummaryService } from "./service"

const articleLimit = 10

const articleSummaryService = generateArticleSummaryService({
  repository: generateArticleSummaryRepository({ db }),
  summarizeArticle
})

const pendingArticles = await articleSummaryService.readPendingArticles({
  limit: articleLimit
})

if (!pendingArticles.length) {
  console.log("要約対象の記事はありません")
} else {
  console.log(`${pendingArticles.length} 件の記事を要約します`)
}

for (const article of pendingArticles) {
  try {
    await articleSummaryService.summarizeArticle({ article })
  } catch (error) {
    console.error(`${article.title} の要約に失敗しました:`, error)
    await articleSummaryService.markArticleSummaryStatusFailed({
      articleId: article.id,
      error
    })
  }
}
