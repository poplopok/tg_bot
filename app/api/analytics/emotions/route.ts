import { NextResponse } from "next/server"
import { getEmotionAnalytics } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get("chatId")
    const days = Number.parseInt(searchParams.get("days") || "7")

    console.log("📊 Fetching emotion analytics from database...")

    const messages = await getEmotionAnalytics(chatId ? Number.parseInt(chatId) : undefined, days)

    console.log(`📈 Found ${messages.length} messages for emotion analysis`)

    // Обрабатываем данные для графика эмоций
    const chartData = processEmotionData(messages, days)

    return NextResponse.json({
      success: true,
      data: chartData,
      messageCount: messages.length,
    })
  } catch (error) {
    console.error("❌ Emotion analytics API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch emotion analytics" }, { status: 500 })
  }
}

function processEmotionData(messages: any[], days: number) {
  const result = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const dayMessages = messages.filter((msg) => {
      const msgDate = new Date(msg.created_at)
      return msgDate >= date && msgDate < nextDate
    })

    if (dayMessages.length > 0) {
      const avgEmotions = {
        joy: dayMessages.reduce((sum, msg) => sum + (msg.joy || 0), 0) / dayMessages.length,
        anger: dayMessages.reduce((sum, msg) => sum + (msg.anger || 0), 0) / dayMessages.length,
        sadness: dayMessages.reduce((sum, msg) => sum + (msg.sadness || 0), 0) / dayMessages.length,
        fear: dayMessages.reduce((sum, msg) => sum + (msg.fear || 0), 0) / dayMessages.length,
        neutral: dayMessages.reduce((sum, msg) => sum + (msg.neutral || 0), 0) / dayMessages.length,
      }

      result.push({
        date: date.toLocaleDateString("ru-RU", { month: "short", day: "numeric" }),
        ...avgEmotions,
        messageCount: dayMessages.length,
      })
    } else {
      result.push({
        date: date.toLocaleDateString("ru-RU", { month: "short", day: "numeric" }),
        joy: 0,
        anger: 0,
        sadness: 0,
        fear: 0,
        neutral: 0,
        messageCount: 0,
      })
    }
  }

  return result
}
