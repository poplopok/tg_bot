"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Copy, ExternalLink, Settings } from "lucide-react"

export default function SetupPage() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [isSettingWebhook, setIsSettingWebhook] = useState(false)
  const [webhookResult, setWebhookResult] = useState<any>(null)

  const setupWebhook = async () => {
    setIsSettingWebhook(true)
    try {
      const response = await fetch("/api/telegram/set-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: webhookUrl }),
      })

      const result = await response.json()
      setWebhookResult(result)
    } catch (error) {
      setWebhookResult({ error: "Ошибка при настройке webhook" })
    } finally {
      setIsSettingWebhook(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Настройка Telegram Бота</h1>
          <p className="text-gray-600">Следуйте инструкциям для подключения бота анализа эмоций</p>
        </div>

        {/* Шаг 1: Создание бота */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Шаг 1: Создание Telegram бота
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p>
                1. Откройте Telegram и найдите бота <strong>@BotFather</strong>
              </p>
              <p>
                2. Отправьте команду <code className="bg-gray-100 px-2 py-1 rounded">/newbot</code>
              </p>
              <p>3. Введите имя для вашего бота (например: "Анализатор Эмоций")</p>
              <p>4. Введите username (например: "emotion_analyzer_bot")</p>
              <p>5. Скопируйте полученный токен</p>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Важно:</strong> Сохраните токен в переменных окружения как <code>TELEGRAM_BOT_TOKEN</code>
              </AlertDescription>
            </Alert>

            <Button onClick={() => window.open("https://t.me/BotFather", "_blank")} className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Открыть @BotFather
            </Button>
          </CardContent>
        </Card>

        {/* Шаг 2: Настройка webhook */}
        <Card>
          <CardHeader>
            <CardTitle>Шаг 2: Настройка Webhook</CardTitle>
            <CardDescription>Укажите URL вашего приложения для получения сообщений</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL Webhook:</label>
              <Input
                placeholder="https://your-app.vercel.app/api/telegram/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>

            <Button onClick={setupWebhook} disabled={!webhookUrl || isSettingWebhook} className="w-full">
              {isSettingWebhook ? "Настраиваю..." : "Установить Webhook"}
            </Button>

            {webhookResult && (
              <Alert className={webhookResult.success ? "border-green-500" : "border-red-500"}>
                <AlertDescription>
                  {webhookResult.success ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Webhook успешно установлен!
                    </div>
                  ) : (
                    <div className="text-red-600">Ошибка: {webhookResult.error}</div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Шаг 3: Переменные окружения */}
        <Card>
          <CardHeader>
            <CardTitle>Шаг 3: Переменные окружения</CardTitle>
            <CardDescription>Добавьте эти переменные в настройки Vercel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <code>TELEGRAM_BOT_TOKEN=your_bot_token_here</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("TELEGRAM_BOT_TOKEN=your_bot_token_here")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <code>OPENAI_API_KEY=your_openai_key_here</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("OPENAI_API_KEY=your_openai_key_here")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                Добавьте эти переменные в настройках проекта Vercel: Settings → Environment Variables
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Шаг 4: Использование */}
        <Card>
          <CardHeader>
            <CardTitle>Шаг 4: Как использовать бота</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">Команды бота:</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <code>/start</code> - запуск и приветствие
                </li>
                <li>
                  <code>/help</code> - справка по использованию
                </li>
                <li>
                  <code>/analyze</code> - анализ сообщения (ответом на сообщение)
                </li>
              </ul>

              <h4 className="font-medium">Автоматический анализ:</h4>
              <p className="text-sm text-gray-600">
                Бот автоматически анализирует сообщения длиннее 10 символов и показывает результат, если обнаружены
                выраженные эмоции или высокая токсичность.
              </p>

              <h4 className="font-medium">Примеры сообщений для тестирования:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-red-50 p-2 rounded">
                  <strong>Негативные:</strong>
                  <br />
                  "Опять этот дедлайн! 😤"
                  <br />
                  "Ну конечно, все по плану... 🙄"
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <strong>Позитивные:</strong>
                  <br />
                  "Отличная работа! 🎉"
                  <br />
                  "Спасибо за фидбек 👍"
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
