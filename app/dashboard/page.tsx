"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@supabase/supabase-js"
import { MessageSquare, Users, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react"

const supabase = createClient(
  "https://ikaufpurzmxnalsaffwa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYXVmcHVyem14bmFsc2FmZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NDU2MjQsImV4cCI6MjA2NDAyMTYyNH0.A9dW6-FzZZsLOdhsxygHEgBmTqJXyS260QIcPB9IplA",
)

interface Message {
  id: number
  chat_id: number
  username: string
  message_text: string
  created_at: string
  emotion_analysis: {
    primary_emotion: string
    confidence: number
    toxicity: number
    sentiment: string
    explanation: string
  }[]
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalUsers: 0,
    toxicMessages: 0,
    avgSentiment: 0,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      // Получаем сообщения за последние 24 часа
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select(`
          *,
          emotion_analysis (*)
        `)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(50)

      if (messagesError) throw messagesError

      setMessages(messagesData || [])

      // Вычисляем статистику
      const totalMessages = messagesData?.length || 0
      const uniqueUsers = new Set(messagesData?.map((m) => m.username)).size
      const toxicMessages = messagesData?.filter((m) => (m.emotion_analysis?.[0]?.toxicity || 0) > 0.5).length || 0

      const sentiments = messagesData?.map((m) => m.emotion_analysis?.[0]?.sentiment).filter(Boolean) || []
      const positiveCount = sentiments.filter((s) => s === "positive").length
      const avgSentiment = sentiments.length > 0 ? (positiveCount / sentiments.length) * 100 : 0

      setStats({
        totalMessages,
        totalUsers: uniqueUsers,
        toxicMessages,
        avgSentiment,
      })
    } catch (error) {
      console.error("Ошибка загрузки данных:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Подписка на новые сообщения
    const subscription = supabase
      .channel("messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const getEmotionEmoji = (emotion: string) => {
    const emojis: { [key: string]: string } = {
      радость: "😊",
      грусть: "😢",
      гнев: "😡",
      страх: "😰",
      удивление: "😲",
      отвращение: "🤢",
      нейтрально: "😐",
    }
    return emojis[emotion] || "🤔"
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600"
      case "negative":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Дашборд анализа эмоций</h1>
            <p className="text-gray-600">Мониторинг эмоций в Telegram чатах</p>
          </div>
          <Button onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalMessages}</p>
                  <p className="text-sm text-gray-600">Сообщений за 24ч</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-sm text-gray-600">Активных пользователей</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.toxicMessages}</p>
                  <p className="text-sm text-gray-600">Токсичных сообщений</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{Math.round(stats.avgSentiment)}%</p>
                  <p className="text-sm text-gray-600">Позитивность</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Последние сообщения */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Последние проанализированные сообщения</CardTitle>
            <CardDescription>Результаты анализа эмоций в реальном времени</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2">Загрузка...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Нет данных для отображения</div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const analysis = message.emotion_analysis?.[0]
                  if (!analysis) return null

                  return (
                    <div key={message.id} className="p-4 rounded-lg border bg-gray-50/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">@{message.username}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(message.created_at).toLocaleString("ru-RU")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getEmotionEmoji(analysis.primary_emotion)}
                            {analysis.primary_emotion}
                          </Badge>
                          <Badge
                            variant={analysis.toxicity > 0.5 ? "destructive" : "secondary"}
                            className={getSentimentColor(analysis.sentiment)}
                          >
                            {analysis.sentiment}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-gray-800 mb-3">{message.message_text}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Уверенность:</span>
                          <Progress value={analysis.confidence * 100} className="h-2 mt-1" />
                          <span className="text-xs text-gray-500">{Math.round(analysis.confidence * 100)}%</span>
                        </div>

                        <div>
                          <span className="text-gray-600">Токсичность:</span>
                          <Progress value={analysis.toxicity * 100} className="h-2 mt-1" />
                          <span className="text-xs text-gray-500">{Math.round(analysis.toxicity * 100)}%</span>
                        </div>

                        <div>
                          <span className="text-gray-600">Объяснение:</span>
                          <p className="text-xs text-gray-700 mt-1">{analysis.explanation}</p>
                        </div>
                      </div>

                      {analysis.toxicity > 0.7 && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                          <div className="flex items-center gap-2 text-red-800">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">Высокая токсичность - требуется модерация</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
