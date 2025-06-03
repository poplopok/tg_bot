import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Текст не предоставлен" }, { status: 400 })
    }

    // Список РАБОЧИХ моделей для тестирования
    const models = [
      {
        name: "RoBERTa Sentiment",
        id: "cardiffnlp/twitter-roberta-base-sentiment-latest",
        type: "sentiment",
      },
      {
        name: "DistilRoBERTa Emotion",
        id: "j-hartmann/emotion-english-distilroberta-base",
        type: "emotion",
      },
      {
        name: "Multilingual BERT",
        id: "nlptown/bert-base-multilingual-uncased-sentiment",
        type: "sentiment",
      },
      {
        name: "BERT Base Sentiment",
        id: "ProsusAI/finbert",
        type: "sentiment",
      },
      {
        name: "DistilBERT Emotion",
        id: "bhadresh-savani/distilbert-base-uncased-emotion",
        type: "emotion",
      },
    ]

    const results = []

    for (const model of models) {
      try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${model.id}`, {
          headers: {
            Authorization: `Bearer ${process.env.HUGGING_FACE_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: text }),
        })

        if (response.ok) {
          const data = await response.json()
          results.push({
            model: model.name,
            id: model.id,
            type: model.type,
            status: "success",
            data: data,
            available: true,
          })
        } else {
          const errorData = await response.text()
          results.push({
            model: model.name,
            id: model.id,
            type: model.type,
            status: "error",
            error: errorData,
            available: false,
          })
        }
      } catch (error) {
        results.push({
          model: model.name,
          id: model.id,
          type: model.type,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
          available: false,
        })
      }
    }

    return NextResponse.json({
      text: text,
      results: results,
      summary: {
        total: models.length,
        available: results.filter((r) => r.available).length,
        unavailable: results.filter((r) => !r.available).length,
      },
    })
  } catch (error) {
    console.error("Ошибка тестирования моделей:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
