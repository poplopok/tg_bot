import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const botToken = "7970844280:AAGNyTlzselT8E6XunCSqnxtvYWePd76JFk"

    // Получаем правильный URL с протоколом
    const host = request.headers.get("host")
    const webhookUrl = `https://${host}/api/webhook`

    console.log("🔗 Устанавливаем webhook:", webhookUrl)

    if (!botToken) {
      return NextResponse.json({ error: "Bot token not found" }, { status: 500 })
    }

    // Сначала удаляем старый webhook
    const deleteResponse = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`, {
      method: "POST",
    })

    console.log("🗑️ Удаление старого webhook:", await deleteResponse.text())

    // Ждем немного перед установкой нового
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Устанавливаем новый webhook с правильным URL
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl, // Теперь с https://
        allowed_updates: ["message", "callback_query"],
        drop_pending_updates: true,
      }),
    })

    const data = await response.json()
    console.log("📡 Результат установки webhook:", data)

    if (data.ok) {
      return NextResponse.json({
        success: true,
        message: "Webhook установлен успешно",
        webhook_url: webhookUrl,
        result: data,
      })
    } else {
      return NextResponse.json(
        {
          error: "Ошибка установки webhook",
          details: data,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Ошибка установки webhook:", error)
    return NextResponse.json(
      {
        error: "Внутренняя ошибка сервера",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const botToken = "7970844280:AAGNyTlzselT8E6XunCSqnxtvYWePd76JFk"

    const response = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`)
    const data = await response.json()

    return NextResponse.json({
      webhook_info: data,
      status: data.result?.url ? "active" : "not_set",
    })
  } catch (error) {
    return NextResponse.json({ error: "Ошибка получения информации о webhook" }, { status: 500 })
  }
}
