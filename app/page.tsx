"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [testText, setTestText] = useState("Я очень счастлив сегодня!")
  const [webhookMessage, setWebhookMessage] = useState("")
  const [webhookSuccess, setWebhookSuccess] = useState(false)
  const [modelSearchResults, setModelSearchResults] = useState<any>(null)

  // Поиск доступных моделей
  const findAvailableModels = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test/find-models")
      const data = await response.json()
      setModelSearchResults(data)
      setTestResults((prev) => [...prev, { type: "Model Search", status: "✅", data }])
    } catch (error) {
      setTestResults((prev) => [...prev, { type: "Model Search", status: "❌", data: { error: error.message } }])
    }
    setIsLoading(false)
  }

  // Тест API эмоций
  const testEmotionAPI = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test/emotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testText }),
      })
      const data = await response.json()
      setTestResults((prev) => [...prev, { type: "Emotion API", status: response.ok ? "✅" : "❌", data }])
    } catch (error) {
      setTestResults((prev) => [...prev, { type: "Emotion API", status: "❌", data: { error: error.message } }])
    }
    setIsLoading(false)
  }

  // Тест подключения к Telegram
  const testTelegramConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test/telegram")
      const data = await response.json()
      setTestResults((prev) => [...prev, { type: "Telegram API", status: response.ok ? "✅" : "❌", data }])
    } catch (error) {
      setTestResults((prev) => [...prev, { type: "Telegram API", status: "❌", data: { error: error.message } }])
    }
    setIsLoading(false)
  }

  // Тест Supabase
  const testSupabase = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test/supabase")
      const data = await response.json()
      setTestResults((prev) => [...prev, { type: "Supabase", status: response.ok ? "✅" : "❌", data }])
    } catch (error) {
      setTestResults((prev) => [...prev, { type: "Supabase", status: "❌", data: { error: error.message } }])
    }
    setIsLoading(false)
  }

  // Тест Hugging Face
  const testHuggingFace = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test/huggingface")
      const data = await response.json()
      setTestResults((prev) => [...prev, { type: "Hugging Face", status: response.ok ? "✅" : "❌", data }])
    } catch (error) {
      setTestResults((prev) => [...prev, { type: "Hugging Face", status: "❌", data: { error: error.message } }])
    }
    setIsLoading(false)
  }

  // Настройка webhook
  const setupWebhook = async () => {
    setIsLoading(true)
    setWebhookMessage("")

    try {
      const response = await fetch("/api/telegram/setup", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setWebhookMessage("Webhook успешно настроен! Бот готов к работе.")
        setWebhookSuccess(true)
      } else {
        setWebhookMessage(`Ошибка: ${data.error}`)
        setWebhookSuccess(false)
      }
    } catch (error) {
      setWebhookMessage("Произошла ошибка при настройке webhook")
      setWebhookSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
    setModelSearchResults(null)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🤖 Telegram бот для анализа эмоций</h1>
        <p className="text-gray-600">Настройка и тестирование системы анализа эмоций</p>
      </div>

      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">🔍 Поиск моделей</TabsTrigger>
          <TabsTrigger value="test">🧪 Тестирование</TabsTrigger>
          <TabsTrigger value="setup">🚀 Настройка</TabsTrigger>
          <TabsTrigger value="instructions">📖 Инструкции</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🔍 Поиск доступных моделей</CardTitle>
              <CardDescription>Найдем модели Hugging Face, к которым у вас есть доступ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={findAvailableModels} disabled={isLoading} className="w-full">
                {isLoading ? "Поиск моделей..." : "🔍 Найти доступные модели"}
              </Button>

              {modelSearchResults && (
                <div className="space-y-4">
                  <Alert className="border-green-500">
                    <AlertDescription>
                      <div className="font-medium">
                        ✅ Найдено рабочих моделей: {modelSearchResults.working_count} из{" "}
                        {modelSearchResults.total_tested}
                      </div>
                      {modelSearchResults.recommendation && (
                        <div className="mt-2 text-sm">
                          <strong>Рекомендация:</strong> {modelSearchResults.recommendation}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>

                  {modelSearchResults.working_models.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">✅ Рабочие модели:</h3>
                      <div className="space-y-2">
                        {modelSearchResults.working_models.map((model: any, index: number) => (
                          <div key={index} className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="bg-green-100">
                                {model.status}
                              </Badge>
                              <code className="text-sm">{model.model}</code>
                            </div>
                            <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-20">
                              {JSON.stringify(model.sample_result, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {modelSearchResults.failed_models.length > 0 && (
                    <details className="mt-4">
                      <summary className="cursor-pointer font-semibold">
                        ❌ Недоступные модели ({modelSearchResults.failed_models.length})
                      </summary>
                      <div className="mt-2 space-y-2">
                        {modelSearchResults.failed_models.map((model: any, index: number) => (
                          <div key={index} className="p-2 bg-red-50 rounded text-sm">
                            <code>{model.model}</code>: {model.error}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🧪 Тестирование компонентов</CardTitle>
              <CardDescription>Проверьте все компоненты системы перед запуском</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Тесты компонентов */}
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={testHuggingFace} disabled={isLoading} variant="outline">
                  🤗 Тест Hugging Face
                </Button>
                <Button onClick={testTelegramConnection} disabled={isLoading} variant="outline">
                  📱 Тест Telegram API
                </Button>
                <Button onClick={testSupabase} disabled={isLoading} variant="outline">
                  🗄️ Тест Supabase
                </Button>
                <Button onClick={clearResults} variant="outline">
                  🗑️ Очистить результаты
                </Button>
              </div>

              {/* Тест анализа эмоций */}
              <div className="space-y-2">
                <Label htmlFor="testText">Тест анализа эмоций:</Label>
                <div className="flex gap-2">
                  <Input
                    id="testText"
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Введите текст для анализа эмоций"
                  />
                  <Button onClick={testEmotionAPI} disabled={isLoading}>
                    🎭 Тест
                  </Button>
                </div>
              </div>

              {/* Результаты тестов */}
              {testResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">📊 Результаты тестов:</h3>
                  {testResults.map((result, index) => (
                    <Alert key={index} className={result.status === "✅" ? "border-green-500" : "border-red-500"}>
                      <AlertDescription>
                        <div className="font-medium">
                          {result.status} {result.type}
                        </div>
                        <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройка Telegram бота</CardTitle>
              <CardDescription>Настройте webhook для вашего Telegram бота</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">📋 Чек-лист настройки:</h3>
                <div className="space-y-2 text-sm">
                  <div>1. ✅ Создан Telegram бот через @BotFather</div>
                  <div>2. ✅ Получен токен бота (TELEGRAM_BOT_TOKEN)</div>
                  <div>3. ✅ Получен API ключ Hugging Face (HUGGINGFACE_API_KEY)</div>
                  <div>4. ✅ Настроен Supabase проект</div>
                  <div>5. ✅ Добавлены переменные окружения в Vercel</div>
                  <div>6. ⏳ Установлен webhook (нажмите кнопку ниже)</div>
                </div>
              </div>

              <Button onClick={setupWebhook} disabled={isLoading} className="w-full">
                {isLoading ? "Настройка..." : "🔗 Настроить Webhook"}
              </Button>

              {webhookMessage && (
                <Alert className={webhookSuccess ? "border-green-500" : "border-red-500"}>
                  <AlertDescription>{webhookMessage}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📖 Инструкции по запуску</CardTitle>
              <CardDescription>Пошаговое руководство для запуска бота</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🔧 Переменные окружения:</h3>
                  <pre className="text-xs bg-white p-2 rounded border">
                    {`TELEGRAM_BOT_TOKEN=1234567890:AAAA... (от @BotFather)
HUGGINGFACE_API_KEY=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
WEBHOOK_URL=https://your-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role ключ)`}
                  </pre>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🚀 Порядок запуска:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Сначала найдите доступные модели на вкладке "Поиск моделей"</li>
                    <li>Убедитесь, что все тесты на вкладке "Тестирование" проходят успешно ✅</li>
                    <li>На вкладке "Настройка" установите webhook</li>
                    <li>Найдите вашего бота в Telegram по username</li>
                    <li>
                      Отправьте команду <code>/start</code>
                    </li>
                    <li>Отправьте текстовое или голосовое сообщение для анализа</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
