import { NextResponse } from "next/server"

export async function POST() {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not configured" }, { status: 400 })
    }

    // Определяем URL для webhook
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL
        ? process.env.NEXTAUTH_URL
        : "http://localhost:3000"

    const webhookUrl = `${baseUrl}/api/telegram`

    console.log("Setting webhook to:", webhookUrl)

    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message"],
        drop_pending_updates: true,
      }),
    })

    const data = await response.json()
    console.log("Webhook setup response:", data)

    if (data.ok) {
      return NextResponse.json({
        success: true,
        message: "Webhook успешно настроен",
        webhook_url: webhookUrl,
      })
    } else {
      return NextResponse.json({ error: data.description || "Failed to set webhook" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error setting webhook:", error)
    return NextResponse.json({ error: "Failed to set webhook" }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not configured" }, { status: 400 })
    }

    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getWebhookInfo`)

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error getting webhook info:", error)
    return NextResponse.json({ error: "Failed to get webhook info" }, { status: 500 })
  }
}
