import { NextResponse } from "next/server"
import { getEmotionAnalytics, getTeamAnalytics } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get("chatId")
    const type = searchParams.get("type") || "emotions"
    const days = Number.parseInt(searchParams.get("days") || "7")

    if (type === "team") {
      const data = await getTeamAnalytics(chatId ? Number.parseInt(chatId) : undefined)

      // Обрабатываем данные для команды
      const teamStats = processTeamData(data)

      return NextResponse.json({
        success: true,
        stats: teamStats.stats,
        members: teamStats.members,
      })
    } else {
      const data = await getEmotionAnalytics(chatId ? Number.parseInt(chatId) : undefined, days)

      // Обрабатываем данные для графика эмоций
      const chartData = processEmotionData(data, days)

      return NextResponse.json({
        success: true,
        data: chartData,
      })
    }
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
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
      })
    } else {
      result.push({
        date: date.toLocaleDateString("ru-RU", { month: "short", day: "numeric" }),
        joy: 0,
        anger: 0,
        sadness: 0,
        fear: 0,
        neutral: 1,
      })
    }
  }

  return result
}

function processTeamData(messages: any[]) {
  const userStats = new Map()

  messages.forEach((msg) => {
    if (!userStats.has(msg.username)) {
      userStats.set(msg.username, {
        username: msg.username,
        messageCount: 0,
        totalJoy: 0,
        totalAnger: 0,
        totalSadness: 0,
        totalFear: 0,
        totalToxicity: 0,
        lastActive: msg.created_at,
      })
    }

    const stats = userStats.get(msg.username)
    stats.messageCount++
    stats.totalJoy += msg.joy || 0
    stats.totalAnger += msg.anger || 0
    stats.totalSadness += msg.sadness || 0
    stats.totalFear += msg.fear || 0
    stats.totalToxicity += msg.toxicity || 0

    if (new Date(msg.created_at) > new Date(stats.lastActive)) {
      stats.lastActive = msg.created_at
    }
  })

  const members = Array.from(userStats.values()).map((stats) => {
    const avgPositivity = stats.totalJoy / stats.messageCount
    const avgNegativity = (stats.totalAnger + stats.totalSadness + stats.totalFear) / stats.messageCount
    const avgToxicity = stats.totalToxicity / stats.messageCount

    let riskLevel = "low"
    if (avgToxicity > 0.6 || avgNegativity > 0.5) riskLevel = "high"
    else if (avgToxicity > 0.3 || avgNegativity > 0.3) riskLevel = "medium"

    const dominantEmotion = getDominantEmotion({
      joy: stats.totalJoy / stats.messageCount,
      anger: stats.totalAnger / stats.messageCount,
      sadness: stats.totalSadness / stats.messageCount,
      fear: stats.totalFear / stats.messageCount,
    })

    return {
      username: stats.username,
      messageCount: stats.messageCount,
      averagePositivity: avgPositivity,
      riskLevel,
      dominantEmotion,
      lastActive: stats.lastActive,
    }
  })

  const totalMembers = members.length
  const averagePositivity = members.reduce((sum, member) => sum + member.averagePositivity, 0) / totalMembers
  const highRiskMembers = members.filter((member) => member.riskLevel === "high").length

  // Находим самый активный час (упрощенная версия)
  const mostActiveHour = "14:00"

  return {
    stats: {
      totalMembers,
      averagePositivity,
      highRiskMembers,
      mostActiveHour,
    },
    members,
  }
}

function getDominantEmotion(emotions: any) {
  const { joy, anger, sadness, fear } = emotions
  const max = Math.max(joy, anger, sadness, fear)

  if (max === joy) return "Радость"
  if (max === anger) return "Гнев"
  if (max === sadness) return "Грусть"
  if (max === fear) return "Страх"
  return "Нейтральность"
}
