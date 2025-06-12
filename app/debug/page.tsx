"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw, Send } from "lucide-react"

interface DebugInfo {
  success: boolean
  timestamp: string
  env: Record<string, boolean>
  supabase: {
    connected: boolean
    error?: string
  }
  telegram: {
    connected: boolean
    botInfo?: any
  }
}

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const fetchDebugInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug")
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error("Failed to fetch debug info:", error)
    } finally {
      setLoading(false)
    }
  }

  const testWebhook = async () => {
    try {
      const response = await fetch("/api/test-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      })
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      console.error("Test webhook failed:", error)
      setTestResult({ success: false, error: error.message })
    }
  }

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Диагностика системы</h1>
        <p className="text-gray-600">Проверка всех компонентов бота</p>
      </div>

      <div className="grid gap-6">
        {/* Статус системы */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Общий статус
              <Button onClick={fetchDebugInfo} disabled={loading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Обновить
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {debugInfo ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {debugInfo.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">{debugInfo.success ? "Система работает" : "Обнаружены проблемы"}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Последняя проверка: {new Date(debugInfo.timestamp).toLocaleString("ru-RU")}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Загрузка...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Переменные окружения */}
        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Переменные окружения</CardTitle>
              <CardDescription>Проверка наличия необходимых переменных</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(debugInfo.env).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded">
                    <span className="font-mono text-sm">{key}</span>
                    <Badge variant={value ? "default" : "destructive"}>{value ? "✓" : "✗"}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Supabase */}
        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle>База данных (Supabase)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {debugInfo.supabase.connected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>{debugInfo.supabase.connected ? "Подключено" : "Ошибка подключения"}</span>
              </div>
              {debugInfo.supabase.error && <p className="mt-2 text-sm text-red-600">{debugInfo.supabase.error}</p>}
            </CardContent>
          </Card>
        )}

        {/* Telegram */}
        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Telegram Bot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {debugInfo.telegram.connected ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>{debugInfo.telegram.connected ? "Бот активен" : "Бот недоступен"}</span>
                </div>

                {debugInfo.telegram.botInfo && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p>
                      <strong>Имя:</strong> {debugInfo.telegram.botInfo.first_name}
                    </p>
                    <p>
                      <strong>Username:</strong> @{debugInfo.telegram.botInfo.username}
                    </p>
                    <p>
                      <strong>ID:</strong> {debugInfo.telegram.botInfo.id}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Тест webhook */}
        <Card>
          <CardHeader>
            <CardTitle>Тест Webhook</CardTitle>
            <CardDescription>Отправить тестовое сообщение для проверки обработки</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={testWebhook}>
                <Send className="h-4 w-4 mr-2" />
                Отправить тест
              </Button>

              {testResult && (
                <div className="bg-gray-50 p-4 rounded">
                  <pre className="text-sm overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
