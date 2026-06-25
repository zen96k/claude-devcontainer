import { z } from "zod"

export const bodySchema = z.object({
  where: z
    .array(
      z.object({
        column: z.string(),
        operator: z.literal("eq"),
        value: z.string()
      })
    )
    .optional(),
  orderBy: z
    .array(z.object({ column: z.string(), direction: z.enum(["asc", "desc"]) }))
    .optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional()
})
