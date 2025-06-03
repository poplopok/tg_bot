import { NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://your-app.vercel.app"

export async function POST() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: `${WEBHOOK_URL}/api/telegram/webhook`,
        allowed_updates: ["message"],
      }),
    })

    const data = await response.json()

    if (data.ok) {
      return NextResponse.json({ success: true, message: "Webhook установлен успешно" })
    } else {
      return NextResponse.json({ success: false, error: data.description })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Ошибка установки webhook" })
  }
}
