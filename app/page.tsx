"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Brain, MessageSquare, TrendingUp, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EmotionResult {
  emotion: string
  confidence: number
  color: string
  description: string
}

interface AnalysisResult {
  text: string
  language: "ru" | "en"
  emotions: EmotionResult[]
  sentiment: "positive" | "negative" | "neutral"
  toxicity: number
  corporateTerms: string[]
  recommendations: string[]
}

export default function EmotionAnalysisBot() {
  const [inputText, setInputText] = useState("")
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeText = async () => {
    if (!inputText.trim()) return

    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/analyze-emotion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      })

      if (!response.ok) {
        throw new Error("Ошибка анализа")
      }

      const result = await response.json()
      setAnalysis(result)
    } catch (error) {
      console.error("Ошибка:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600"
      case "negative":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "Позитивная"
      case "negative":
        return "Негативная"
      default:
        return "Нейтральная"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Анализатор Эмоций для Корпоративных Чатов</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Определяйте эмоциональную окраску сообщений, предотвращайте конфликты и повышайте продуктивность команды с
            помощью ИИ-анализа
          </p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Введите текст для анализа
            </CardTitle>
            <CardDescription>Поддерживается русский и английский языки, корпоративный сленг и эмодзи</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Например: 'Опять этот дедлайн! 😤 Когда уже закончится этот проект?'"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <Button onClick={analyzeText} disabled={!inputText.trim() || isAnalyzing} className="w-full">
              {isAnalyzing ? "Анализирую..." : "Анализировать эмоции"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {analysis && (
          <Tabs defaultValue="emotions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="emotions">Эмоции</TabsTrigger>
              <TabsTrigger value="sentiment">Тональность</TabsTrigger>
              <TabsTrigger value="corporate">Корпоративный анализ</TabsTrigger>
              <TabsTrigger value="recommendations">Рекомендации</TabsTrigger>
            </TabsList>

            <TabsContent value="emotions">
              <Card>
                <CardHeader>
                  <CardTitle>Обнаруженные эмоции</CardTitle>
                  <CardDescription>Язык: {analysis.language === "ru" ? "Русский" : "Английский"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.emotions.map((emotion, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`${emotion.color} border-current`}>
                              {emotion.emotion}
                            </Badge>
                            <span className="text-sm text-gray-600">{emotion.description}</span>
                          </div>
                          <span className="text-sm font-medium">{Math.round(emotion.confidence)}%</span>
                        </div>
                        <Progress value={emotion.confidence} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sentiment">
              <Card>
                <CardHeader>
                  <CardTitle>Общая тональность</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className={`text-2xl font-bold ${getSentimentColor(analysis.sentiment)}`}>
                      {getSentimentText(analysis.sentiment)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Уровень токсичности</span>
                      <span className="font-medium">{Math.round(analysis.toxicity)}%</span>
                    </div>
                    <Progress
                      value={analysis.toxicity}
                      className={`h-3 ${analysis.toxicity > 70 ? "bg-red-100" : analysis.toxicity > 40 ? "bg-yellow-100" : "bg-green-100"}`}
                    />
                  </div>

                  {analysis.toxicity > 50 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>Обнаружен высокий уровень негатива. Рекомендуется модерация.</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="corporate">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Корпоративный контекст
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Обнаруженные термины:</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.corporateTerms.map((term, index) => (
                        <Badge key={index} variant="secondary">
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Рекомендации
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Demo Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Примеры для тестирования</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Негативные примеры:</h4>
                <div className="space-y-1 text-sm">
                  <p
                    className="p-2 bg-red-50 rounded cursor-pointer hover:bg-red-100"
                    onClick={() => setInputText("Опять этот дедлайн! 😤 Когда уже закончится этот проект?")}
                  >
                    "Опять этот дедлайн! 😤 Когда уже закончится этот проект?"
                  </p>
                  <p
                    className="p-2 bg-red-50 rounded cursor-pointer hover:bg-red-100"
                    onClick={() => setInputText("Ну конечно, все по плану... 🙄")}
                  >
                    "Ну конечно, все по плану... 🙄"
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Позитивные примеры:</h4>
                <div className="space-y-1 text-sm">
                  <p
                    className="p-2 bg-green-50 rounded cursor-pointer hover:bg-green-100"
                    onClick={() => setInputText("Отличная работа команды! 🎉 Проект готов к деплою!")}
                  >
                    "Отличная работа команды! 🎉 Проект готов к деплою!"
                  </p>
                  <p
                    className="p-2 bg-green-50 rounded cursor-pointer hover:bg-green-100"
                    onClick={() => setInputText("Спасибо за фидбек, учтем в следующей итерации 👍")}
                  >
                    "Спасибо за фидбек, учтем в следующей итерации 👍"
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
