/// <reference types="node" />
import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./drizzle",
  schema: "./server/db/schema/index.ts",
  dialect: "sqlite",
  dbCredentials: { url: process.env.DB_FILE_NAME! }
})
