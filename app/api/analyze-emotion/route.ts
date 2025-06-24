import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const EmotionAnalysisSchema = z.object({
  language: z.enum(["ru", "en"]),
  emotions: z.array(
    z.object({
      emotion: z.string(),
      confidence: z.number().min(0).max(100),
      color: z.string(),
      description: z.string(),
    }),
  ),
  sentiment: z.enum(["positive", "negative", "neutral"]),
  toxicity: z.number().min(0).max(100),
  corporateTerms: z.array(z.string()),
  recommendations: z.array(z.string()),
})

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Текст не предоставлен" }, { status: 400 })
    }

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: EmotionAnalysisSchema,
      prompt: `
Проанализируй следующий текст на предмет эмоций, как если бы это было сообщение в корпоративном чате:

"${text}"

Определи:
1. Язык текста (ru или en)
2. Основные эмоции с уровнем уверенности (0-100):
   - Для русского: радость, грусть, гнев, страх, удивление, отвращение, нейтральность
   - Для английского: joy, sadness, anger, fear, surprise, disgust, neutral
3. Общую тональность (positive/negative/neutral)
4. Уровень токсичности (0-100, где 100 - максимально токсично)
5. Корпоративные термины и сленг (дедлайн, деплой, фича, ASAP, etc.)
6. Рекомендации для улучшения коммуникации

Учитывай:
- Эмодзи и их эмоциональную окраску
- Сарказм и иронию
- Корпоративный контекст
- Пунктуацию и регистр букв
- Подтекст и скрытые эмоции

Для цветов эмоций используй:
- Радость/Joy: text-yellow-600
- Грусть/Sadness: text-blue-600  
- Гнев/Anger: text-red-600
- Страх/Fear: text-purple-600
- Удивление/Surprise: text-orange-600
- Отвращение/Disgust: text-green-600
- Нейтральность/Neutral: text-gray-600
`,
    })

    return NextResponse.json({
      text,
      ...object,
    })
  } catch (error) {
    console.error("Ошибка анализа эмоций:", error)
    return NextResponse.json({ error: "Ошибка при анализе текста" }, { status: 500 })
  }
}
