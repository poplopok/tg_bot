import { Bot, webhookCallback } from "grammy"
import { createClient } from "@supabase/supabase-js"

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!)

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Рабочие Hugging Face модели (проверенные)
const WORKING_MODELS = {
  sentiment: [
    "cardiffnlp/twitter-roberta-base-sentiment-latest", // Работает стабильно
    "nlptown/bert-base-multilingual-uncased-sentiment", // Мультиязычная
    "j-hartmann/emotion-english-distilroberta-base", // Эмоции
  ],
  toxicity: [
    "unitary/toxic-bert", // Альтернатива для токсичности
    "martin-ha/toxic-classification-distilBERT", // Если доступна
  ],
  russian: [
    "blanchefort/rubert-base-cased-sentiment", // Русский язык
    "DeepPavlov/rubert-base-cased-sentence", // DeepPavlov
  ],
}

// Анализ эмоций с рабочими моделями
async function analyzeEmotionHF(text: string) {
  try {
    // Пробуем модели по очереди
    const modelsToTry = [
      "cardiffnlp/twitter-roberta-base-sentiment-latest",
      "j-hartmann/emotion-english-distilroberta-base",
      "nlptown/bert-base-multilingual-uncased-sentiment",
    ]

    let emotionResult = null
    let usedModel = ""

    for (const model of modelsToTry) {
      try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          headers: {
            Authorization: `Bearer ${process.env.HUGGING_FACE_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: text }),
        })

        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
            emotionResult = data[0]
            usedModel = model
            break
          }
        }
      } catch (error) {
        console.log(`Модель ${model} недоступна, пробуем следующую...`)
        continue
      }
    }

    if (!emotionResult) {
      return analyzeEmotionFallback(text)
    }

    // Обработка результатов
    const topResult = emotionResult[0]
    let primaryEmotion = "нейтрально"
    const confidence = topResult.score || 0.5
    let sentiment = "neutral"

    // Маппинг результатов разных моделей
    const label = topResult.label.toLowerCase()

    if (label.includes("positive") || label.includes("joy") || label.includes("happiness")) {
      primaryEmotion = "радость"
      sentiment = "positive"
    } else if (label.includes("negative") || label.includes("sadness") || label.includes("anger")) {
      primaryEmotion = "грусть"
      sentiment = "negative"
    } else if (label.includes("anger") || label.includes("disgust")) {
      primaryEmotion = "гнев"
      sentiment = "negative"
    } else if (label.includes("fear")) {
      primaryEmotion = "страх"
      sentiment = "negative"
    } else if (label.includes("surprise")) {
      primaryEmotion = "удивление"
      sentiment = "neutral"
    } else {
      primaryEmotion = "нейтрально"
      sentiment = "neutral"
    }

    // Простая детекция токсичности по ключевым словам (так как HF модели токсичности не работают)
    const toxicity = calculateToxicity(text)

    return {
      primary_emotion: primaryEmotion,
      confidence: confidence,
      toxicity: toxicity,
      sentiment: sentiment,
      explanation: `Анализ: ${usedModel.split("/")[1]} (${Math.round(confidence * 100)}%)`,
    }
  } catch (error) {
    console.error("Ошибка анализа HF:", error)
    return analyzeEmotionFallback(text)
  }
}

// Расчет токсичности по ключевым словам
function calculateToxicity(text: string): number {
  const lowerText = text.toLowerCase()
  const toxicWords = [
    // Русские токсичные слова
    "идиот",
    "дурак",
    "тупой",
    "кретин",
    "дебил",
    "урод",
    "мразь",
    "говно",
    "херня",
    "бесит",
    "достало",
    "ненавижу",
    // Английские
    "stupid",
    "idiot",
    "hate",
    "damn",
    "shit",
  ]

  let toxicity = 0
  for (const word of toxicWords) {
    if (lowerText.includes(word)) {
      toxicity += 0.25
    }
  }

  // Дополнительные паттерны
  if (text.match(/[А-ЯЁ]{3,}/)) toxicity += 0.1 // Много заглавных букв
  if (text.match(/!{3,}/)) toxicity += 0.1 // Много восклицательных знаков
  if (text.match(/\?{3,}/)) toxicity += 0.05 // Много вопросительных знаков

  return Math.min(toxicity, 1)
}

// Fallback анализ эмоций по ключевым словам
function analyzeEmotionFallback(text: string) {
  const lowerText = text.toLowerCase()

  const emotionKeywords = {
    радость: [
      "отлично",
      "супер",
      "здорово",
      "классно",
      "прекрасно",
      "замечательно",
      "круто",
      "ура",
      "браво",
      "😊",
      "😄",
      "👍",
      "🎉",
      "💪",
    ],
    грусть: ["грустно", "печально", "плохо", "расстроен", "огорчен", "тоскливо", "😢", "😔", "💔", "😞"],
    гнев: ["бесит", "злость", "ярость", "достало", "надоело", "возмущен", "негодую", "😡", "🤬", "💢"],
    страх: ["боюсь", "страшно", "паника", "ужас", "тревожно", "волнуюсь", "😰", "😨", "😱"],
    удивление: ["удивлен", "неожиданно", "вау", "ого", "ничего себе", "😲", "😮", "🤯"],
    нейтрально: ["нормально", "хорошо", "понятно", "ясно", "согласен", "принято"],
  }

  let maxScore = 0
  let primaryEmotion = "нейтрально"

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    let score = 0
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score += 0.3
      }
    }
    if (score > maxScore) {
      maxScore = score
      primaryEmotion = emotion
    }
  }

  const toxicity = calculateToxicity(text)

  const sentiment =
    primaryEmotion === "радость"
      ? "positive"
      : ["грусть", "гнев", "страх"].includes(primaryEmotion)
        ? "negative"
        : "neutral"

  return {
    primary_emotion: primaryEmotion,
    confidence: Math.min(maxScore, 1) || 0.5,
    toxicity: toxicity,
    sentiment: sentiment,
    explanation: "Анализ по ключевым словам (HF модели недоступны)",
  }
}

// Сохранение сообщения в Supabase
async function saveMessage(chatId: number, userId: number, username: string, text: string, analysis: any) {
  try {
    // Сохраняем пользователя
    await supabase.from("users").upsert(
      {
        telegram_id: userId,
        username: username,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "telegram_id",
      },
    )

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

    if (messageError) throw messageError

    // Сохраняем анализ эмоций
    await supabase.from("emotion_analysis").insert({
      message_id: messageData.id,
      primary_emotion: analysis.primary_emotion,
      confidence: analysis.confidence,
      toxicity: analysis.toxicity,
      sentiment: analysis.sentiment,
      explanation: analysis.explanation,
      analyzed_at: new Date().toISOString(),
    })

    return messageData
  } catch (error) {
    console.error("Ошибка сохранения в БД:", error)
    return null
  }
}

// Обработчики команд
bot.command("start", async (ctx) => {
  await ctx.reply(
    "🤖 Привет! Я бот для анализа эмоций с использованием Hugging Face моделей.\n\n" +
      "🧠 Использую RoBERTa и BERT модели для анализа текста\n" +
      "📊 Определяю эмоции, тональность и токсичность\n" +
      "🆓 Полностью бесплатное решение!\n\n" +
      "Команды:\n" +
      "/start - начать работу\n" +
      "/help - помощь\n" +
      "/stats - статистика чата\n" +
      "/mood - общее настроение\n" +
      "/models - информация о моделях\n" +
      "/test - тест анализа",
  )
})

bot.command("test", async (ctx) => {
  const testTexts = [
    "Отличная работа! Все супер! 😊",
    "Ужасно, все плохо, достало уже 😡",
    "Нормально, все в порядке",
    "Боюсь, что не получится 😰",
  ]

  let response = "🧪 **Тест анализа эмоций:**\n\n"

  for (const text of testTexts) {
    const analysis = await analyzeEmotionHF(text)
    response += `📝 "${text}"\n`
    response += `😊 Эмоция: ${analysis.primary_emotion} (${Math.round(analysis.confidence * 100)}%)\n`
    response += `📊 Тональность: ${analysis.sentiment}\n`
    if (analysis.toxicity > 0.2) {
      response += `⚠️ Токсичность: ${Math.round(analysis.toxicity * 100)}%\n`
    }
    response += `🤖 ${analysis.explanation}\n\n`
  }

  await ctx.reply(response, { parse_mode: "Markdown" })
})

bot.command("models", async (ctx) => {
  await ctx.reply(
    "🧠 **Используемые AI модели:**\n\n" +
      "📝 **Анализ эмоций:**\n" +
      "• RoBERTa Sentiment (cardiffnlp/twitter-roberta-base-sentiment-latest)\n" +
      "• DistilRoBERTa Emotion (j-hartmann/emotion-english-distilroberta-base)\n" +
      "• Multilingual BERT (nlptown/bert-base-multilingual-uncased-sentiment)\n\n" +
      "🛡️ **Детекция токсичности:**\n" +
      "• Анализ по ключевым словам\n" +
      "• Паттерны агрессивного поведения\n\n" +
      "💡 **Особенности:**\n" +
      "• Все модели бесплатны\n" +
      "• Fallback на ключевые слова\n" +
      "• Поддержка русского и английского\n" +
      "• Работает даже если HF недоступен",
    { parse_mode: "Markdown" },
  )
})

bot.command("help", async (ctx) => {
  await ctx.reply(
    "🔍 **Как я работаю:**\n\n" +
      "• Анализирую эмоции с помощью BERT/RoBERTa моделей\n" +
      "• Определяю токсичность и тональность\n" +
      "• Работаю с русским и английским языками\n" +
      "• Сохраняю статистику для аналитики\n\n" +
      "🆓 **Использую только бесплатные модели!**\n" +
      "💬 Просто пишите как обычно, я буду анализировать автоматически!\n\n" +
      "🧪 Используйте /test для проверки работы анализа",
    { parse_mode: "Markdown" },
  )
})

bot.command("stats", async (ctx) => {
  try {
    const chatId = ctx.chat?.id
    if (!chatId) return

    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        *,
        emotion_analysis (*)
      `)
      .eq("chat_id", chatId)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (error) throw error

    if (!messages || messages.length === 0) {
      await ctx.reply("📊 Нет данных за последние 24 часа")
      return
    }

    const totalMessages = messages.length
    const emotions = messages.map((m) => m.emotion_analysis?.[0]?.primary_emotion).filter(Boolean)
    const toxicMessages = messages.filter((m) => (m.emotion_analysis?.[0]?.toxicity || 0) > 0.5).length

    const emotionCounts = emotions.reduce((acc: any, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1
      return acc
    }, {})

    const topEmotion = Object.entries(emotionCounts).sort(([, a], [, b]) => (b as number) - (a as number))[0]
    const avgToxicity = messages.reduce((sum, m) => sum + (m.emotion_analysis?.[0]?.toxicity || 0), 0) / totalMessages
    const avgConfidence =
      messages.reduce((sum, m) => sum + (m.emotion_analysis?.[0]?.confidence || 0), 0) / totalMessages

    await ctx.reply(
      `📊 **Статистика чата за 24 часа:**\n\n` +
        `💬 Всего сообщений: ${totalMessages}\n` +
        `😊 Основная эмоция: ${topEmotion?.[0] || "нет данных"} (${topEmotion?.[1] || 0})\n` +
        `⚠️ Токсичных сообщений: ${toxicMessages}\n` +
        `📈 Средняя токсичность: ${(avgToxicity * 100).toFixed(1)}%\n` +
        `🎯 Средняя уверенность: ${(avgConfidence * 100).toFixed(1)}%\n\n` +
        `🤖 Анализ выполнен с помощью Hugging Face моделей\n` +
        `${avgToxicity > 0.3 ? "🚨 Рекомендуется модерация" : "✅ Атмосфера в норме"}`,
      { parse_mode: "Markdown" },
    )
  } catch (error) {
    console.error("Ошибка получения статистики:", error)
    await ctx.reply("❌ Ошибка получения статистики")
  }
})

bot.command("mood", async (ctx) => {
  try {
    const chatId = ctx.chat?.id
    if (!chatId) return

    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        *,
        emotion_analysis (*)
      `)
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) throw error

    if (!messages || messages.length === 0) {
      await ctx.reply("🤔 Нет данных для анализа настроения")
      return
    }

    const sentiments = messages.map((m) => m.emotion_analysis?.[0]?.sentiment).filter(Boolean)
    const emotions = messages.map((m) => m.emotion_analysis?.[0]?.primary_emotion).filter(Boolean)

    const positive = sentiments.filter((s) => s === "positive").length
    const negative = sentiments.filter((s) => s === "negative").length
    const neutral = sentiments.filter((s) => s === "neutral").length

    const emotionCounts = emotions.reduce((acc: any, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1
      return acc
    }, {})

    const topEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)

    let moodEmoji = "😐"
    let moodText = "нейтральное"

    if (positive > negative && positive > neutral) {
      moodEmoji = "😊"
      moodText = "позитивное"
    } else if (negative > positive && negative > neutral) {
      moodEmoji = "😔"
      moodText = "негативное"
    }

    let emotionText = ""
    if (topEmotions.length > 0) {
      emotionText =
        "\n\n🎭 **Топ эмоции:**\n" + topEmotions.map(([emotion, count]) => `• ${emotion}: ${count}`).join("\n")
    }

    await ctx.reply(
      `🌡️ **Настроение чата:** ${moodEmoji} ${moodText}\n\n` +
        `📊 Из последних ${messages.length} сообщений:\n` +
        `😊 Позитивных: ${positive}\n` +
        `😔 Негативных: ${negative}\n` +
        `😐 Нейтральных: ${neutral}` +
        emotionText,
      { parse_mode: "Markdown" },
    )
  } catch (error) {
    console.error("Ошибка анализа настроения:", error)
    await ctx.reply("❌ Ошибка анализа настроения")
  }
})

// Обработка обычных сообщений
bot.on("message:text", async (ctx) => {
  try {
    const text = ctx.message.text
    const chatId = ctx.chat.id
    const userId = ctx.from.id
    const username = ctx.from.username || ctx.from.first_name || "Unknown"

    // Анализируем эмоции
    const analysis = await analyzeEmotionHF(text)

    // Сохраняем в базу данных
    await saveMessage(chatId, userId, username, text, analysis)

    // Определяем эмодзи для эмоции
    const emotionEmojis: { [key: string]: string } = {
      радость: "😊",
      грусть: "😢",
      гнев: "😡",
      страх: "😰",
      удивление: "😲",
      отвращение: "🤢",
      нейтрально: "😐",
    }

    const emoji = emotionEmojis[analysis.primary_emotion] || "🤔"

    // Отправляем результат анализа
    let response = `${emoji} **Эмоция**: ${analysis.primary_emotion}\n`
    response += `📊 **Уверенность**: ${Math.round(analysis.confidence * 100)}%\n`
    response += `🎭 **Тональность**: ${analysis.sentiment}\n`

    if (analysis.toxicity > 0.2) {
      response += `⚠️ **Токсичность**: ${Math.round(analysis.toxicity * 100)}%\n`
    }

    response += `🤖 ${analysis.explanation}`

    // Предупреждение о высокой токсичности
    if (analysis.toxicity > 0.6) {
      response += `\n\n🚨 **Внимание!** Обнаружена высокая токсичность. Рекомендуется пересмотреть тон сообщения.`
    } else if (analysis.toxicity > 0.3) {
      response += `\n\n⚠️ Умеренная токсичность. Будьте внимательны к тону общения.`
    }

    await ctx.reply(response, {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: "Markdown",
    })
  } catch (error) {
    console.error("Ошибка обработки сообщения:", error)
    await ctx.reply("❌ Произошла ошибка при анализе сообщения. Попробуйте позже.")
  }
})

// Обработка ошибок
bot.catch((err) => {
  console.error("Ошибка бота:", err)
})

export const POST = webhookCallback(bot, "std/http")
