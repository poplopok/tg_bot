"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const setupWebhook = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/telegram/setup", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Webhook успешно настроен! Бот готов к работе.")
        setIsSuccess(true)
      } else {
        setMessage(`Ошибка: ${data.error}`)
        setIsSuccess(false)
      }
    } catch (error) {
      setMessage("Произошла ошибка при настройке webhook")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Настройка Telegram бота для анализа эмоций</CardTitle>
          <CardDescription>Настройте webhook для вашего Telegram бота</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Инструкции по настройке:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Создайте бота через @BotFather в Telegram</li>
              <li>Получите токен бота и добавьте его в переменные окружения</li>
              <li>Добавьте API ключ Hugging Face</li>
              <li>Настройте Supabase для хранения данных</li>
              <li>Нажмите кнопку ниже для установки webhook</li>
            </ol>
          </div>

          <Button onClick={setupWebhook} disabled={isLoading} className="w-full">
            {isLoading ? "Настройка..." : "Настроить Webhook"}
          </Button>

          {message && (
            <Alert className={isSuccess ? "border-green-500" : "border-red-500"}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
