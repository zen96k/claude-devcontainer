export function handleApiError(error: unknown, message: string): never {
  switch (isError(error) && error.statusCode) {
    case 422:
      throw createError({
        statusCode: 422,
        message: "リクエストの形式が正しくありません"
      })
    default:
      throw createError({ statusCode: 500, message, cause: error })
  }
}
