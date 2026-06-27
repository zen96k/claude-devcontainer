import { z } from "zod"

export const requestBodySchema = z.object({
  where: z
    .array(
      z.object({
        column: z.enum(["publisherName"]),
        operator: z.literal("eq"),
        value: z.string()
      })
    )
    .optional(),
  orderBy: z
    .array(
      z.object({
        column: z.enum(["publishedAt", "title", "author"]),
        direction: z.enum(["asc", "desc"])
      })
    )
    .optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional()
})
