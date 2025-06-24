import { Bot, webhookCallback } from "grammy"
import { createClient } from "@supabase/supabase-js"

const bot = new Bot("7970844280:AAGNyTlzselT8E6XunCSqnxtvYWePd76JFk")

// ВАЖНО: Замените на ваш реальный SERVICE_ROLE ключ из Supabase Dashboard
const supabase = createClient(
  "https://ikaufpurzmxnalsaffwa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYXVmcHVyem14bmFsc2FmZndhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ0NTYyNCwiZXhwIjoyMDY0MDIxNjI0fQ.ЗАМЕНИТЕ_НА_РЕАЛЬНЫЙ_SERVICE_ROLE_КЛЮЧ",
)

// Простой анализ эмоций без внешних API
function analyzeEmotionLocal(text: string) {
  const lowerText = text.toLowerCase()

  const emotionKeywords = {
    радость: ["отлично", "супер", "здорово", "классно", "прекрасно", "😊", "😄", "👍", "🎉", "ура", "браво"],
    грусть: ["грустно", "печально", "плохо", "расстроен", "😢", "😔", "💔", "печаль"],
    гнев: ["бесит", "злость", "ярость", "достало", "идиот", "дурак", "😡", "🤬", "ненавижу"],
    страх: ["боюсь", "страшно", "паника", "ужас", "😰", "😨", "тревога"],
    нейтрально: ["нормально", "хорошо", "понятно", "ясно", "окей", "ладно"],
  }

  const toxicWords = ["идиот", "дурак", "тупой", "кретин", "говно", "херня", "бесит", "достало"]

  let maxScore = 0
  let primaryEmotion = "нейтрально"

  // Анализ эмоций
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    let score = 0
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score += 0.4
      }
    }
    if (score > maxScore) {
      maxScore = score
      primaryEmotion = emotion
    }
  }

  // Анализ токсичности
  let toxicity = 0
  for (const toxicWord of toxicWords) {
    if (lowerText.includes(toxicWord)) {
      toxicity += 0.3
    }
  }

  // Дополнительные проверки
  if (text.match(/[А-ЯЁ]{3,}/)) toxicity += 0.1 // Много заглавных букв
  if (text.match(/!{3,}/)) toxicity += 0.1 // Много восклицательных знаков

  toxicity = Math.min(toxicity, 1)

  const sentiment =
    primaryEmotion === "радость"
      ? "positive"
      : primaryEmotion === "грусть" || primaryEmotion === "гнев"
        ? "negative"
        : "neutral"

  return {
    primary_emotion: primaryEmotion,
    confidence: Math.max(maxScore, 0.6),
    toxicity: toxicity,
    sentiment: sentiment,
    explanation: "Локальный анализ по ключевым словам",
  }
}

// Сохранение в Supabase (опционально)
async function saveToSupabase(chatId: number, userId: number, username: string, text: string, analysis: any) {
  try {
    // Сохраняем сообщение
    const { data: messageData, error: messageError } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        user_id: userId,
        username: username,
        message_text: text,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (messageError) {
      console.log("⚠️ Ошибка сохранения в Supabase (продолжаем работу):", messageError.message)
      return null
    }

    // Сохраняем анализ
    await supabase.from("emotion_analysis").insert({
      message_id: messageData.id,
      primary_emotion: analysis.primary_emotion,
      confidence: analysis.confidence,
      toxicity: analysis.toxicity,
      sentiment: analysis.sentiment,
      explanation: analysis.explanation,
    })

    console.log("✅ Данные сохранены в Supabase")
    return messageData
  } catch (error) {
    console.log("⚠️ Ошибка Supabase (продолжаем работу):", error)
    return null
  }
}

// Обработчики команд
bot.command("start", async (ctx) => {
  console.log("📝 Команда /start от:", ctx.from?.username)
  await ctx.reply(
    "🤖 Привет! Я бот для анализа эмоций!\n\n" +
      "✅ Бот работает и готов к анализу\n" +
      "📝 Просто напишите любое сообщение для анализа\n\n" +
      "Команды:\n" +
      "/start - начать работу\n" +
      "/test - тест бота\n" +
      "/help - помощь",
  )
})

bot.command("test", async (ctx) => {
  console.log("🧪 Команда /test")
  await ctx.reply("✅ Бот работает отлично! Тест пройден.")
})

bot.command("help", async (ctx) => {
  await ctx.reply(
    "🔍 Как я работаю:\n\n" +
      "• Анализирую эмоции в ваших сообщениях\n" +
      "• Определяю токсичность и тональность\n" +
      "• Работаю с русским языком\n" +
      "• Использую локальный анализ по ключевым словам\n\n" +
      "💬 Просто пишите как обычно, я буду анализировать!",
  )
})

// Обработка текстовых сообщений
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text
  const chatId = ctx.chat.id
  const userId = ctx.from.id
  const username = ctx.from.username || ctx.from.first_name || "Unknown"

  console.log(`💬 Сообщение от ${username}: "${text}"`)

  try {
    // Анализируем эмоции локально
    const analysis = analyzeEmotionLocal(text)
    console.log("🧠 Анализ:", analysis)

    // Пытаемся сохранить в Supabase (не критично если не получится)
    await saveToSupabase(chatId, userId, username, text, analysis)

    // Определяем эмодзи
    const emotionEmojis: { [key: string]: string } = {
      радость: "😊",
      грусть: "😢",
      гнев: "😡",
      страх: "😰",
      нейтрально: "😐",
    }

    const emoji = emotionEmojis[analysis.primary_emotion] || "🤔"

    // Формируем ответ
    let response = `${emoji} **Эмоция**: ${analysis.primary_emotion}\n`
    response += `📊 **Уверенность**: ${Math.round(analysis.confidence * 100)}%\n`
    response += `🎭 **Тональность**: ${analysis.sentiment}\n`

    if (analysis.toxicity > 0.2) {
      response += `⚠️ **Токсичность**: ${Math.round(analysis.toxicity * 100)}%\n`
    }

    response += `🤖 ${analysis.explanation}`

    // Предупреждения
    if (analysis.toxicity > 0.6) {
      response += `\n\n🚨 **Внимание!** Высокая токсичность обнаружена.`
    } else if (analysis.toxicity > 0.3) {
      response += `\n\n⚠️ Умеренная токсичность. Будьте внимательны к тону.`
    }

    await ctx.reply(response, {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: "Markdown",
    })

    console.log("✅ Ответ отправлен")
  } catch (error) {
    console.error("❌ Ошибка:", error)
    await ctx.reply("❌ Произошла ошибка при анализе. Попробуйте позже.")
  }
})

// Обработка ошибок
bot.catch((err) => {
  console.error("🚨 Ошибка бота:", err)
})

console.log("🚀 Бот инициализирован")

export const POST = webhookCallback(bot, "std/http")

// GET для проверки
export async function GET() {
  return new Response("✅ Webhook endpoint работает!", { status: 200 })
}
