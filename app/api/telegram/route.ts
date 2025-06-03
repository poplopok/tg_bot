import { type NextRequest, NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"
import { createClient } from "@supabase/supabase-js"
import { preprocessText } from "@/lib/text-preprocessing"

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const update = await req.json()
    console.log("Received update:", JSON.stringify(update, null, 2))

    if (update.message) {
      const message = update.message
      const chatId = message.chat.id
      const userId = message.from.id

      let emotionResult

      if (message.text) {
        // Анализ текстового сообщения
        emotionResult = await analyzeTextEmotion(message.text)
        console.log("Text emotion result:", emotionResult)
      } else if (message.voice) {
        // Анализ голосового сообщения
        emotionResult = await analyzeVoiceEmotion(message.voice.file_id)
        console.log("Voice emotion result:", emotionResult)
      }

      if (emotionResult) {
        // Сохранение результата в Supabase
        await saveEmotionData(userId, chatId, message.text || "voice", emotionResult)

        // Отправка ответа пользователю
        await sendTelegramMessage(chatId, formatEmotionResponse(emotionResult))
      } else {
        // Отправка сообщения об ошибке
        await sendTelegramMessage(chatId, "Извините, не удалось проанализировать эмоцию в вашем сообщении.")
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error processing update:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function analyzeTextEmotion(text: string) {
  try {
    // Предобработка текста
    const processedText = preprocessText(text)
    console.log("Processed text:", processedText)

    // Используем модель для русского языка
    const result = await hf.textClassification({
      model: "cointegrated/rubert-tiny2-cedr-emotion-detection",
      inputs: processedText,
    })

    console.log("HF result:", result)

    if (result && result.length > 0) {
      return {
        primary: result[0],
        confidence: result[0].score,
        originalText: text,
        processedText: processedText,
      }
    }

    return null
  } catch (error) {
    console.error("Error analyzing text emotion:", error)

    // Fallback к простому анализу тональности
    try {
      const sentimentResult = await hf.textClassification({
        model: "cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual",
        inputs: text,
      })

      if (sentimentResult && sentimentResult.length > 0) {
        return {
          primary: sentimentResult[0],
          confidence: sentimentResult[0].score,
          originalText: text,
          fallback: true,
        }
      }
    } catch (fallbackError) {
      console.error("Fallback analysis also failed:", fallbackError)
    }

    return null
  }
}

async function analyzeVoiceEmotion(fileId: string) {
  try {
    // Получаем файл от Telegram
    const fileUrl = await getTelegramFileUrl(fileId)
    console.log("Voice file URL:", fileUrl)

    const audioResponse = await fetch(fileUrl)
    const audioBuffer = await audioResponse.arrayBuffer()

    // Преобразуем речь в текст с помощью Whisper
    const transcription = await hf.automaticSpeechRecognition({
      model: "openai/whisper-small",
      data: audioBuffer,
    })

    console.log("Transcription:", transcription)

    if (transcription && transcription.text) {
      // Анализируем эмоции в распознанном тексте
      const textEmotion = await analyzeTextEmotion(transcription.text)

      if (textEmotion) {
        return {
          ...textEmotion,
          transcription: transcription.text,
          type: "voice",
        }
      }
    }

    return null
  } catch (error) {
    console.error("Error analyzing voice emotion:", error)
    return null
  }
}

async function getTelegramFileUrl(fileId: string) {
  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`,
  )
  const data = await response.json()

  if (!data.ok) {
    throw new Error(`Failed to get file: ${data.description}`)
  }

  return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${data.result.file_path}`
}

async function saveEmotionData(userId: number, chatId: number, text: string, emotion: any) {
  try {
    const { error } = await supabase.from("emotion_analysis").insert({
      user_id: userId,
      chat_id: chatId,
      message_text: text,
      emotion_label: emotion.primary.label,
      confidence: emotion.confidence,
      raw_results: emotion,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving to Supabase:", error)
    }
  } catch (error) {
    console.error("Error saving emotion data:", error)
  }
}

async function sendTelegramMessage(chatId: number, text: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    })

    const data = await response.json()
    if (!data.ok) {
      console.error("Failed to send message:", data)
    }
  } catch (error) {
    console.error("Error sending telegram message:", error)
  }
}

function formatEmotionResponse(emotion: any) {
  const emoji = getEmotionEmoji(emotion.primary.label)
  const confidence = Math.round(emotion.confidence * 100)

  let response = `${emoji} <b>Обнаруженная эмоция:</b> ${translateEmotion(emotion.primary.label)}\n`
  response += `<b>Уверенность:</b> ${confidence}%\n`

  if (emotion.transcription) {
    response += `<b>Распознанный текст:</b> ${emotion.transcription}\n`
  }

  if (emotion.fallback) {
    response += `\n<i>Использован резервный анализ тональности</i>`
  }

  return response
}

function getEmotionEmoji(emotion: string): string {
  const emojiMap: { [key: string]: string } = {
    // Русские эмоции
    радость: "😊",
    грусть: "😢",
    гнев: "😠",
    страх: "😨",
    удивление: "😲",
    отвращение: "🤢",
    нейтральность: "😐",
    // Английские эмоции (fallback)
    joy: "😊",
    sadness: "😢",
    anger: "😠",
    fear: "😨",
    surprise: "😲",
    disgust: "🤢",
    neutral: "😐",
    // Тональность
    POSITIVE: "😊",
    NEGATIVE: "😞",
    NEUTRAL: "😐",
  }

  return emojiMap[emotion.toLowerCase()] || emojiMap[emotion] || "🤔"
}

function translateEmotion(emotion: string): string {
  const translations: { [key: string]: string } = {
    joy: "радость",
    sadness: "грусть",
    anger: "гнев",
    fear: "страх",
    surprise: "удивление",
    disgust: "отвращение",
    neutral: "нейтральность",
    POSITIVE: "позитивная",
    NEGATIVE: "негативная",
    NEUTRAL: "нейтральная",
  }

  return translations[emotion] || emotion
}
