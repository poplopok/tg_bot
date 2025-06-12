import { NextResponse } from "next/server"
import { getTeamAnalytics } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get("chatId")

    console.log("👥 Fetching team analytics from database...")

    const messages = await getTeamAnalytics(chatId ? Number.parseInt(chatId) : undefined)

    console.log(`📊 Found ${messages.length} messages for team analysis`)

    // Обрабатываем данные для команды
    const teamStats = processTeamData(messages)

    return NextResponse.json({
      success: true,
      stats: teamStats.stats,
      members: teamStats.members,
      messageCount: messages.length,
    })
  } catch (error) {
    console.error("❌ Team analytics API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch team analytics" }, { status: 500 })
  }
}

function processTeamData(messages: any[]) {
  if (messages.length === 0) {
    return {
      stats: {
        totalMembers: 0,
        averagePositivity: 0,
        highRiskMembers: 0,
        mostActiveHour: "N/A",
      },
      members: [],
    }
  }

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
    const avgPositivity = stats.messageCount > 0 ? stats.totalJoy / stats.messageCount : 0
    const avgNegativity =
      stats.messageCount > 0 ? (stats.totalAnger + stats.totalSadness + stats.totalFear) / stats.messageCount : 0
    const avgToxicity = stats.messageCount > 0 ? stats.totalToxicity / stats.messageCount : 0

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
  const averagePositivity =
    totalMembers > 0 ? members.reduce((sum, member) => sum + member.averagePositivity, 0) / totalMembers : 0
  const highRiskMembers = members.filter((member) => member.riskLevel === "high").length

  // Находим самый активный час
  const hourCounts = new Array(24).fill(0)
  messages.forEach((msg) => {
    const hour = new Date(msg.created_at).getHours()
    hourCounts[hour]++
  })
  const mostActiveHourIndex = hourCounts.indexOf(Math.max(...hourCounts))
  const mostActiveHour = `${mostActiveHourIndex.toString().padStart(2, "0")}:00`

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

  if (max === 0) return "Нейтральность"
  if (max === joy) return "Радость"
  if (max === anger) return "Гнев"
  if (max === sadness) return "Грусть"
  if (max === fear) return "Страх"
  return "Нейтральность"
}
