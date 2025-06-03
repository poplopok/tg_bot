import { type NextRequest, NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"
import type { TelegramUpdate } from "./types" // Declare the TelegramUpdate type here

const hf = new HfInference("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")
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

// Используем только проверенные рабочие модели
const EMOTION_MODELS = [
  "j-hartmann/emotion-english-distilroberta-base", // Основная модель эмоций
  "SamLowe/roberta-base-go_emotions", // Расширенный набор эмоций
  "nlptown/bert-base-multilingual-uncased-sentiment", // Мультиязычная модель настроений
]

interface TelegramMessage {
  message_id: number
  from: {
    id: number
    first_name: string
    username?: string
  }
  chat: {
    id: number
    type: string
  }
  text?: string
  voice?: {
    file_id: string
    duration: number
  }
}

// Функция для анализа эмоций с проверенными моделями
async function analyzeEmotions(text: string) {
  const results = []
  let workingModels = 0

  for (const model of EMOTION_MODELS) {
    try {
      const result = await hf.textClassification({
        model,
        inputs: text,
      })
      results.push({
        model,
        emotions: result,
      })
      workingModels++
      console.log(`✅ Successfully used model: ${model}`)
    } catch (error) {
      console.error(`❌ Error with model ${model}:`, error.message)
    }
  }

  if (results.length === 0) {
    throw new Error("Ни одна модель эмоций не доступна")
  }

  // Обрабатываем результаты разных типов моделей
  const emotionScores: { [key: string]: number } = {}
  const emotionCounts: { [key: string]: number } = {}

  results.forEach((result) => {
    if (result.emotions && Array.isArray(result.emotions)) {
      result.emotions.forEach((emotion: any) => {
        let label = emotion.label.toLowerCase()

        // Нормализуем метки разных моделей
        if (label.includes("star")) {
          // Для модели sentiment (1-5 stars) преобразуем в эмоции
          const stars = Number.parseInt(label.split(" ")[0])
          if (stars >= 4) label = "positive"
          else if (stars <= 2) label = "negative"
          else label = "neutral"
        }

        // Объединяем похожие эмоции
        if (label === "approval" || label === "admiration") label = "positive"
        if (label === "relief") label = "joy"

        emotionScores[label] = (emotionScores[label] || 0) + emotion.score
        emotionCounts[label] = (emotionCounts[label] || 0) + 1
      })
    }
  })

  // Усредняем результаты
  Object.keys(emotionScores).forEach((emotion) => {
    emotionScores[emotion] /= emotionCounts[emotion]
  })

  return {
    emotions: emotionScores,
    modelsUsed: results.length,
    totalModelsAttempted: EMOTION_MODELS.length,
    modelDetails: results.map((r) => ({ model: r.model, emotions: r.emotions })),
  }
}

// Функция для обработки голосовых сообщений
async function processVoiceMessage(fileId: string) {
  try {
    // Получаем файл от Telegram
    const fileResponse = await fetch(`${TELEGRAM_API_URL}/getFile?file_id=${fileId}`)
    const fileData = await fileResponse.json()

    if (!fileData.ok) {
      throw new Error("Failed to get file info")
    }

    // Скачиваем аудиофайл
    const audioUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileData.result.file_path}`
    const audioResponse = await fetch(audioUrl)
    const audioBuffer = await audioResponse.arrayBuffer()

    // Преобразуем голос в текст с помощью Hugging Face
    const transcription = await hf.automaticSpeechRecognition({
      model: "openai/whisper-large-v3", // Поддерживает русский язык
      data: audioBuffer,
    })

    return transcription.text
  } catch (error) {
    console.error("Error processing voice message:", error)
    return null
  }
}

// Функция для отправки сообщения в Telegram
async function sendTelegramMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  })
}

// Функция для сохранения результатов в Supabase
async function saveToSupabase(userId: number, messageText: string, emotions: any, messageType: "text" | "voice") {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/emotion_analysis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      },
      body: JSON.stringify({
        user_id: userId,
        message_text: messageText,
        emotions: emotions,
        message_type: messageType,
        created_at: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      console.error("Failed to save to Supabase:", await response.text())
    }
  } catch (error) {
    console.error("Error saving to Supabase:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()

    if (!update.message) {
      return NextResponse.json({ ok: true })
    }

    const message = update.message
    const chatId = message.chat.id
    const userId = message.from.id

    let textToAnalyze = ""
    let messageType: "text" | "voice" = "text"

    // Обработка команды /start
    if (message.text === "/start") {
      await sendTelegramMessage(
        chatId,
        `🤖 <b>Привет! Я бот для анализа эмоций</b>

📝 Отправьте мне текстовое сообщение или 🎤 голосовое сообщение, и я проанализирую эмоции!

🎭 <b>Что я умею:</b>
• Анализировать эмоции в тексте
• Распознавать речь и анализировать голосовые сообщения
• Работать с русским и английским языками
• Сохранять историю анализа

🚀 <b>Используемые модели:</b>
• j-hartmann/emotion-english-distilroberta-base
• SamLowe/roberta-base-go_emotions  
• nlptown/bert-base-multilingual-uncased-sentiment

Просто отправьте сообщение для начала анализа! 😊`,
      )
      return NextResponse.json({ ok: true })
    }

    // Обработка текстового сообщения
    if (message.text) {
      textToAnalyze = message.text
      messageType = "text"
    }
    // Обработка голосового сообщения
    else if (message.voice) {
      await sendTelegramMessage(chatId, "🎤 Обрабатываю голосовое сообщение...")

      const transcribedText = await processVoiceMessage(message.voice.file_id)
      if (!transcribedText) {
        await sendTelegramMessage(chatId, "❌ Не удалось обработать голосовое сообщение")
        return NextResponse.json({ ok: true })
      }

      textToAnalyze = transcribedText
      messageType = "voice"

      await sendTelegramMessage(chatId, `📝 Распознанный текст: "${transcribedText}"`)
    }

    if (!textToAnalyze) {
      return NextResponse.json({ ok: true })
    }

    // Анализируем эмоции
    await sendTelegramMessage(chatId, "🤖 Анализирую эмоции...")

    const analysisResult = await analyzeEmotions(textToAnalyze)
    const emotions = analysisResult.emotions

    // Сохраняем в Supabase
    await saveToSupabase(userId, textToAnalyze, analysisResult, messageType)

    // Формируем ответ
    const sortedEmotions = Object.entries(emotions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5) // Топ-5 эмоций

    let responseText = `🎭 <b>Анализ эмоций:</b>\n\n`

    if (messageType === "voice") {
      responseText += `🎤 <i>Голосовое сообщение</i>\n`
    }

    responseText += `📝 <b>Текст:</b> ${textToAnalyze}\n\n`
    responseText += `🤖 <b>Использовано моделей:</b> ${analysisResult.modelsUsed}/${analysisResult.totalModelsAttempted}\n\n`
    responseText += `🎯 <b>Обнаруженные эмоции:</b>\n`

    const emotionEmojis: { [key: string]: string } = {
      joy: "😊",
      happiness: "😊",
      sadness: "😢",
      anger: "😠",
      fear: "😨",
      surprise: "😲",
      disgust: "🤢",
      neutral: "😐",
      positive: "👍",
      negative: "👎",
      love: "❤️",
      excitement: "🤩",
      optimism: "🌟",
      pride: "😌",
      gratitude: "🙏",
      disappointment: "😞",
      embarrassment: "😳",
      confusion: "😕",
    }

    sortedEmotions.forEach(([emotion, score]) => {
      const emoji = emotionEmojis[emotion.toLowerCase()] || "🎭"
      const percentage = (score * 100).toFixed(1)
      responseText += `${emoji} <b>${emotion}</b>: ${percentage}%\n`
    })

    // Добавляем детали по моделям
    responseText += `\n📊 <b>Детали анализа:</b>\n`
    analysisResult.modelDetails.forEach((detail, index) => {
      const modelName = detail.model.split("/")[1] || detail.model
      responseText += `${index + 1}. ${modelName}\n`
    })

    await sendTelegramMessage(chatId, responseText)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Webhook error:", error)

    // Отправляем сообщение об ошибке пользователю
    if (update?.message?.chat?.id) {
      await sendTelegramMessage(
        update.message.chat.id,
        "❌ Произошла ошибка при анализе. Попробуйте еще раз или обратитесь к администратору.",
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
