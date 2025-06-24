import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, Brain, MessageSquare, Settings, TrendingUp, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="flex items-center justify-center gap-3">
            <Bot className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Telegram Бот Анализа Эмоций</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Автоматический анализ эмоций в корпоративных чатах для предотвращения конфликтов и повышения продуктивности
            команды
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/setup">
              <Button size="lg" className="text-lg px-8">
                <Settings className="w-5 h-5 mr-2" />
                Настроить Бота
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                Анализ Эмоций
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Определение радости, грусти, гнева, страха и других эмоций в сообщениях с указанием уровня уверенности
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                Анализ Тональности
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Классификация сообщений на позитивные, негативные и нейтральные с оценкой уровня токсичности
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Корпоративный Контекст
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Распознавание бизнес-терминов, профессионального сленга и корпоративной специфики
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                Рекомендации
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Автоматические советы по улучшению коммуникации и предотвращению конфликтов
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-red-600" />
                Автоматическая Модерация
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Выявление токсичных сообщений и потенциальных конфликтов в режиме реального времени
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Простая Настройка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Быстрое подключение к любому Telegram чату или группе с минимальными настройками
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Как это работает</CardTitle>
            <CardDescription className="text-center">
              Простой процесс интеграции бота в ваши корпоративные чаты
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-medium">Создайте бота</h3>
                <p className="text-sm text-gray-600">Используйте @BotFather для создания нового бота</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-medium">Настройте webhook</h3>
                <p className="text-sm text-gray-600">Подключите бота к вашему Vercel приложению</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-medium">Добавьте в чат</h3>
                <p className="text-sm text-gray-600">Пригласите бота в корпоративный чат или группу</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <h3 className="font-medium">Получайте анализ</h3>
                <p className="text-sm text-gray-600">Бот автоматически анализирует эмоции в сообщениях</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link href="/setup">
            <Button size="lg" className="text-lg px-12">
              Начать Настройку
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
