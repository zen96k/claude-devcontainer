import type { Article, Publisher, ReadOption } from "../../repository/article"

export type ArticleRepository = {
  readArticles(option?: ReadOption): Promise<Article[]>
  countArticles(option?: ReadOption): Promise<number>
  readPublishers(): Promise<Publisher[]>
}

export const generateArticleService = ({
  repository
}: {
  repository: ArticleRepository
}) => {
  return {
    readArticles: async (option?: ReadOption): Promise<Article[]> => {
      return await repository.readArticles(option)
    },

    countArticles: async (option?: ReadOption): Promise<number> => {
      return await repository.countArticles(option)
    },

    readPublishers: async (): Promise<Publisher[]> => {
      return await repository.readPublishers()
    }
  }
}
