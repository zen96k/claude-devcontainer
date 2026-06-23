import "dotenv/config"
import { sql } from "drizzle-orm"
import RssParser from "rss-parser"
import { db } from "../db"
import { article, publisher } from "../db/schema"

const parser = new RssParser<object, { author?: string }>()
const publishers = await db.select().from(publisher)

const allItems = (
  await Promise.all(
    publishers.map(async (publisher) => {
      console.log(`Fetching articles from ${publisher.name}...`)
      const feed = await parser.parseURL(publisher.url)
      const items = feed.items.flatMap((item) => {
        const title = item.title
        const url = item.link
        const author = item.author ?? item.creator
        const publishedAt = item.pubDate ? new Date(item.pubDate) : null

        if (!title || !url || !author || !publishedAt) {
          console.warn(
            `Skipping article from ${publisher.name} due to missing required fields: ${JSON.stringify(
              item
            )}`
          )
          return []
        } else {
          return [
            { publisherId: publisher.id, title, url, author, publishedAt }
          ]
        }
      })
      console.log(`Fetched ${items.length} articles from ${publisher.name}.`)

      return items
    })
  )
).flatMap((items) => {
  return items
})

await db.transaction((transaction) => {
  return transaction
    .insert(article)
    .values(allItems)
    .onConflictDoUpdate({
      target: article.url,
      set: {
        title: sql`excluded.title`,
        author: sql`excluded.author`,
        publishedAt: sql`excluded.published_at`,
        updatedAt: sql`(unixepoch())`
      }
    })
})
