import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Текст не предоставлен" }, { status: 400 })
    }

    // Тестируем OpenAI
    const { text: result } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: `Проанализируй эмоции в этом тексте на русском языке: "${text}". Ответь в формате JSON: {"emotion": "эмоция", "confidence": 0.8, "sentiment": "positive/negative/neutral", "toxicity": 0.1}`,
      apiKey:
        "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",
    })

    return NextResponse.json({
      text: text,
      openai_result: result,
      status: "success",
    })
  } catch (error) {
    console.error("Ошибка OpenAI:", error)
    return NextResponse.json(
      {
        error: "Ошибка OpenAI API",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
