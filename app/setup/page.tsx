"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Bot, CheckCircle, AlertCircle, Copy, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function SetupPage() {
  const [webhookStatus, setWebhookStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [webhookMessage, setWebhookMessage] = useState("")

  const setupWebhook = async () => {
    setWebhookStatus("loading")
    try {
      const response = await fetch("/api/set-webhook", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setWebhookStatus("success")
        setWebhookMessage(`Webhook установлен: ${data.webhook_url}`)
      } else {
        setWebhookStatus("error")
        setWebhookMessage(data.error || "Ошибка установки webhook")
      }
    } catch (error) {
      setWebhookStatus("error")
      setWebhookMessage("Ошибка сети при установке webhook")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const envVariables = [
    {
      name: "TELEGRAM_BOT_TOKEN",
      description: "Токен Telegram бота от @BotFather",
      example: "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz",
      required: true,
    },
    {
      name: "OPENAI_API_KEY",
      description: "API ключ OpenAI для анализа эмоций",
      example: "sk-...",
      required: true,
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      description: "URL вашего Supabase проекта",
      example: "https://your-project.supabase.co",
      required: true,
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      description: "Публичный ключ Supabase",
      example: "eyJ...",
      required: true,
    },
    {
      name: "SUPABASE_SERVICE_ROLE_KEY",
      description: "Сервисный ключ Supabase (секретный)",
      example: "eyJ...",
      required: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Настройка бота</h1>
            <p className="text-gray-600">Пошаговая инструкция по развертыванию</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Environment Variables */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Переменные окружения
              </CardTitle>
              <CardDescription>Настройте эти переменные в Vercel Dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {envVariables.map((env, index) => (
                <div key={index} className="p-4 rounded-lg border bg-gray-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Label className="font-mono text-sm">{env.name}</Label>
                      {env.required && (
                        <Badge variant="destructive" className="text-xs">
                          Обязательно
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(env.name)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{env.description}</p>
                  <code className="text-xs bg-white p-2 rounded border block break-all">{env.example}</code>
                </div>
              ))}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Добавьте эти переменные в настройках проекта Vercel перед деплоем</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Setup Steps */}
          <div className="space-y-6">
            {/* Step 1: Create Bot */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">1. Создание Telegram бота</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Откройте @BotFather в Telegram</li>
                  <li>
                    Отправьте команду <code className="bg-gray-100 px-1 rounded">/newbot</code>
                  </li>
                  <li>Введите имя бота (например: "Emotion Analyzer")</li>
                  <li>Введите username бота (должен заканчиваться на "bot")</li>
                  <li>Скопируйте полученный токен</li>
                </ol>
                <Button asChild variant="outline" className="w-full">
                  <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Открыть @BotFather
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Step 2: Supabase Setup */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">2. Настройка Supabase</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    Создайте проект на{" "}
                    <a href="https://supabase.com" className="text-blue-600 hover:underline">
                      supabase.com
                    </a>
                  </li>
                  <li>Выполните SQL скрипты из папки scripts/</li>
                  <li>Скопируйте URL проекта и API ключи</li>
                  <li>Настройте Row Level Security</li>
                </ol>
                <Button asChild variant="outline" className="w-full">
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Supabase Dashboard
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Step 3: Deploy */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">3. Деплой на Vercel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Подключите GitHub репозиторий к Vercel</li>
                  <li>Добавьте переменные окружения</li>
                  <li>Выполните деплой</li>
                  <li>Установите webhook (кнопка ниже)</li>
                </ol>
                <Button asChild variant="outline" className="w-full">
                  <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Deploy to Vercel
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Webhook Setup */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">4. Установка Webhook</CardTitle>
                <CardDescription>После деплоя установите webhook для получения сообщений</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={setupWebhook} disabled={webhookStatus === "loading"} className="w-full">
                  {webhookStatus === "loading" ? "Установка..." : "Установить Webhook"}
                </Button>

                {webhookStatus === "success" && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{webhookMessage}</AlertDescription>
                  </Alert>
                )}

                {webhookStatus === "error" && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{webhookMessage}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SQL Scripts */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle>SQL скрипты для Supabase</CardTitle>
            <CardDescription>Выполните эти скрипты в SQL Editor вашего Supabase проекта</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">1. Создание таблиц</h4>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  {`-- Таблица пользователей
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица сообщений
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  username VARCHAR(255),
  message_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица анализа эмоций
CREATE TABLE emotion_analysis (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES messages(id),
  primary_emotion VARCHAR(50),
  confidence DECIMAL(3,2),
  toxicity DECIMAL(3,2),
  sentiment VARCHAR(20),
  explanation TEXT,
  analyzed_at TIMESTAMP DEFAULT NOW()
);`}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">2. Настройка RLS</h4>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  {`-- Включение Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_analysis ENABLE ROW LEVEL SECURITY;

-- Политики доступа (разрешить все для сервисного ключа)
CREATE POLICY "Allow all for service role" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow all for service role" ON messages
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow all for service role" ON emotion_analysis
  FOR ALL USING (auth.role() = 'service_role');`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
