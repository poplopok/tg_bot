import { type NextRequest, NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"
import { createClient } from "@supabase/supabase-js"

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const update = await req.json()

    if (update.message) {
      const message = update.message
      const chatId = message.chat.id
      const userId = message.from.id

      let emotionResult

      if (message.text) {
        // Анализ текстового сообщения
        emotionResult = await analyzeTextEmotion(message.text)
      } else if (message.voice) {
        // Анализ голосового сообщения
        emotionResult = await analyzeVoiceEmotion(message.voice.file_id)
      }

      if (emotionResult) {
        // Сохранение результата в Supabase
        await saveEmotionData(userId, chatId, message.text || "voice", emotionResult)

        // Отправка ответа пользователю
        await sendTelegramMessage(chatId, formatEmotionResponse(emotionResult))
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
    // Используем несколько моделей для повышения точности
    const [ruBertResult, multilingualResult] = await Promise.all([
      hf.textClassification({
        model: "cointegrated/rubert-tiny2-cedr-emotion-detection",
        inputs: text,
      }),
      hf.textClassification({
        model: "cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual",
        inputs: text,
      }),
    ])

    return {
      primary: ruBertResult[0],
      secondary: multilingualResult[0],
      confidence: (ruBertResult[0].score + multilingualResult[0].score) / 2,
    }
  } catch (error) {
    console.error("Error analyzing text emotion:", error)
    return null
  }
}

async function analyzeVoiceEmotion(fileId: string) {
  try {
    // Получаем файл от Telegram
    const fileUrl = await getTelegramFileUrl(fileId)
    const audioBuffer = await fetch(fileUrl).then((res) => res.arrayBuffer())

    // Преобразуем речь в текст
    const transcription = await hf.automaticSpeechRecognition({
      model: "openai/whisper-small",
      data: audioBuffer,
    })

    if (transcription.text) {
      // Анализируем эмоции в тексте
      const textEmotion = await analyzeTextEmotion(transcription.text)

      return {
        ...textEmotion,
        transcription: transcription.text,
        type: "voice",
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
  return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${data.result.file_path}`
}

async function saveEmotionData(userId: number, chatId: number, text: string, emotion: any) {
  await supabase.from("emotion_analysis").insert({
    user_id: userId,
    chat_id: chatId,
    message_text: text,
    emotion_label: emotion.primary.label,
    confidence: emotion.confidence,
    raw_results: emotion,
    created_at: new Date().toISOString(),
  })
}

async function sendTelegramMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
    }),
  })
}

function formatEmotionResponse(emotion: any) {
  const emoji = getEmotionEmoji(emotion.primary.label)
  return `${emoji} <b>Обнаруженная эмоция:</b> ${emotion.primary.label}
<b>Уверенность:</b> ${(emotion.confidence * 100).toFixed(1)}%
${emotion.transcription ? `<b>Распознанный текст:</b> ${emotion.transcription}` : ""}`
}

function getEmotionEmoji(emotion: string) {
  const emojiMap: { [key: string]: string } = {
    joy: "😊",
    sadness: "😢",
    anger: "😠",
    fear: "😨",
    surprise: "😲",
    disgust: "🤢",
    neutral: "😐",
  }
  return emojiMap[emotion.toLowerCase()] || "🤔"
}
