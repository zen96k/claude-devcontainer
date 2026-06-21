import { articleRepository } from "../../repository/article.repository"
import {
  generateArticleService,
  type GetArticlesOption
} from "../../service/article.service"

const articleService = generateArticleService(articleRepository)

export default defineEventHandler(async (event) => {
  const body = await readBody<GetArticlesOption>(event)
  const articles = await articleService.readArticles(body)

  return articles
})
