import { type NextRequest, NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Текст не предоставлен" }, { status: 400 })
    }

    // Тестируем русскоязычную модель эмоций
    const result = await hf.textClassification({
      model: "cointegrated/rubert-base-cased-emotion",
      inputs: text,
    })

    return NextResponse.json({
      success: true,
      text,
      emotions: result,
      message: "Анализ эмоций работает корректно",
    })
  } catch (error) {
    console.error("Emotion analysis test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        suggestion: "Проверьте HUGGINGFACE_API_KEY в переменных окружения",
      },
      { status: 500 },
    )
  }
}
