"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface EmotionData {
  date: string
  joy: number
  anger: number
  sadness: number
  fear: number
  neutral: number
  messageCount: number
}

export function EmotionChart() {
  const [data, setData] = useState<EmotionData[]>([])
  const [loading, setLoading] = useState(true)
  const [messageCount, setMessageCount] = useState(0)

  useEffect(() => {
    fetchEmotionData()
  }, [])

  const fetchEmotionData = async () => {
    try {
      console.log("📊 Fetching emotion data from API...")
      const response = await fetch("/api/analytics/emotions?days=7")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("📈 Emotion data received:", result)

      if (result.success && result.data) {
        setData(result.data)
        setMessageCount(result.messageCount || 0)
        console.log(`✅ Loaded ${result.data.length} days of emotion data`)
      } else {
        console.warn("⚠️ No emotion data from API, using mock data")
        setData(generateMockData())
        setMessageCount(0)
      }
    } catch (error) {
      console.error("❌ Failed to fetch emotion data:", error)
      setData(generateMockData())
      setMessageCount(0)
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = (): EmotionData[] => {
    const days = 7
    const data: EmotionData[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      data.push({
        date: date.toLocaleDateString("ru-RU", { month: "short", day: "numeric" }),
        joy: Math.random() * 0.4 + 0.3, // 30-70%
        anger: Math.random() * 0.2 + 0.05, // 5-25%
        sadness: Math.random() * 0.15 + 0.05, // 5-20%
        fear: Math.random() * 0.1 + 0.02, // 2-12%
        neutral: Math.random() * 0.3 + 0.2, // 20-50%
        messageCount: 0,
      })
    }

    return data
  }

  if (loading) {
    return <div className="h-64 bg-gray-100 animate-pulse rounded" />
  }

  const hasRealData = messageCount > 0

  return (
    <div className="space-y-4">
      {!hasRealData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            📊 Показаны демо-данные. Отправьте сообщения в чат с ботом для получения реальной статистики.
          </p>
        </div>
      )}

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
            <Tooltip
              formatter={(value: number) => [`${(value * 100).toFixed(1)}%`]}
              labelFormatter={(label) => `Дата: ${label}`}
            />
            <Legend />
            <Line type="monotone" dataKey="joy" stroke="#10b981" strokeWidth={2} name="Радость" />
            <Line type="monotone" dataKey="anger" stroke="#ef4444" strokeWidth={2} name="Гнев" />
            <Line type="monotone" dataKey="sadness" stroke="#3b82f6" strokeWidth={2} name="Грусть" />
            <Line type="monotone" dataKey="fear" stroke="#f59e0b" strokeWidth={2} name="Страх" />
            <Line type="monotone" dataKey="neutral" stroke="#6b7280" strokeWidth={2} name="Нейтральность" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {hasRealData && (
        <div className="text-sm text-gray-600 text-center">
          Проанализировано {messageCount} сообщений за последние 7 дней
        </div>
      )}
    </div>
  )
}
