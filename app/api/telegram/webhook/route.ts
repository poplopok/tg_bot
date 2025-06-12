import { type NextRequest, NextResponse } from "next/server"
import { analyzeEmotion } from "@/lib/emotion-analyzer"
import { saveMessage, getChatSettings } from "@/lib/database"
import { checkAlerts } from "@/lib/alerts"
import { transcribeVoice } from "@/lib/voice-processor"

export async function POST(request: NextRequest) {
  console.log("🔥 Webhook received!")

  try {
    const body = await request.json()
    console.log("📨 Webhook body:", JSON.stringify(body, null, 2))

    const message = body.message

    if (!message) {
      console.log("⚠️ No message in webhook")
      return NextResponse.json({ ok: true })
    }

    console.log("✅ Processing message:", {
      chatId: message.chat.id,
      userId: message.from.id,
      username: message.from.username,
      text: message.text || "[non-text message]",
    })

    const chatId = message.chat.id
    const userId = message.from.id
    const username = message.from.username || message.from.first_name
    const messageId = message.message_id

    // Получаем настройки чата
    const settings = await getChatSettings(chatId)
    console.log("⚙️ Chat settings:", settings)

    if (!settings?.enabled) {
      console.log("🚫 Chat analysis disabled")
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

          console.log(`🎤 Transcribed voice message: ${text}`)
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

          console.log(`📹 Transcribed video note: ${text}`)
        }
      } catch (error) {
        console.error("Error processing video note:", error)
        return NextResponse.json({ ok: true })
      }
    }

    // Если нет текста для анализа, пропускаем
    if (!text.trim()) {
      console.log("⚠️ No text to analyze")
      return NextResponse.json({ ok: true })
    }

    console.log("🧠 Starting emotion analysis...")

    // Анализируем эмоции
    const emotions = await analyzeEmotion(text)

    console.log("📊 Emotion analysis result:", {
      sentiment: emotions.sentiment,
      toxicity: emotions.toxicity,
      joy: emotions.joy,
      anger: emotions.anger,
    })

    // Сохраняем в базу данных
    console.log("💾 Saving to database...")
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

    console.log("✅ Message saved to database")

    // Проверяем алерты
    console.log("🚨 Checking alerts...")
    await checkAlerts(chatId, emotions, username)

    // Отправляем ответ бота в зависимости от эмоций
    await sendBotResponse(chatId, messageId, emotions, username, text)

    console.log("✅ Webhook processing completed")
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    console.error("Error stack:", error.stack)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function sendBotResponse(chatId: number, messageId: number, emotions: any, username: string, text: string) {
  try {
    let responseText = ""
    let shouldRespond = false

    // Реагируем на высокую токсичность
    if (emotions.toxicity > 0.7) {
      responseText = `⚠️ ${username}, давайте поддерживать позитивную атмосферу в чате! 🤝`
      shouldRespond = true
    }
    // Реагируем на очень позитивные сообщения
    else if (emotions.joy > 0.7 && emotions.sentiment === "positive") {
      const positiveResponses = [
        `🎉 Отлично, ${username}! Позитивный настрой заразителен!`,
        `😊 ${username}, ваш энтузиазм вдохновляет команду!`,
        `🚀 Здорово, ${username}! Продолжайте в том же духе!`,
      ]
      responseText = positiveResponses[Math.floor(Math.random() * positiveResponses.length)]
      shouldRespond = Math.random() > 0.7 // Отвечаем не всегда, чтобы не спамить
    }
    // Реагируем на грусть или стресс
    else if (emotions.sadness > 0.6 || emotions.fear > 0.6) {
      if (Math.random() > 0.8) {
        // Отвечаем редко, чтобы не быть навязчивыми
        responseText = `💙 ${username}, если нужна поддержка команды - мы всегда рядом!`
        shouldRespond = true
      }
    }
    // Реагируем на команды боту
    else if (text.toLowerCase().includes("@") || text.toLowerCase().includes("бот")) {
      const helpResponses = [
        `🤖 Привет! Я анализирую эмоции в чате и помогаю поддерживать здоровую атмосферу.`,
        `📊 Я отслеживаю настроение команды и предупреждаю о потенциальных проблемах.`,
        `💡 Используйте /stats для просмотра статистики эмоций в чате.`,
      ]
      responseText = helpResponses[Math.floor(Math.random() * helpResponses.length)]
      shouldRespond = true
    }

    // Отправляем ответ если нужно
    if (shouldRespond && responseText) {
      console.log("🤖 Sending bot response:", responseText)

      const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: responseText,
          reply_to_message_id: messageId,
        }),
      })

      const result = await response.json()
      if (result.ok) {
        console.log("✅ Bot response sent successfully")
      } else {
        console.error("❌ Failed to send bot response:", result)
      }
    }
  } catch (error) {
    console.error("❌ Error sending bot response:", error)
  }
}
