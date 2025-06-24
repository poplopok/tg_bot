import { type NextRequest, NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN не настроен" }, { status: 400 })
    }

    const webhookUrl = url || `${process.env.VERCEL_URL || "https://your-app.vercel.app"}/api/telegram/webhook`

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message"],
      }),
    })

    const result = await response.json()

    if (result.ok) {
      return NextResponse.json({
        success: true,
        message: "Webhook установлен успешно",
        webhook_url: webhookUrl,
      })
    } else {
      return NextResponse.json(
        {
          error: "Ошибка установки webhook",
          details: result,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Ошибка установки webhook:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
