import { type NextRequest, NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"

const hf = new HfInference("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")

// Используем проверенные рабочие модели
const WORKING_MODELS = [
  "j-hartmann/emotion-english-distilroberta-base",
  "SamLowe/roberta-base-go_emotions",
  "nlptown/bert-base-multilingual-uncased-sentiment",
]

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Текст не предоставлен" }, { status: 400 })
    }

    const results = []

    // Тестируем все рабочие модели
    for (const model of WORKING_MODELS) {
      try {
        const result = await hf.textClassification({
          model,
          inputs: text,
        })
        results.push({
          model,
          result,
          status: "✅ Working",
        })
      } catch (error) {
        results.push({
          model,
          error: error.message,
          status: "❌ Failed",
        })
      }
    }

    return NextResponse.json({
      success: true,
      text,
      models_tested: WORKING_MODELS.length,
      working_models: results.filter((r) => r.status === "✅ Working").length,
      results,
      message: "Тест анализа эмоций с проверенными моделями",
    })
  } catch (error) {
    console.error("Emotion analysis test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        suggestion: "Проверьте подключение к Hugging Face",
      },
      { status: 500 },
    )
  }
}
