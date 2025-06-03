import { NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"

export async function GET() {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "HUGGINGFACE_API_KEY не найден в переменных окружения",
        },
        { status: 400 },
      )
    }

    const hf = new HfInference(apiKey)

    // Тестируем простой запрос
    const result = await hf.textClassification({
      model: "cointegrated/rubert-base-cased-emotion",
      inputs: "Тестовое сообщение для проверки",
    })

    return NextResponse.json({
      success: true,
      test_result: result,
      message: "Hugging Face API работает корректно",
      models_tested: ["cointegrated/rubert-base-cased-emotion"],
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        suggestion: "Проверьте HUGGINGFACE_API_KEY или попробуйте позже",
      },
      { status: 500 },
    )
  }
}
