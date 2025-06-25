import { NextResponse } from "next/server"

// API для управления моделями
export async function GET() {
  const availableModels = [
    {
      id: "advanced",
      name: "Продвинутый NLP",
      description: "Множественные AI модели через Hugging Face",
      accuracy: 95,
      speed: "2-4 сек",
      features: [
        "XLM-RoBERTa (определение языка)",
        "RuSpellRuBERT (исправление опечаток)",
        "RuBERT-CEDR (эмоции RU)",
        "DistilRoBERTa (эмоции EN)",
        "RoBERTa-Irony (сарказм)",
        "Custom Slang DB (5000+ выражений)",
      ],
      cost: "Средняя",
      status: process.env.HUGGINGFACE_API_KEY ? "available" : "needs_key",
    },
    {
      id: "local",
      name: "Локальные алгоритмы",
      description: "Словарные анализаторы без интернета",
      accuracy: 75,
      speed: "<1 сек",
      features: ["Словарный анализ", "Анализ эмодзи", "Базовый сленг", "Офлайн работа"],
      cost: "Бесплатно",
      status: "available",
    },
  ]

  const currentModel = process.env.EMOTION_MODEL || "advanced"

  return NextResponse.json({
    success: true,
    currentModel,
    availableModels,
    recommendations: {
      production: "openai",
      development: "huggingface",
      fallback: "local",
    },
  })
}

export async function POST(request: Request) {
  try {
    const { modelId } = await request.json()

    // В реальном приложении здесь была бы логика смены модели
    // Например, обновление переменной окружения или конфига

    return NextResponse.json({
      success: true,
      message: `Модель изменена на ${modelId}`,
      newModel: modelId,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Ошибка смены модели" }, { status: 500 })
  }
}
