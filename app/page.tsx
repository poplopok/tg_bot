"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bot, MessageCircle, Mic, Settings } from "lucide-react"

export default function HomePage() {
  const [botStatus, setBotStatus] = useState<"checking" | "active" | "inactive">("checking")
  const [webhookUrl, setWebhookUrl] = useState("")

  const setupWebhook = async () => {
    try {
      const response = await fetch("/api/webhook/setup", {
        method: "POST",
      })
      const data = await response.json()

      if (data.ok) {
        setBotStatus("active")
        alert("Webhook успешно настроен!")
      } else {
        alert("Ошибка настройки webhook: " + data.description)
      }
    } catch (error) {
      alert("Ошибка: " + error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Bot className="h-12 w-12 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Emotion Analysis Bot</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Telegram бот для анализа эмоций в текстовых и голосовых сообщениях с использованием моделей Hugging Face
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Статус бота</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant={botStatus === "active" ? "default" : "secondary"}>
                  {botStatus === "active" ? "Активен" : "Неактивен"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Поддерживаемые типы</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Badge variant="outline">Текст</Badge>
                <Badge variant="outline">Голос</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Модели ИИ</CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Hugging Face моделей</p>
            </CardContent>
          </Card>
        </div>

        {/* Setup Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Настройка бота</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Webhook URL</label>
              <div className="flex space-x-2 mt-1">
                <Input
                  value={typeof window !== "undefined" ? `${window.location.origin}/api/telegram` : "/api/telegram"}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={setupWebhook}>Настроить Webhook</Button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Необходимые переменные окружения:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>
                  • <code>TELEGRAM_BOT_TOKEN</code> - токен Telegram бота
                </li>
                <li>
                  • <code>HUGGINGFACE_API_KEY</code> - API ключ Hugging Face
                </li>
                <li>
                  • <code>NEXT_PUBLIC_SUPABASE_URL</code> - URL Supabase проекта
                </li>
                <li>
                  • <code>SUPABASE_SERVICE_ROLE_KEY</code> - сервисный ключ Supabase
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Анализ текстовых сообщений</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Определение эмоций в русском тексте</li>
                <li>• Обработка сленга и опечаток</li>
                <li>• Поддержка эмодзи и сокращений</li>
                <li>• Контекстуальный анализ</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Анализ голосовых сообщений</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Распознавание русской речи</li>
                <li>• Преобразование речи в текст</li>
                <li>• Анализ эмоций в голосе</li>
                <li>• Обработка фоновых шумов</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрый старт</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Создайте Telegram бота</p>
                  <p className="text-sm text-gray-600">Напишите @BotFather и создайте нового бота</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Настройте переменные окружения</p>
                  <p className="text-sm text-gray-600">Добавьте все необходимые API ключи</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Настройте webhook</p>
                  <p className="text-sm text-gray-600">Нажмите кнопку "Настроить Webhook" выше</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <p className="font-medium">Начните использовать</p>
                  <p className="text-sm text-gray-600">Отправьте сообщение боту в Telegram</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
