import { type NextRequest, NextResponse } from "next/server"
import { analyzeEmotion } from "@/lib/emotion-analyzer"
import { saveMessage, getChatSettings } from "@/lib/database"
import { checkAlerts } from "@/lib/alerts"
import { transcribeVoice } from "@/lib/voice-processor"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = body.message

    if (!message) {
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id
    const userId = message.from.id
    const username = message.from.username || message.from.first_name
    const messageId = message.message_id

    // Получаем настройки чата
    const settings = await getChatSettings(chatId)
    if (!settings?.enabled) {
      return NextResponse.json({ ok: true })
    }

    let text = ""
    let messageType = "text"

    // Обработка текстовых сообщений
    if (message.text) {
      text = message.text
      messageType = "text"
    }
    // Обработка голосовых сообщений
    else if (message.voice) {
      try {
        const fileId = message.voice.file_id
        const duration = message.voice.duration

        // Получаем файл от Telegram
        const fileResponse = await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`,
        )
        const fileData = await fileResponse.json()

        if (fileData.ok) {
          const filePath = fileData.result.file_path
          const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`

          // Транскрибируем голосовое сообщение
          text = await transcribeVoice(fileUrl)
          messageType = "voice"

          console.log(`Transcribed voice message: ${text}`)
        }
      } catch (error) {
        console.error("Error processing voice message:", error)
        return NextResponse.json({ ok: true })
      }
    }
    // Обработка видео сообщений
    else if (message.video_note) {
      try {
        const fileId = message.video_note.file_id
        const duration = message.video_note.duration

        const fileResponse = await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`,
        )
        const fileData = await fileResponse.json()

        if (fileData.ok) {
          const filePath = fileData.result.file_path
          const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`

          // Транскрибируем видео сообщение
          text = await transcribeVoice(fileUrl)
          messageType = "video_note"

          console.log(`Transcribed video note: ${text}`)
        }
      } catch (error) {
        console.error("Error processing video note:", error)
        return NextResponse.json({ ok: true })
      }
    }

    // Если нет текста для анализа, пропускаем
    if (!text.trim()) {
      return NextResponse.json({ ok: true })
    }

    // Анализируем эмоции
    const emotions = await analyzeEmotion(text)

    // Сохраняем в базу данных
    await saveMessage({
      chatId,
      userId,
      username,
      messageId,
      text,
      messageType,
      emotions,
      timestamp: new Date(message.date * 1000),
    })

    // Проверяем алерты
    await checkAlerts(chatId, emotions, username)

    // Отправляем предупреждение если высокая токсичность
    if (emotions.toxicity > 0.8) {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "⚠️ Обнаружено потенциально токсичное сообщение. Давайте поддерживать позитивную атмосферу в чате!",
          reply_to_message_id: messageId,
        }),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
