"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Copy, ExternalLink, Settings } from "lucide-react"

export default function SetupPage() {
  const [botToken, setBotToken] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)
  const [loading, setLoading] = useState(false)

  const setupWebhook = async () => {
    if (!botToken) {
      alert("Введите токен бота")
      return
    }

    setLoading(true)
    try {
      const webhookEndpoint = `${window.location.origin}/api/telegram/webhook`

      const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookEndpoint,
          allowed_updates: ["message", "edited_message"],
        }),
      })

      const result = await response.json()

      if (result.ok) {
        setWebhookUrl(webhookEndpoint)
        setIsConfigured(true)
        alert("Webhook успешно настроен!")
      } else {
        alert(`Ошибка настройки webhook: ${result.description}`)
      }
    } catch (error) {
      alert("Ошибка подключения к Telegram API")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Скопировано в буфер обмена!")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Настройка Telegram бота</h1>
        <p className="text-gray-600">Пошаговая инструкция по настройке бота для анализа эмоций</p>
      </div>

      <div className="grid gap-6">
        {/* Шаг 1: Создание бота */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                1
              </span>
              Создание Telegram бота
            </CardTitle>
            <CardDescription>Получите токен бота от BotFather</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Инструкция:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Откройте Telegram и найдите @BotFather</li>
                <li>Отправьте команду /newbot</li>
                <li>Введите имя для вашего бота</li>
                <li>Введите username (должен заканчиваться на "bot")</li>
                <li>Скопируйте полученный токен</li>
              </ol>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Открыть BotFather
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Шаг 2: Настройка токена */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                2
              </span>
              Настройка токена
            </CardTitle>
            <CardDescription>Введите токен бота для настройки webhook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bot-token">Токен бота</Label>
              <div className="flex space-x-2">
                <Input
                  id="bot-token"
                  type="password"
                  placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                />
                <Button onClick={setupWebhook} disabled={loading || !botToken}>
                  {loading ? "Настройка..." : "Настроить"}
                </Button>
              </div>
            </div>

            {isConfigured && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-800 font-medium">Webhook успешно настроен!</span>
                </div>
                <div className="mt-2 text-sm text-green-700">
                  URL: {webhookUrl}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(webhookUrl)}
                    className="ml-2 h-6 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Шаг 3: Переменные окружения */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                3
              </span>
              Переменные окружения
            </CardTitle>
            <CardDescription>Настройте переменные окружения в Vercel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Добавьте следующие переменные в Vercel:</h4>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between items-center">
                  <span>TELEGRAM_BOT_TOKEN</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard("TELEGRAM_BOT_TOKEN")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span>HUGGINGFACE_API_KEY</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard("HUGGINGFACE_API_KEY")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span>SUPABASE_URL</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard("SUPABASE_URL")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span>SUPABASE_SERVICE_ROLE_KEY</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard("SUPABASE_SERVICE_ROLE_KEY")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" asChild>
                <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Получить Hugging Face API Key
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Настроить Supabase
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Шаг 4: Добавление в чат */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                4
              </span>
              Добавление бота в чат
            </CardTitle>
            <CardDescription>Добавьте бота в корпоративный чат</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Инструкция:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Откройте корпоративный чат в Telegram</li>
                <li>Нажмите на название чата → "Управление группой"</li>
                <li>Выберите "Добавить участника"</li>
                <li>Найдите вашего бота по username</li>
                <li>Добавьте бота и дайте права администратора</li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Важно:</h4>
              <p className="text-sm text-blue-700">
                Бот должен иметь права администратора для чтения всех сообщений в группе. Без этих прав анализ эмоций
                работать не будет.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Шаг 5: Тестирование */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                5
              </span>
              Тестирование
            </CardTitle>
            <CardDescription>Проверьте работу бота</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Тестовые сообщения:</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white p-2 rounded border">
                  <span className="text-sm">"Отличная работа команды! 🚀"</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Позитив
                  </Badge>
                </div>
                <div className="flex items-center justify-between bg-white p-2 rounded border">
                  <span className="text-sm">"Этот проект полная ерунда"</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Токсичность
                  </Badge>
                </div>
                <div className="flex items-center justify-between bg-white p-2 rounded border">
                  <span className="text-sm">"Нужно исправить баг"</span>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    Нейтрально
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button asChild>
                <a href="/dashboard">
                  <Settings className="h-4 w-4 mr-2" />
                  Перейти к дашборду
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
