import { db } from ".."
import { publisher } from "../schema"

export const seedPublisher = async () => {
  await db
    .insert(publisher)
    .values([
      { name: "Qiita", url: "https://qiita.com/popular-items/feed.atom" },
      { name: "Zenn", url: "https://zenn.dev/feed" }
    ])
    .onConflictDoNothing()
}
