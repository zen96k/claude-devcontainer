import { GoogleGenAI } from "@google/genai"
import "dotenv/config"

const geminiApiKey = process.env.GEMINI_API_KEY
const geminiModel = "gemini-2.5-flash"
const maxContentCharacterLength = 20_000

if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY が未設定です")
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey })

export const summarizeArticle = async ({
  title,
  text
}: {
  title: string
  text: string
}) => {
  const sourceText = text.slice(0, maxContentCharacterLength)
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: [
      "次の記事本文を日本語で簡潔に要約してください。",
      "要約は3〜5個の箇条書きにしてください。",
      "本文に書かれていない推測は含めないでください。",
      "",
      `タイトル: ${title}`,
      "",
      sourceText
    ].join("\n")
  })
  const summary = response.text?.trim()

  if (!summary) {
    throw new Error("Geminiの要約が空です")
  }

  return summary
}
