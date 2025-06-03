"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TestPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [testText, setTestText] = useState("Я очень счастлив сегодня!")

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

  const clearResults = () => setTestResults([])

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🧪 Тестирование Telegram бота для анализа эмоций</CardTitle>
          <CardDescription>Проверьте все компоненты системы перед запуском</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Чек-лист настройки */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">📋 Чек-лист настройки:</h3>
            <div className="space-y-2 text-sm">
              <div>1. ✅ Создан Telegram бот через @BotFather</div>
              <div>2. ✅ Получен токен бота (TELEGRAM_BOT_TOKEN)</div>
              <div>3. ✅ Получен API ключ Hugging Face (HUGGINGFACE_API_KEY)</div>
              <div>4. ✅ Настроен Supabase проект</div>
              <div>5. ✅ Добавлены переменные окружения в Vercel</div>
              <div>6. ⏳ Установлен webhook (сделаем после тестов)</div>
            </div>
          </div>

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
                    <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Инструкции по запуску */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">🚀 Как запустить бота:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Убедитесь, что все тесты выше проходят успешно ✅</li>
              <li>
                Перейдите на страницу <code>/setup</code> и установите webhook
              </li>
              <li>Найдите вашего бота в Telegram по username</li>
              <li>
                Отправьте команду <code>/start</code>
              </li>
              <li>Отправьте текстовое или голосовое сообщение для анализа</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
