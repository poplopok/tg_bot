import { NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"

export async function GET() {
  // Тест без API ключа (публичные модели)
  try {
    const publicResponse = await fetch(
      "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-emotion-multilingual-latest",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "I am very happy today!",
        }),
      },
    )

    if (publicResponse.ok) {
      const publicResult = await publicResponse.json()
      return NextResponse.json({
        success: true,
        test_result: publicResult,
        message: "Hugging Face работает через публичный API (без ключа)",
        method: "public_api",
      })
    }
  } catch (publicError) {
    console.log("Public API test failed:", publicError.message)
  }

  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "HUGGINGFACE_API_KEY не найден в переменных окружения",
          debug: {
            env_vars: Object.keys(process.env).filter((key) => key.includes("HUG")),
          },
        },
        { status: 400 },
      )
    }

    // Проверяем формат ключа
    if (!apiKey.startsWith("hf_")) {
      return NextResponse.json(
        {
          success: false,
          error: "API ключ должен начинаться с 'hf_'",
          current_key_start: apiKey.substring(0, 10) + "...",
        },
        { status: 400 },
      )
    }

    const hf = new HfInference(apiKey)

    // Сначала попробуем простую модель
    try {
      const simpleResult = await hf.textClassification({
        model: "cardiffnlp/twitter-roberta-base-emotion-multilingual-latest",
        inputs: "I am happy",
      })

      // Если простая модель работает, пробуем русскую
      try {
        const russianResult = await hf.textClassification({
          model: "cointegrated/rubert-base-cased-emotion",
          inputs: "Тестовое сообщение для проверки",
        })

        return NextResponse.json({
          success: true,
          test_results: {
            simple_model: simpleResult,
            russian_model: russianResult,
          },
          message: "Все модели Hugging Face работают корректно",
          api_key_valid: true,
        })
      } catch (russianError) {
        return NextResponse.json({
          success: true,
          test_results: {
            simple_model: simpleResult,
            russian_model_error: russianError.message,
          },
          message: "API ключ работает, но русская модель недоступна. Используем альтернативную модель.",
          api_key_valid: true,
          suggestion: "Русская модель может быть временно недоступна",
        })
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          api_key_format: apiKey.substring(0, 10) + "...",
          suggestion: "API ключ неверный или истек. Создайте новый на https://huggingface.co/settings/tokens",
        },
        { status: 401 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        suggestion: "Общая ошибка подключения к Hugging Face",
      },
      { status: 500 },
    )
  }
}
