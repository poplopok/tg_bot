"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mic, MessageSquare } from "lucide-react"

interface Message {
  id: string
  username: string
  text: string
  messageType: "text" | "voice" | "video_note"
  emotions: {
    joy: number
    anger: number
    sadness: number
    fear: number
    toxicity: number
    sentiment: "positive" | "negative" | "neutral"
  }
  timestamp: string
}

export function MessagesList() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000) // Обновляем каждые 5 секунд
    return () => clearInterval(interval)
  }, [])

  const fetchMessages = async () => {
    try {
      console.log("📡 Fetching messages from API...")
      const response = await fetch("/api/messages?limit=20")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("📨 Messages received:", result)

      if (result.success && result.messages) {
        setMessages(result.messages)
      } else {
        console.warn("⚠️ No messages in response, using mock data")
        setMessages(generateMockMessages())
      }
    } catch (error) {
      console.error("❌ Failed to fetch messages:", error)
      setMessages(generateMockMessages())
    } finally {
      setLoading(false)
    }
  }

  const generateMockMessages = (): Message[] => {
    const mockMessages = [
      {
        username: "Алексей",
        text: "Отличная работа команды! Проект готов к релизу 🚀",
        messageType: "text" as const,
        emotions: { joy: 0.8, anger: 0.1, sadness: 0.05, fear: 0.05, toxicity: 0.1, sentiment: "positive" as const },
      },
      {
        username: "Мария",
        text: "[Голосовое сообщение - 15 сек]",
        messageType: "voice" as const,
        emotions: { joy: 0.3, anger: 0.2, sadness: 0.1, fear: 0.4, toxicity: 0.3, sentiment: "negative" as const },
      },
      {
        username: "Дмитрий",
        text: "Нужно срочно исправить баг в продакшене",
        messageType: "text" as const,
        emotions: { joy: 0.1, anger: 0.3, sadness: 0.2, fear: 0.4, toxicity: 0.4, sentiment: "negative" as const },
      },
      {
        username: "Елена",
        text: "Спасибо за помощь! Все работает как надо",
        messageType: "text" as const,
        emotions: { joy: 0.7, anger: 0.05, sadness: 0.05, fear: 0.2, toxicity: 0.1, sentiment: "positive" as const },
      },
    ]

    return mockMessages.map((msg, index) => ({
      id: `msg-${index}`,
      ...msg,
      timestamp: new Date(Date.now() - index * 300000).toISOString(), // Каждые 5 минут назад
    }))
  }

  const getEmotionColor = (emotions: Message["emotions"]) => {
    if (emotions.toxicity > 0.6) return "bg-red-100 text-red-800"
    if (emotions.sentiment === "positive") return "bg-green-100 text-green-800"
    if (emotions.sentiment === "negative") return "bg-orange-100 text-orange-800"
    return "bg-gray-100 text-gray-800"
  }

  const getDominantEmotion = (emotions: Message["emotions"]) => {
    const { joy, anger, sadness, fear } = emotions
    const max = Math.max(joy, anger, sadness, fear)

    if (max === joy) return "Радость"
    if (max === anger) return "Гнев"
    if (max === sadness) return "Грусть"
    if (max === fear) return "Страх"
    return "Нейтральность"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3 p-4 bg-gray-50 animate-pulse rounded-lg">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {messages.map((message) => (
        <div key={message.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
          <Avatar>
            <AvatarFallback>{message.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">{message.username}</span>
                {message.messageType === "voice" && <Mic className="h-4 w-4 text-blue-500" />}
                {message.messageType === "video_note" && <MessageSquare className="h-4 w-4 text-purple-500" />}
              </div>
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <p className="text-sm text-gray-900 mb-2 break-words">{message.text}</p>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className={getEmotionColor(message.emotions)}>
                {getDominantEmotion(message.emotions)}
              </Badge>

              {message.emotions.toxicity > 0.5 && (
                <Badge variant="destructive" className="text-xs">
                  Токсичность: {(message.emotions.toxicity * 100).toFixed(0)}%
                </Badge>
              )}

              <Badge variant="outline" className="text-xs">
                {message.emotions.sentiment === "positive" && "😊"}
                {message.emotions.sentiment === "negative" && "😔"}
                {message.emotions.sentiment === "neutral" && "😐"}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
