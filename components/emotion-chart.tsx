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
}

export function EmotionChart() {
  const [data, setData] = useState<EmotionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmotionData()
  }, [])

  const fetchEmotionData = async () => {
    try {
      const response = await fetch("/api/analytics/emotions")
      const result = await response.json()
      setData(result.data || generateMockData())
    } catch (error) {
      console.error("Failed to fetch emotion data:", error)
      setData(generateMockData())
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
      })
    }

    return data
  }

  if (loading) {
    return <div className="h-64 bg-gray-100 animate-pulse rounded" />
  }

  return (
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
  )
}
