import { Bot, webhookCallback } from "grammy"
import { createClient } from "@supabase/supabase-js"

const bot = new Bot("7970844280:AAGNyTlzselT8E6XunCSqnxtvYWePd76JFk")

const supabase = createClient(
  "https://ikaufpurzmxnalsaffwa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYXVmcHVyem14bmFsc2FmZndhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ0NTYyNCwiZXhwIjoyMDY0MDIxNjI0fQ.SERVICE_ROLE_KEY_HERE",
)

// Hugging Face API для анализа эмоций
async function analyzeEmotionHF(text: string) {
  try {
    // Используем бесплатную модель для анализа эмоций на русском языке
    const emotionResponse = await fetch(
      "https://api-inference.huggingface.co/models/seara/rubert-base-cased-russian-sentiment",
      {
        headers: {
          Authorization: `Bearer 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`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: text }),
      },
    )

    if (!emotionResponse.ok) {
      console.error(
        `Ошибка при запросе к Hugging Face API (эмоции): ${emotionResponse.status} ${emotionResponse.statusText}`,
      )
      return analyzeEmotionFallback(text)
    }

    const emotionData = await emotionResponse.json()

    // Анализ токсичности с помощью другой модели
    const toxicityResponse = await fetch(
      "https://api-inference.huggingface.co/models/martin-ha/toxic-classification-distilBERT",
      {
        headers: {
          Authorization: `Bearer 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`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: text }),
      },
    )

    if (!toxicityResponse.ok) {
      console.error(
        `Ошибка при запросе к Hugging Face API (токсичность): ${toxicityResponse.status} ${toxicityResponse.statusText}`,
      )
      return analyzeEmotionFallback(text)
    }

    const toxicityData = await toxicityResponse.json()

    // Обработка результатов эмоций
    let primaryEmotion = "нейтрально"
    let confidence = 0.5
    let sentiment = "neutral"

    if (Array.isArray(emotionData) && emotionData[0]) {
      const topEmotion = emotionData[0][0]
      if (topEmotion) {
        // Маппинг английских меток на русские
        const emotionMap: { [key: string]: string } = {
          POSITIVE: "радость",
          NEGATIVE: "грусть",
          NEUTRAL: "нейтрально",
          LABEL_0: "негативно",
          LABEL_1: "нейтрально",
          LABEL_2: "позитивно",
        }

        primaryEmotion = emotionMap[topEmotion.label] || "нейтрально"
        confidence = topEmotion.score || 0.5

        if (topEmotion.label === "POSITIVE" || topEmotion.label === "LABEL_2") {
          sentiment = "positive"
        } else if (topEmotion.label === "NEGATIVE" || topEmotion.label === "LABEL_0") {
          sentiment = "negative"
        }
      }
    }

    // Обработка результатов токсичности
    let toxicity = 0
    if (Array.isArray(toxicityData) && toxicityData[0]) {
      const toxicResult = toxicityData[0].find((item: any) => item.label === "TOXIC" || item.label === "LABEL_1")
      if (toxicResult) {
        toxicity = toxicResult.score || 0
      }
    }

    return {
      primary_emotion: primaryEmotion,
      confidence: confidence,
      toxicity: toxicity,
      sentiment: sentiment,
      explanation: `Анализ выполнен с помощью RuBERT (уверенность: ${Math.round(confidence * 100)}%)`,
    }
  } catch (error) {
    console.error("Ошибка анализа HF:", error)

    // Fallback: простой анализ по ключевым словам
    return analyzeEmotionFallback(text)
  }
}

// Fallback анализ эмоций по ключевым словам (если HF недоступен)
function analyzeEmotionFallback(text: string) {
  const lowerText = text.toLowerCase()

  const emotionKeywords = {
    радость: ["отлично", "супер", "здорово", "классно", "прекрасно", "😊", "😄", "👍", "🎉"],
    грусть: ["грустно", "печально", "плохо", "расстроен", "😢", "😔", "💔"],
    гнев: ["бесит", "злость", "ярость", "достало", "идиот", "дурак", "😡", "🤬"],
    страх: ["боюсь", "страшно", "паника", "ужас", "😰", "😨"],
    нейтрально: ["нормально", "хорошо", "понятно", "ясно"],
  }

  const toxicWords = ["идиот", "дурак", "тупой", "кретин", "говно", "херня"]

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

  let toxicity = 0
  for (const toxicWord of toxicWords) {
    if (lowerText.includes(toxicWord)) {
      toxicity += 0.3
    }
  }
  toxicity = Math.min(toxicity, 1)

  const sentiment =
    primaryEmotion === "радость"
      ? "positive"
      : primaryEmotion === "грусть" || primaryEmotion === "гнев"
        ? "negative"
        : "neutral"

  return {
    primary_emotion: primaryEmotion,
    confidence: Math.min(maxScore, 1),
    toxicity: toxicity,
    sentiment: sentiment,
    explanation: "Анализ по ключевым словам (HF модель недоступна)",
  }
}

// Расширенный анализ эмоций с несколькими моделями
async function analyzeEmotionAdvanced(text: string) {
  try {
    // Пробуем несколько моделей для более точного анализа
    const models = [
      "cardiffnlp/twitter-roberta-base-sentiment-latest",
      "blanchefort/rubert-base-cased-sentiment",
      "sismetanin/rubert-ru-sentiment-rusentiment",
    ]

    const results = []

    for (const model of models) {
      try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: text }),
        })

        if (!response.ok) {
          console.log(`Модель ${model} недоступна, пробуем следующую...`)
          continue
        }

        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data) && data[0]) {
            results.push({ model, data: data[0] })
            break // Используем первую успешную модель
          }
        }
      } catch (error) {
        console.log(`Модель ${model} недоступна, пробуем следующую...`)
        continue
      }
    }

    if (results.length === 0) {
      return analyzeEmotionFallback(text)
    }

    const result = results[0]
    const topResult = result.data[0]

    // Маппинг результатов
    const emotionMap: { [key: string]: string } = {
      POSITIVE: "радость",
      NEGATIVE: "грусть",
      NEUTRAL: "нейтрально",
      LABEL_0: "негативно",
      LABEL_1: "нейтрально",
      LABEL_2: "позитивно",
    }

    const primaryEmotion = emotionMap[topResult.label] || "нейтрально"
    const confidence = topResult.score || 0.5

    let sentiment = "neutral"
    if (topResult.label === "POSITIVE" || topResult.label === "LABEL_2") {
      sentiment = "positive"
    } else if (topResult.label === "NEGATIVE" || topResult.label === "LABEL_0") {
      sentiment = "negative"
    }

    // Простая детекция токсичности по ключевым словам
    const toxicWords = ["идиот", "дурак", "тупой", "кретин", "говно", "херня", "бесит", "достало"]
    let toxicity = 0
    const lowerText = text.toLowerCase()

    for (const word of toxicWords) {
      if (lowerText.includes(word)) {
        toxicity += 0.25
      }
    }

    // Дополнительная проверка на агрессивные паттерны
    if (text.match(/[А-ЯЁ]{3,}/)) toxicity += 0.1 // Много заглавных букв
    if (text.match(/!{2,}/)) toxicity += 0.1 // Много восклицательных знаков

    toxicity = Math.min(toxicity, 1)

    return {
      primary_emotion: primaryEmotion,
      confidence: confidence,
      toxicity: toxicity,
      sentiment: sentiment,
      explanation: `Анализ: ${result.model.split("/")[1]} (${Math.round(confidence * 100)}%)`,
    }
  } catch (error) {
    console.error("Ошибка расширенного анализа:", error)
    return analyzeEmotionFallback(text)
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
      "🧠 Использую RuBERT и другие BERT-модели для анализа русского текста\n" +
      "📊 Определяю эмоции, тональность и токсичность\n\n" +
      "Команды:\n" +
      "/start - начать работу\n" +
      "/help - помощь\n" +
      "/stats - статистика чата\n" +
      "/mood - общее настроение\n" +
      "/models - информация о моделях",
  )
})

bot.command("models", async (ctx) => {
  await ctx.reply(
    "🧠 Используемые AI модели:\n\n" +
      "📝 **Анализ эмоций:**\n" +
      "• cardiffnlp/twitter-roberta-base-sentiment-latest\n" +
      "• BlancheFort RuBERT (blanchefort/rubert-base-cased-sentiment)\n" +
      "• RuSentiment BERT (sismetanin/rubert-ru-sentiment-rusentiment)\n\n" +
      "🛡️ **Детекция токсичности:**\n" +
      "• DistilBERT Toxic (martin-ha/toxic-classification-distilBERT)\n" +
      "• Ключевые слова (fallback)\n\n" +
      "💡 Все модели бесплатны и работают через Hugging Face Inference API",
  )
})

bot.command("help", async (ctx) => {
  await ctx.reply(
    "🔍 Как я работаю:\n\n" +
      "• Анализирую эмоции с помощью BERT-моделей\n" +
      "• Определяю токсичность и тональность\n" +
      "• Работаю с русским и английским языками\n" +
      "• Сохраняю статистику для аналитики\n\n" +
      "🆓 Использую только бесплатные модели!\n" +
      "💬 Просто пишите как обычно, я буду анализировать автоматически!",
  )
})

bot.command("stats", async (ctx) => {
  try {
    const chatId = ctx.chat?.id
    if (!chatId) return

    // Получаем статистику за последние 24 часа
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
      `📊 Статистика чата за 24 часа:\n\n` +
        `💬 Всего сообщений: ${totalMessages}\n` +
        `😊 Основная эмоция: ${topEmotion?.[0] || "нет данных"} (${topEmotion?.[1] || 0})\n` +
        `⚠️ Токсичных сообщений: ${toxicMessages}\n` +
        `📈 Средняя токсичность: ${(avgToxicity * 100).toFixed(1)}%\n` +
        `🎯 Средняя уверенность: ${(avgConfidence * 100).toFixed(1)}%\n\n` +
        `🤖 Анализ выполнен с помощью Hugging Face моделей\n` +
        `${avgToxicity > 0.3 ? "🚨 Рекомендуется модерация" : "✅ Атмосфера в норме"}`,
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

    // Получаем последние 10 сообщений
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

    // Подсчет эмоций
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
      emotionText = "\n\n🎭 Топ эмоции:\n" + topEmotions.map(([emotion, count]) => `• ${emotion}: ${count}`).join("\n")
    }

    await ctx.reply(
      `🌡️ Настроение чата: ${moodEmoji} ${moodText}\n\n` +
        `📊 Из последних ${messages.length} сообщений:\n` +
        `😊 Позитивных: ${positive}\n` +
        `😔 Негативных: ${negative}\n` +
        `😐 Нейтральных: ${neutral}` +
        emotionText,
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

    // Анализируем эмоции с помощью HF моделей
    const analysis = await analyzeEmotionAdvanced(text)

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
      позитивно: "😊",
      негативно: "😔",
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
