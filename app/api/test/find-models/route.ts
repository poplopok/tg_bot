import { NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"

const hf = new HfInference("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")

// Список популярных моделей для анализа эмоций
const MODELS_TO_TEST = [
  // Английские модели (обычно всегда доступны)
  "j-hartmann/emotion-english-distilroberta-base",
  "cardiffnlp/twitter-roberta-base-emotion-latest",
  "SamLowe/roberta-base-go_emotions",
  "nateraw/bert-base-uncased-emotion",

  // Мультиязычные модели
  "cardiffnlp/twitter-roberta-base-emotion-multilingual-latest",
  "microsoft/DialoGPT-medium",

  // Русские модели
  "cointegrated/rubert-base-cased-emotion",
  "sismetanin/rubert-base-cased-russian-emotion-detection",
  "DeepPavlov/rubert-base-cased-sentence",

  // Альтернативные модели
  "facebook/bart-large-mnli",
  "distilbert-base-uncased-finetuned-sst-2-english",
  "nlptown/bert-base-multilingual-uncased-sentiment",
]

export async function GET() {
  const results = {
    working_models: [],
    failed_models: [],
    test_text: "I am very happy today! Я очень счастлив сегодня!",
  }

  console.log("Testing models with Hugging Face API...")

  for (const model of MODELS_TO_TEST) {
    try {
      console.log(`Testing model: ${model}`)

      const result = await hf.textClassification({
        model,
        inputs: "I am happy",
      })

      results.working_models.push({
        model,
        status: "✅ Working",
        sample_result: result,
      })

      console.log(`✅ Model ${model} works!`)
    } catch (error) {
      results.failed_models.push({
        model,
        status: "❌ Failed",
        error: error.message,
      })

      console.log(`❌ Model ${model} failed: ${error.message}`)
    }
  }

  // Дополнительно попробуем найти модели через поиск
  try {
    const searchResponse = await fetch(
      "https://huggingface.co/api/models?filter=text-classification&sort=downloads&direction=-1&limit=20",
    )
    const popularModels = await searchResponse.json()

    return NextResponse.json({
      success: true,
      working_models: results.working_models,
      failed_models: results.failed_models,
      total_tested: MODELS_TO_TEST.length,
      working_count: results.working_models.length,
      popular_models_info: popularModels.slice(0, 5).map((m) => ({
        id: m.id,
        downloads: m.downloads,
        likes: m.likes,
      })),
      recommendation:
        results.working_models.length > 0
          ? `Используйте модель: ${results.working_models[0].model}`
          : "Ни одна модель не работает. Проверьте API ключ.",
    })
  } catch (searchError) {
    return NextResponse.json({
      success: true,
      working_models: results.working_models,
      failed_models: results.failed_models,
      total_tested: MODELS_TO_TEST.length,
      working_count: results.working_models.length,
      search_error: searchError.message,
      recommendation:
        results.working_models.length > 0
          ? `Используйте модель: ${results.working_models[0].model}`
          : "Ни одна модель не работает. Проверьте API ключ.",
    })
  }
}
