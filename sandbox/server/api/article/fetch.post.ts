import { handleApiError } from "../../utils/handleApiError"
import { db } from "../../db"
import { generateArticleRepository } from "../../repository/article"
import { generateArticleService } from "../../service/article"
import { bodySchema } from "./schema/body-schema"

const articleService = generateArticleService(generateArticleRepository(db))

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, bodySchema.parse)

    const [articles, total, publishers] = await Promise.all([
      articleService.readArticles(body),
      articleService.countArticles({ where: body?.where }),
      articleService.readPublishers()
    ])

    return { articles, total, publishers }
  } catch (error) {
    handleApiError(error, "記事を取得できませんでした")
  }
})
