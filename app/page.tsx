import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, MessageSquare, Shield, TrendingUp, Mic, Brain } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Анализ эмоций в <span className="text-blue-600">корпоративных чатах</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Предотвращайте конфликты, повышайте продуктивность команды и создавайте здоровую рабочую атмосферу с помощью
            ИИ-анализа эмоций в Telegram чатах
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/setup">
              <Button size="lg" className="text-lg px-8 py-3">
                Начать настройку
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Посмотреть дашборд
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Анализ в реальном времени</CardTitle>
              <CardDescription>
                Мгновенный анализ каждого сообщения в чате с определением эмоционального состояния участников
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Mic className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Голосовые сообщения</CardTitle>
              <CardDescription>
                Транскрипция и анализ эмоций в голосовых сообщениях с помощью ИИ-моделей распознавания речи
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle>Детекция токсичности</CardTitle>
              <CardDescription>
                Автоматическое выявление токсичных сообщений и предупреждение о потенциальных конфликтах
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Аналитика команды</CardTitle>
              <CardDescription>
                Подробные отчеты по эмоциональному состоянию команды, трендам и паттернам коммуникации
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Прогнозирование</CardTitle>
              <CardDescription>
                Предсказание потенциальных конфликтов и рекомендации по улучшению атмосферы в команде
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>ИИ-модели</CardTitle>
              <CardDescription>
                Использование современных NLP-моделей: RoBERTa, BERT, Whisper для максимальной точности анализа
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Результаты внедрения</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">25%</div>
              <div className="text-gray-600">Повышение продуктивности команды</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">60%</div>
              <div className="text-gray-600">Снижение конфликтных ситуаций</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">40%</div>
              <div className="text-gray-600">Уменьшение текучести кадров</div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Технологический стек</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Next.js 14
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              TypeScript
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Supabase
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Hugging Face
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Telegram Bot API
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Whisper AI
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              RoBERTa
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Vercel
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
