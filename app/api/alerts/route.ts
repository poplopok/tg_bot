import { NextResponse } from "next/server"
import { getAlerts } from "@/lib/database"

export async function GET() {
  try {
    const [activeAlerts, resolvedAlerts] = await Promise.all([
      getAlerts(false), // Активные
      getAlerts(true), // Решенные
    ])

    const formatAlert = (alert: any) => ({
      id: alert.id.toString(),
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      username: alert.username,
      chatId: alert.chat_id.toString(),
      timestamp: alert.created_at,
      resolved: alert.resolved,
    })

    return NextResponse.json({
      success: true,
      alerts: [...activeAlerts.map(formatAlert), ...resolvedAlerts.map(formatAlert)],
    })
  } catch (error) {
    console.error("Alerts API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch alerts" }, { status: 500 })
  }
}
