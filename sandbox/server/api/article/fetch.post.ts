import { db } from "../../db"
import { generateArticleRepository } from "../../repository/article"
import { generateArticleService } from "../../service/article"
import { bodySchema } from "./schema/body-schema"

const articleService = generateArticleService({
  repository: generateArticleRepository({ db })
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)

  try {
    const [articles, total, publishers] = await Promise.all([
      articleService.readArticles(body),
      articleService.countArticles({ where: body?.where }),
      articleService.readPublishers()
    ])

    return { articles, total, publishers }
  } catch (error) {
    throw createError({ statusCode: 500, cause: error })
  }
})
