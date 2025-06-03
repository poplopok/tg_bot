"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, MessageCircle, TrendingUp, AlertCircle } from "lucide-react"

interface EmotionStats {
  emotionCounts: { [key: string]: number }
  avgConfidence: number
  total: number
  uniqueUsers: number
  recentAnalyses: any[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<EmotionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    // Initialize Supabase client only on client side
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      setError("Supabase configuration missing. Please check environment variables.")
      setLoading(false)
      return
    }

    try {
      const client = createClient(supabaseUrl, supabaseKey)
      setSupabase(client)
    } catch (err) {
      setError("Failed to initialize Supabase client")
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    async function fetchStats() {
      try {
        setError(null)

        // Получаем данные за последние 24 часа
        const { data: analyses, error: fetchError } = await supabase
          .from("emotion_analysis")
          .select("*")
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        if (analyses) {
          const emotionCounts = analyses.reduce((acc: any, item: any) => {
            acc[item.emotion_label] = (acc[item.emotion_label] || 0) + 1
            return acc
          }, {})

          const avgConfidence =
            analyses.length > 0
              ? analyses.reduce((sum: number, item: any) => sum + item.confidence, 0) / analyses.length
              : 0

          const uniqueUsers = new Set(analyses.map((item) => item.user_id)).size

          setStats({
            emotionCounts,
            avgConfidence,
            total: analyses.length,
            uniqueUsers,
            recentAnalyses: analyses.slice(0, 10),
          })
        } else {
          setStats({
            emotionCounts: {},
            avgConfidence: 0,
            total: 0,
            uniqueUsers: 0,
            recentAnalyses: [],
          })
        }
      } catch (err: any) {
        console.error("Error fetching stats:", err)
        setError(err.message || "Failed to fetch statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Обновляем данные каждые 30 секунд
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка статистики...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Нет данных для отображения</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Панель управления ботом</h1>
          <Badge variant="outline" className="text-sm">
            Обновлено: {new Date().toLocaleTimeString("ru-RU")}
          </Badge>
        </div>

        {/* Основная статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Анализов за 24ч</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">сообщений проанализировано</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Уникальных пользователей</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">активных пользователей</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средняя уверенность</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.avgConfidence * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">точность анализа</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Типов эмоций</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.emotionCounts).length}</div>
              <p className="text-xs text-muted-foreground">различных эмоций</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Распределение эмоций */}
          <Card>
            <CardHeader>
              <CardTitle>Распределение эмоций</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.emotionCounts).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(stats.emotionCounts)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([emotion, count]) => {
                      const percentage = (((count as number) / stats.total) * 100).toFixed(1)
                      return (
                        <div key={emotion} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{emotion}</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Нет данных об эмоциях</p>
              )}
            </CardContent>
          </Card>

          {/* Последние анализы */}
          <Card>
            <CardHeader>
              <CardTitle>Последние анализы</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentAnalyses.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {stats.recentAnalyses.map((analysis, index) => (
                    <div key={index} className="border-b border-gray-100 pb-2 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {analysis.emotion_label}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(analysis.created_at).toLocaleTimeString("ru-RU")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate">{analysis.message_text}</p>
                      <p className="text-xs text-gray-400">Уверенность: {(analysis.confidence * 100).toFixed(1)}%</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Нет данных для отображения</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Force dynamic rendering
export const dynamic = "force-dynamic"
