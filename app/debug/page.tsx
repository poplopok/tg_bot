"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function DebugPage() {
  const [webhookInfo, setWebhookInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkWebhook = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/set-webhook")
      const data = await response.json()
      setWebhookInfo(data)
    } catch (error) {
      console.error("Ошибка проверки webhook:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetWebhook = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/set-webhook", { method: "POST" })
      const data = await response.json()
      setWebhookInfo(data)
    } catch (error) {
      console.error("Ошибка сброса webhook:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Диагностика бота</h1>
            <p className="text-gray-600">Проверка статуса и устранение проблем</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Webhook Status */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Статус Webhook</CardTitle>
              <CardDescription>Проверка подключения к Telegram</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={checkWebhook} disabled={loading} variant="outline">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Проверить
                </Button>
                <Button onClick={resetWebhook} disabled={loading}>
                  Переустановить
                </Button>
              </div>

              {webhookInfo && (
                <div className="space-y-3">
                  {webhookInfo.success ? (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">Webhook установлен успешно</AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-red-200 bg-red-50">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">Ошибка webhook: {webhookInfo.error}</AlertDescription>
                    </Alert>
                  )}

                  {webhookInfo.webhook_info && (
                    <div className="bg-gray-50 p-3 rounded">
                      <h4 className="font-medium mb-2">Информация о webhook:</h4>
                      <pre className="text-xs overflow-x-auto">{JSON.stringify(webhookInfo.webhook_info, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tests */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Быстрые тесты</CardTitle>
              <CardDescription>Проверка основных функций</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded border">
                  <span>Webhook endpoint</span>
                  <Badge variant="outline">GET /api/webhook</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded border">
                  <span>Bot token</span>
                  <Badge variant="secondary">Настроен</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded border">
                  <span>Supabase</span>
                  <Badge variant="outline">Требует проверки</Badge>
                </div>
              </div>

              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Если бот не отвечает, попробуйте переустановить webhook
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Common Issues */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle>Частые проблемы и решения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-red-600">🚨 Бот не отвечает</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Проверьте, что webhook установлен правильно</li>
                    <li>• Убедитесь, что приложение развернуто на Vercel</li>
                    <li>• Проверьте логи в Vercel Dashboard</li>
                    <li>• Попробуйте команду /start в боте</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3 text-orange-600">⚠️ Ошибки анализа</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Проверьте Supabase SERVICE_ROLE ключ</li>
                    <li>• Убедитесь, что таблицы созданы</li>
                    <li>• Проверьте доступность HF моделей</li>
                    <li>• Fallback анализ должен работать всегда</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
