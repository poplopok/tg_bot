import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const webhookUrl = `${process.env.VERCEL_URL || "https://your-app.vercel.app"}/api/webhook`

    if (!botToken) {
      return NextResponse.json({ error: "Bot token not found" }, { status: 500 })
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message"],
      }),
    })

    const data = await response.json()

    if (data.ok) {
      return NextResponse.json({
        success: true,
        message: "Webhook установлен успешно",
        webhook_url: webhookUrl,
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
    console.error("Ошибка установки webhook:", error)
    return NextResponse.json(
      {
        error: "Внутренняя ошибка сервера",
      },
      { status: 500 },
    )
  }
}
