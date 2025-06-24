import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, MessageSquare, BarChart3, Settings, Brain, Shield, TestTube, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">EmotionBot</h1>
          </div>
          <p className="text-xl text-gray-600 mb-6">Telegram бот с Hugging Face моделями для анализа эмоций</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className="px-3 py-1">
              <Brain className="h-4 w-4 mr-1" />
              RuBERT
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Shield className="h-4 w-4 mr-1" />
              DistilBERT
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Zap className="h-4 w-4 mr-1" />
              Бесплатно
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <MessageSquare className="h-4 w-4 mr-1" />
              Telegram Bot API
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/dashboard">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Дашборд</h3>
                <p className="text-gray-600">Аналитика и статистика</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/models">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <TestTube className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Модели</h3>
                <p className="text-gray-600">Тестирование HF моделей</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/setup">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Settings className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Настройка</h3>
                <p className="text-gray-600">Установка и конфигурация</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Bot className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Telegram Bot</h3>
              <p className="text-gray-600 mb-4">@YourEmotionBot</p>
              <Button asChild className="w-full">
                <a href="https://t.me/YourEmotionBot" target="_blank" rel="noopener noreferrer">
                  Открыть в Telegram
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Hugging Face модели</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="h-8 w-8 text-blue-600" />
                  <Badge className="bg-blue-100 text-blue-800">RuBERT</Badge>
                </div>
                <h3 className="font-semibold mb-2">Анализ тональности</h3>
                <p className="text-sm text-gray-600 mb-3">
                  seara/rubert-base-cased-russian-sentiment - специально обученная модель для русского языка
                </p>
                <div className="text-xs text-gray-500">✅ Бесплатно • 🇷🇺 Русский язык • 🎯 Высокая точность</div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-8 w-8 text-red-600" />
                  <Badge className="bg-red-100 text-red-800">DistilBERT</Badge>
                </div>
                <h3 className="font-semibold mb-2">Детекция токсичности</h3>
                <p className="text-sm text-gray-600 mb-3">
                  martin-ha/toxic-classification-distilBERT - быстрая модель для определения токсичного контента
                </p>
                <div className="text-xs text-gray-500">✅ Бесплатно • 🌍 Мультиязычная • ⚡ Быстрая</div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="h-8 w-8 text-purple-600" />
                  <Badge className="bg-purple-100 text-purple-800">RoBERTa</Badge>
                </div>
                <h3 className="font-semibold mb-2">Детекция эмоций</h3>
                <p className="text-sm text-gray-600 mb-3">
                  j-hartmann/emotion-english-distilroberta-base - определение 6 базовых эмоций
                </p>
                <div className="text-xs text-gray-500">✅ Бесплатно • 🇬🇧 Английский • 😊 6 эмоций</div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="h-8 w-8 text-green-600" />
                  <Badge className="bg-green-100 text-green-800">BlancheFort</Badge>
                </div>
                <h3 className="font-semibold mb-2">RuBERT Sentiment</h3>
                <p className="text-sm text-gray-600 mb-3">
                  blanchefort/rubert-base-cased-sentiment - альтернативная модель для русского языка
                </p>
                <div className="text-xs text-gray-500">✅ Бесплатно • 🇷🇺 Русский язык • 🔄 Fallback</div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="h-8 w-8 text-orange-600" />
                  <Badge className="bg-orange-100 text-orange-800">RuSentiment</Badge>
                </div>
                <h3 className="font-semibold mb-2">BERT RuSentiment</h3>
                <p className="text-sm text-gray-600 mb-3">
                  sismetanin/rubert-ru-sentiment-rusentiment - модель на датасете RuSentiment
                </p>
                <div className="text-xs text-gray-500">✅ Бесплатно • 🇷🇺 Русский язык • 📊 RuSentiment</div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="h-8 w-8 text-yellow-600" />
                  <Badge className="bg-yellow-100 text-yellow-800">Fallback</Badge>
                </div>
                <h3 className="font-semibold mb-2">Ключевые слова</h3>
                <p className="text-sm text-gray-600 mb-3">Анализ по словарю ключевых слов когда HF модели недоступны</p>
                <div className="text-xs text-gray-500">✅ Всегда работает • 🇷🇺 Русский язык • 📝 Словарь</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Advantages */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-12">
          <CardHeader>
            <CardTitle>Преимущества Hugging Face моделей</CardTitle>
            <CardDescription>Почему мы выбрали HF вместо OpenAI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-600">✅ Преимущества</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• **Бесплатно** - никаких ограничений по токенам</li>
                  <li>• **Специализация** - модели заточены под конкретные задачи</li>
                  <li>• **Русский язык** - RuBERT обучен на русских текстах</li>
                  <li>• **Открытый код** - можно изучить архитектуру</li>
                  <li>• **Быстрота** - локальные модели работают быстрее</li>
                  <li>• **Приватность** - данные не покидают HF</li>
                  <li>• **Fallback** - всегда есть резервный анализ</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-orange-600">⚠️ Ограничения</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• **Доступность** - модели могут быть временно недоступны</li>
                  <li>• **Rate limits** - ограничения на количество запросов</li>
                  <li>• **Качество** - может быть ниже чем у GPT-4</li>
                  <li>• **Контекст** - меньше понимания контекста</li>
                  <li>• **Обновления** - модели обновляются реже</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commands */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Команды бота</CardTitle>
            <CardDescription>Доступные команды для взаимодействия с ботом</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">/start</code>
                  <span className="text-sm text-gray-600">Начать работу с ботом</span>
                </div>
                <div className="flex items-center gap-3">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">/help</code>
                  <span className="text-sm text-gray-600">Получить справку</span>
                </div>
                <div className="flex items-center gap-3">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">/models</code>
                  <span className="text-sm text-gray-600">Информация о моделях</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">/stats</code>
                  <span className="text-sm text-gray-600">Статистика чата за 24 часа</span>
                </div>
                <div className="flex items-center gap-3">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">/mood</code>
                  <span className="text-sm text-gray-600">Общее настроение чата</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Текст</span>
                  <span className="text-sm text-gray-600">Анализ любого сообщения</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
