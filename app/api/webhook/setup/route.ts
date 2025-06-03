import { NextResponse } from "next/server"

export async function POST() {
  try {
    const webhookUrl = `${process.env.VERCEL_URL || "https://your-domain.vercel.app"}/api/telegram`

    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message"],
      }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to set webhook" }, { status: 500 })
  }
}
