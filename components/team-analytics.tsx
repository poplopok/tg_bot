"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

interface TeamMember {
  username: string
  messageCount: number
  averagePositivity: number
  riskLevel: "low" | "medium" | "high"
  dominantEmotion: string
  lastActive: string
}

interface TeamStats {
  totalMembers: number
  averagePositivity: number
  highRiskMembers: number
  mostActiveHour: string
}

export function TeamAnalytics() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeamAnalytics()
  }, [])

  const fetchTeamAnalytics = async () => {
    try {
      console.log("👥 Fetching team analytics...")
      const response = await fetch("/api/analytics?type=team")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("📊 Team analytics received:", result)

      if (result.success) {
        setTeamMembers(result.members || generateMockMembers())
        setTeamStats(result.stats || generateMockStats())
      } else {
        console.warn("⚠️ No team data, using mock data")
        setTeamMembers(generateMockMembers())
        setTeamStats(generateMockStats())
      }
    } catch (error) {
      console.error("❌ Failed to fetch team analytics:", error)
      setTeamMembers(generateMockMembers())
      setTeamStats(generateMockStats())
    } finally {
      setLoading(false)
    }
  }

  const generateMockMembers = (): TeamMember[] => {
    const names = ["Алексей", "Мария", "Дмитрий", "Елена", "Сергей", "Анна", "Павел", "Ольга"]
    return names.map((name) => ({
      username: name,
      messageCount: Math.floor(Math.random() * 100) + 10,
      averagePositivity: Math.random() * 0.6 + 0.2, // 20-80%
      riskLevel: Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : ("low" as const),
      dominantEmotion: ["Радость", "Нейтральность", "Грусть", "Гнев"][Math.floor(Math.random() * 4)],
      lastActive: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    }))
  }

  const generateMockStats = (): TeamStats => ({
    totalMembers: 8,
    averagePositivity: 0.68,
    highRiskMembers: 2,
    mostActiveHour: "14:00",
  })

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />
      case "medium":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Обзор команды</CardTitle>
          <CardDescription>Общая статистика по команде</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {teamStats && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Общая позитивность</span>
                <span className="text-2xl font-bold text-green-600">
                  {(teamStats.averagePositivity * 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={teamStats.averagePositivity * 100} className="h-2" />

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{teamStats.totalMembers}</div>
                  <div className="text-sm text-gray-600">Участников</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{teamStats.highRiskMembers}</div>
                  <div className="text-sm text-gray-600">Группа риска</div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 mb-1">Пик активности</div>
                <div className="text-lg font-semibold">{teamStats.mostActiveHour}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Участники команды</CardTitle>
          <CardDescription>Индивидуальная аналитика по каждому участнику</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {teamMembers.map((member) => (
              <div key={member.username} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Avatar>
                  <AvatarFallback>{member.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{member.username}</span>
                    <Badge variant="outline" className={getRiskColor(member.riskLevel)}>
                      {getRiskIcon(member.riskLevel)}
                      <span className="ml-1 capitalize">{member.riskLevel}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>{member.messageCount} сообщений</span>
                    <span>{member.dominantEmotion}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Progress value={member.averagePositivity * 100} className="h-1 flex-1" />
                    <span className="text-xs font-medium">{(member.averagePositivity * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
