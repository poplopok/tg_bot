import { NextResponse } from "next/server"
import { getMessages } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get("chatId")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const messages = await getMessages(chatId ? Number.parseInt(chatId) : undefined, limit)

    const formattedMessages = messages.map((msg) => ({
      id: msg.id.toString(),
      username: msg.username,
      text: msg.text,
      messageType: msg.message_type,
      emotions: {
        joy: msg.joy,
        anger: msg.anger,
        sadness: msg.sadness,
        fear: msg.fear,
        toxicity: msg.toxicity,
        sentiment: msg.sentiment,
      },
      timestamp: msg.created_at,
    }))

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
    })
  } catch (error) {
    console.error("Messages API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 })
  }
}
