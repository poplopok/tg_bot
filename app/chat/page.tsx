"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Bot, User, AlertTriangle, Smile, Frown, Meh } from "lucide-react"
import Link from "next/link"

interface Message {
  id: number
  text: string
  sender: string
  timestamp: Date
  emotion: {
    primary: string
    confidence: number
    details: { [key: string]: number }
  }
  toxicity: number
  isBot?: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Привет всем! Как дела с новым проектом?",
      sender: "Алексей",
      timestamp: new Date(Date.now() - 300000),
      emotion: { primary: "радость", confidence: 0.85, details: { радость: 0.85, нейтрально: 0.15 } },
      toxicity: 0.05,
    },
    {
      id: 2,
      text: "Опять эти дедлайны... Когда уже это закончится?",
      sender: "Мария",
      timestamp: new Date(Date.now() - 240000),
      emotion: { primary: "стресс", confidence: 0.78, details: { стресс: 0.78, разочарование: 0.22 } },
      toxicity: 0.15,
    },
    {
      id: 3,
      text: "Не переживай, мы справимся! Команда у нас отличная 💪",
      sender: "Дмитрий",
      timestamp: new Date(Date.now() - 180000),
      emotion: { primary: "энтузиазм", confidence: 0.92, details: { энтузиазм: 0.92, радость: 0.08 } },
      toxicity: 0.02,
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState("Вы")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const analyzeEmotion = (text: string) => {
    // Простая эмуляция анализа эмоций
    const emotionKeywords = {
      радость: ["отлично", "супер", "здорово", "классно", "👍", "😊", "💪"],
      стресс: ["дедлайн", "срочно", "проблема", "не успеваю", "😰", "😤"],
      гнев: ["ужасно", "бесит", "достало", "идиоты", "😡", "🤬"],
      разочарование: ["плохо", "не получается", "провал", "😞", "😔"],
      энтузиазм: ["давайте", "можем", "получится", "вперед", "🚀", "💪"],
      нейтрально: [],
    }

    let maxScore = 0
    let primaryEmotion = "нейтрально"
    const details: { [key: string]: number } = {}

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      let score = 0
      keywords.forEach((keyword) => {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          score += 0.3
        }
      })

      details[emotion] = Math.min(score, 1)
      if (score > maxScore) {
        maxScore = score
        primaryEmotion = emotion
      }
    })

    // Если не найдено ключевых слов, считаем нейтральным
    if (maxScore === 0) {
      details.нейтрально = 0.8
      maxScore = 0.8
    }

    // Расчет токсичности
    const toxicKeywords = ["идиот", "дурак", "бесит", "достало", "ужас"]
    let toxicity = 0
    toxicKeywords.forEach((keyword) => {
      if (text.toLowerCase().includes(keyword)) {
        toxicity += 0.3
      }
    })

    return {
      primary: primaryEmotion,
      confidence: maxScore,
      details,
      toxicity: Math.min(toxicity, 1),
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const analysis = analyzeEmotion(newMessage)

    const message: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: currentUser,
      timestamp: new Date(),
      emotion: {
        primary: analysis.primary,
        confidence: analysis.confidence,
        details: analysis.details,
      },
      toxicity: analysis.toxicity,
    }

    setMessages([...messages, message])
    setNewMessage("")

    // Добавляем ответ бота если сообщение токсичное
    if (analysis.toxicity > 0.3) {
      setTimeout(() => {
        const botMessage: Message = {
          id: messages.length + 2,
          text: "⚠️ Обнаружена потенциально токсичная коммуникация. Рекомендуется пересмотреть тон сообщения для поддержания позитивной атмосферы в команде.",
          sender: "EmotionBot",
          timestamp: new Date(),
          emotion: { primary: "нейтрально", confidence: 1, details: { нейтрально: 1 } },
          toxicity: 0,
          isBot: true,
        }
        setMessages((prev) => [...prev, botMessage])
      }, 1000)
    }
  }

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case "радость":
      case "энтузиазм":
        return <Smile className="h-4 w-4 text-green-500" />
      case "стресс":
      case "гнев":
      case "разочарование":
        return <Frown className="h-4 w-4 text-red-500" />
      default:
        return <Meh className="h-4 w-4 text-gray-500" />
    }
  }

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case "радость":
        return "bg-green-100 text-green-800"
      case "энтузиазм":
        return "bg-blue-100 text-blue-800"
      case "стресс":
        return "bg-orange-100 text-orange-800"
      case "гнев":
        return "bg-red-100 text-red-800"
      case "разочарование":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Чат-анализатор</h1>
              <p className="text-gray-600">Анализ эмоций в реальном времени</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Input
              placeholder="Ваше имя"
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
              className="w-32"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Корпоративный чат #general</CardTitle>
                <CardDescription>Демонстрация анализа эмоций в реальном времени</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === currentUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          message.isBot
                            ? "bg-yellow-100 border border-yellow-300"
                            : message.sender === currentUser
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          <span className="text-sm font-medium">{message.sender}</span>
                          <span className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</span>
                        </div>

                        <p className="text-sm mb-2">{message.text}</p>

                        {!message.isBot && (
                          <div className="flex items-center gap-2 text-xs">
                            {getEmotionIcon(message.emotion.primary)}
                            <Badge variant="outline" className={getEmotionColor(message.emotion.primary)}>
                              {message.emotion.primary} ({Math.round(message.emotion.confidence * 100)}%)
                            </Badge>
                            {message.toxicity > 0.3 && (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Токсично
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Введите сообщение..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="flex-1 min-h-[40px] max-h-[120px]"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-6">
            {/* Current Emotion Analysis */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Анализ эмоций</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messages.length > 0 &&
                    Object.entries(messages[messages.length - 1]?.emotion.details || {}).map(
                      ([emotion, confidence]) => (
                        <div key={emotion} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{emotion}</span>
                          <span className="text-sm font-medium">{Math.round(confidence * 100)}%</span>
                        </div>
                      ),
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Chat Statistics */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Статистика чата</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Всего сообщений:</span>
                  <span className="font-medium">{messages.length}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Позитивных:</span>
                  <span className="font-medium text-green-600">
                    {messages.filter((m) => ["радость", "энтузиазм"].includes(m.emotion.primary)).length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Негативных:</span>
                  <span className="font-medium text-red-600">
                    {messages.filter((m) => ["стресс", "гнев", "разочарование"].includes(m.emotion.primary)).length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Токсичных:</span>
                  <span className="font-medium text-orange-600">{messages.filter((m) => m.toxicity > 0.3).length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Советы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>💡 Используйте позитивные эмодзи для улучшения атмосферы</p>
                  <p>⚠️ Избегайте слов, которые могут вызвать стресс</p>
                  <p>🤝 Поддерживайте коллег в сложных ситуациях</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
