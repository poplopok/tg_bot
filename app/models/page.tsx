"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, TestTube, CheckCircle, XCircle, Loader2, Brain, Shield, Heart } from "lucide-react"
import Link from "next/link"

interface ModelResult {
  model: string
  id: string
  type: string
  status: string
  data?: any
  error?: string
  available: boolean
}

export default function ModelsPage() {
  const [testText, setTestText] = useState("Привет! Как дела? Сегодня отличный день!")
  const [results, setResults] = useState<ModelResult[]>([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<any>(null)

  const testModels = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: testText }),
      })

      const data = await response.json()
      setResults(data.results || [])
      setSummary(data.summary || null)
    } catch (error) {
      console.error("Ошибка тестирования:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "sentiment":
        return <Heart className="h-4 w-4" />
      case "toxicity":
        return <Shield className="h-4 w-4" />
      case "emotion":
        return <Brain className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "sentiment":
        return "bg-blue-100 text-blue-800"
      case "toxicity":
        return "bg-red-100 text-red-800"
      case "emotion":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatResult = (result: ModelResult) => {
    if (!result.data || !Array.isArray(result.data)) return "Нет данных"

    if (Array.isArray(result.data[0])) {
      // Результат классификации
      const topResult = result.data[0][0]
      if (topResult) {
        return `${topResult.label}: ${(topResult.score * 100).toFixed(1)}%`
      }
    }

    return JSON.stringify(result.data).slice(0, 100) + "..."
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Тестирование моделей</h1>
            <p className="text-gray-600">Проверка доступности Hugging Face моделей</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test Interface */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Тестирование
                </CardTitle>
                <CardDescription>Введите текст для анализа всеми моделями</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Текст для анализа:</label>
                  <Textarea
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Введите текст на русском языке..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button onClick={testModels} disabled={loading || !testText.trim()} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Тестирование...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Тестировать модели
                    </>
                  )}
                </Button>

                {summary && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Доступно: {summary.available}/{summary.total} моделей
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Model Info */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
              <CardHeader>
                <CardTitle>Информация о моделях</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">🇷🇺 Русский язык:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• RuBERT - анализ тональности</li>
                    <li>• BlancheFort RuBERT - эмоции</li>
                    <li>• RuSentiment - настроение</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">🌍 Универсальные:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• DistilBERT - токсичность</li>
                    <li>• DistilRoBERTa - эмоции</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">💡 Особенности:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Все модели бесплатны</li>
                    <li>• Работают через HF API</li>
                    <li>• Fallback на ключевые слова</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Результаты тестирования</CardTitle>
                <CardDescription>Статус доступности и результаты анализа</CardDescription>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Нажмите "Тестировать модели" для проверки доступности
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div key={index} className="p-4 rounded-lg border bg-gray-50/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(result.type)}
                              <h4 className="font-medium">{result.model}</h4>
                            </div>
                            <Badge variant="outline" className={getTypeColor(result.type)}>
                              {result.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {result.available ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <Badge variant={result.available ? "default" : "destructive"}>
                              {result.available ? "Доступна" : "Недоступна"}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          <code className="bg-white px-2 py-1 rounded text-xs">{result.id}</code>
                        </div>

                        {result.available ? (
                          <div className="bg-green-50 p-3 rounded border border-green-200">
                            <p className="text-sm text-green-800 font-medium mb-1">Результат:</p>
                            <p className="text-sm text-green-700">{formatResult(result)}</p>
                          </div>
                        ) : (
                          <div className="bg-red-50 p-3 rounded border border-red-200">
                            <p className="text-sm text-red-800 font-medium mb-1">Ошибка:</p>
                            <p className="text-sm text-red-700">{result.error || "Модель недоступна"}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            {results.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
                <CardHeader>
                  <CardTitle>Рекомендации</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summary?.available === 0 && (
                      <Alert className="border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          Все модели недоступны. Бот будет использовать анализ по ключевым словам.
                        </AlertDescription>
                      </Alert>
                    )}

                    {summary?.available > 0 && summary?.available < summary?.total && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <TestTube className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          Часть моделей недоступна. Бот будет использовать доступные модели с fallback.
                        </AlertDescription>
                      </Alert>
                    )}

                    {summary?.available === summary?.total && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Все модели доступны! Бот готов к полноценной работе.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">💡 Советы по использованию:</p>
                      <ul className="space-y-1">
                        <li>• Если модели недоступны, попробуйте позже</li>
                        <li>• HF Inference API может иметь ограничения по запросам</li>
                        <li>• Fallback анализ работает всегда</li>
                        <li>• Для продакшена рассмотрите платные API</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
