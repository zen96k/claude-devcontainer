import { Readability } from "@mozilla/readability"
import { JSDOM } from "jsdom"
import { createHash } from "node:crypto"
import { ofetch } from "ofetch"

const fetchTimeoutMilliSeconds = 15_000

export const fetchHtml = async ({ url }: { url: string }) => {
  return await ofetch(url, {
    headers: { "user-agent": "sandbox-article-summary-bot/1.0" },
    timeout: fetchTimeoutMilliSeconds,
    responseType: "text"
  })
}

export const extractText = ({ html, url }: { html: string; url: string }) => {
  const dom = new JSDOM(html, { url })
  const parsedArticle = new Readability(dom.window.document).parse()
  const text = parsedArticle?.textContent

  if (!text) {
    throw new Error("Readabilityで本文を抽出できませんでした")
  }

  const normalizedText = text.replace(/\s+/g, " ").trim()

  if (!normalizedText) {
    throw new Error("本文の正規化後テキストが空です")
  }

  return normalizedText
}

export const generateContentHash = ({ text }: { text: string }) => {
  return createHash("sha256").update(text).digest("hex")
}
