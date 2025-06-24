import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

const EmotionAnalysisSchema = z.object({
  emotions: z.array(
    z.object({
      emotion: z.string(),
      confidence: z.number().min(0).max(100),
      emoji: z.string(),
    }),
  ),
  sentiment: z.enum(["positive", "negative", "neutral"]),
  toxicity: z.number().min(0).max(100),
  corporateTerms: z.array(z.string()),
  recommendation: z.string(),
})

async function sendMessage(chatId: number, text: string, replyToMessageId?: number) {
  const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_to_message_id: replyToMessageId,
      parse_mode: "HTML",
    }),
  })

  return response.json()
}

async function analyzeEmotion(text: string) {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: EmotionAnalysisSchema,
      prompt: `
Проанализируй эмоции в этом сообщении из корпоративного чата:

"${text}"

Определи:
1. Основные эмоции с уверенностью (0-100) и подходящими эмодзи
2. Общую тональность (positive/negative/neutral)  
3. Уровень токсичности (0-100)
4. Корпоративные термины (дедлайн, деплой, фича, ASAP, etc.)
5. Краткую рекомендацию (1-2 предложения)

Учитывай эмодзи, сарказм, корпоративный сленг.
`,
    })

    return object
  } catch (error) {
    console.error("Ошибка анализа:", error)
    return null
  }
}

function formatAnalysisResult(analysis: any, originalText: string) {
  const emotionsText = analysis.emotions.map((e: any) => `${e.emoji} <b>${e.emotion}</b> (${e.confidence}%)`).join("\n")

  const sentimentEmoji = {
    positive: "✅",
    negative: "❌",
    neutral: "⚪",
  }[analysis.sentiment]

  const toxicityEmoji = analysis.toxicity > 70 ? "🚨" : analysis.toxicity > 40 ? "⚠️" : "✅"

  return `
🧠 <b>Анализ эмоций:</b>

📝 <b>Сообщение:</b> "${originalText.length > 100 ? originalText.substring(0, 100) + "..." : originalText}"

😊 <b>Эмоции:</b>
${emotionsText}

${sentimentEmoji} <b>Тональность:</b> ${analysis.sentiment === "positive" ? "Позитивная" : analysis.sentiment === "negative" ? "Негативная" : "Нейтральная"}

${toxicityEmoji} <b>Токсичность:</b> ${analysis.toxicity}%

${analysis.corporateTerms.length > 0 ? `💼 <b>Корпоративные термины:</b> ${analysis.corporateTerms.join(", ")}` : ""}

💡 <b>Рекомендация:</b> ${analysis.recommendation}
`.trim()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Проверяем, что это сообщение
    if (!body.message) {
      return NextResponse.json({ ok: true })
    }

    const message = body.message
    const chatId = message.chat.id
    const messageId = message.message_id
    const text = message.text

    // Игнорируем команды бота и сообщения без текста
    if (!text || text.startsWith("/")) {
      return NextResponse.json({ ok: true })
    }

    // Команды бота
    if (text === "/start") {
      await sendMessage(
        chatId,
        `🤖 <b>Привет! Я бот для анализа эмоций в корпоративных чатах.</b>

📋 <b>Что я умею:</b>
• Анализирую эмоции в сообщениях
• Определяю тональность и токсичность
• Распознаю корпоративный сленг
• Даю рекомендации по коммуникации

💬 <b>Как использовать:</b>
• Просто отправьте любое сообщение для анализа
• Или ответьте на сообщение командой /analyze

🔧 <b>Команды:</b>
/help - помощь
/analyze - анализ сообщения (ответом на сообщение)
/stats - статистика чата (скоро)

Начните писать, и я проанализирую ваши эмоции! 😊`,
      )
      return NextResponse.json({ ok: true })
    }

    if (text === "/help") {
      await sendMessage(
        chatId,
        `📖 <b>Помощь по боту анализа эмоций</b>

🎯 <b>Основные функции:</b>
• Автоматический анализ всех сообщений в чате
• Определение эмоций: радость, грусть, гнев, страх и др.
• Оценка тональности и уровня токсичности
• Распознавание корпоративного сленга

⚙️ <b>Команды:</b>
• <code>/analyze</code> - анализ конкретного сообщения (ответьте на сообщение)
• <code>/help</code> - эта справка
• <code>/start</code> - приветствие

🔍 <b>Примеры анализа:</b>
• "Опять дедлайн горит! 😤" → Стресс, негатив
• "Отличная работа команды! 🎉" → Радость, позитив
• "Нужно срочно пофиксить баг" → Нейтрально, рабочий контекст

💡 <b>Совет:</b> Используйте результаты для улучшения атмосферы в команде!`,
      )
      return NextResponse.json({ ok: true })
    }

    // Анализ по команде /analyze (ответ на сообщение)
    if (text === "/analyze" && message.reply_to_message) {
      const targetText = message.reply_to_message.text
      if (!targetText) {
        await sendMessage(chatId, "❌ Не могу проанализировать сообщение без текста.")
        return NextResponse.json({ ok: true })
      }

      const analysis = await analyzeEmotion(targetText)
      if (!analysis) {
        await sendMessage(chatId, "❌ Ошибка при анализе сообщения. Попробуйте позже.")
        return NextResponse.json({ ok: true })
      }

      const result = formatAnalysisResult(analysis, targetText)
      await sendMessage(chatId, result, message.reply_to_message.message_id)
      return NextResponse.json({ ok: true })
    }

    // Автоматический анализ обычных сообщений (только если длина > 10 символов)
    if (text.length > 10) {
      const analysis = await analyzeEmotion(text)
      if (analysis) {
        // Отправляем анализ только если есть выраженные эмоции или высокая токсичность
        const hasStrongEmotions = analysis.emotions.some((e: any) => e.confidence > 60)
        const isHighToxicity = analysis.toxicity > 50

        if (hasStrongEmotions || isHighToxicity) {
          const result = formatAnalysisResult(analysis, text)
          await sendMessage(chatId, result, messageId)
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Ошибка webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
