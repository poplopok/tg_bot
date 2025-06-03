"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, TestTube, Bot, Shield, BarChart3, Bell, Users } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General settings
    autoModeration: true,
    realTimeAnalysis: true,
    toxicityThreshold: [70],
    emotionSensitivity: [80],

    // Notifications
    emailAlerts: true,
    slackNotifications: false,
    criticalAlertsOnly: false,

    // Integration
    telegramToken: "",
    slackWebhook: "",
    teamsConnector: "",

    // Moderation rules
    blockedWords: "идиот, дурак, тупой",
    autoDeleteToxic: false,
    warningMessage: "Пожалуйста, соблюдайте корпоративную этику в общении.",

    // Analytics
    dataRetention: "90",
    anonymizeData: true,
    exportFormat: "json",
  })

  const handleSave = () => {
    // Здесь будет логика сохранения настроек
    alert("Настройки сохранены!")
  }

  const testConnection = (platform: string) => {
    alert(`Тестирование подключения к ${platform}...`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Настройки системы</h1>
              <p className="text-gray-600">Конфигурация анализа эмоций и модерации</p>
            </div>
          </div>

          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Общие
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Модерация
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Интеграция
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Уведомления
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Основные настройки</CardTitle>
                  <CardDescription>Конфигурация анализа эмоций</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="realtime">Анализ в реальном времени</Label>
                      <p className="text-sm text-gray-600">Мгновенный анализ новых сообщений</p>
                    </div>
                    <Switch
                      id="realtime"
                      checked={settings.realTimeAnalysis}
                      onCheckedChange={(checked) => setSettings({ ...settings, realTimeAnalysis: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="automod">Автоматическая модерация</Label>
                      <p className="text-sm text-gray-600">Автоматическое реагирование на нарушения</p>
                    </div>
                    <Switch
                      id="automod"
                      checked={settings.autoModeration}
                      onCheckedChange={(checked) => setSettings({ ...settings, autoModeration: checked })}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Порог токсичности: {settings.toxicityThreshold[0]}%</Label>
                    <Slider
                      value={settings.toxicityThreshold}
                      onValueChange={(value) => setSettings({ ...settings, toxicityThreshold: value })}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600">Сообщения с токсичностью выше этого значения будут помечены</p>
                  </div>

                  <div className="space-y-3">
                    <Label>Чувствительность анализа эмоций: {settings.emotionSensitivity[0]}%</Label>
                    <Slider
                      value={settings.emotionSensitivity}
                      onValueChange={(value) => setSettings({ ...settings, emotionSensitivity: value })}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600">
                      Более высокие значения увеличивают точность, но могут давать ложные срабатывания
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Статус системы</CardTitle>
                  <CardDescription>Текущее состояние компонентов</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                    <span>NLP Модель</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Активна
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                    <span>Анализ эмоций</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Работает
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                    <span>Telegram Bot</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Настройка
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <span>Slack Integration</span>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      Отключена
                    </Badge>
                  </div>

                  <Button variant="outline" className="w-full">
                    <TestTube className="h-4 w-4 mr-2" />
                    Тестировать систему
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Moderation Settings */}
          <TabsContent value="moderation" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Правила модерации</CardTitle>
                  <CardDescription>Настройка автоматической модерации контента</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="blocked-words">Заблокированные слова</Label>
                    <Textarea
                      id="blocked-words"
                      placeholder="Введите слова через запятую"
                      value={settings.blockedWords}
                      onChange={(e) => setSettings({ ...settings, blockedWords: e.target.value })}
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-600 mt-1">Сообщения с этими словами будут автоматически помечены</p>
                  </div>

                  <div>
                    <Label htmlFor="warning-message">Сообщение-предупреждение</Label>
                    <Textarea
                      id="warning-message"
                      value={settings.warningMessage}
                      onChange={(e) => setSettings({ ...settings, warningMessage: e.target.value })}
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-600 mt-1">Это сообщение будет отправлено при нарушении правил</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-delete">Автоудаление токсичных сообщений</Label>
                      <p className="text-sm text-gray-600">Автоматически удалять сообщения с высокой токсичностью</p>
                    </div>
                    <Switch
                      id="auto-delete"
                      checked={settings.autoDeleteToxic}
                      onCheckedChange={(checked) => setSettings({ ...settings, autoDeleteToxic: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Действия при нарушениях</CardTitle>
                  <CardDescription>Настройка реакции системы на проблемы</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border bg-red-50">
                    <h4 className="font-medium text-red-900 mb-2">Высокая токсичность (80%+)</h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Немедленное уведомление HR</li>
                      <li>• Блокировка сообщения</li>
                      <li>• Предупреждение пользователю</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border bg-orange-50">
                    <h4 className="font-medium text-orange-900 mb-2">Средняя токсичность (50-79%)</h4>
                    <ul className="text-sm text-orange-800 space-y-1">
                      <li>• Пометка сообщения</li>
                      <li>• Уведомление модератора</li>
                      <li>• Мягкое предупреждение</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border bg-yellow-50">
                    <h4 className="font-medium text-yellow-900 mb-2">Низкая токсичность (30-49%)</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Логирование инцидента</li>
                      <li>• Анализ контекста</li>
                      <li>• Мониторинг пользователя</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integration Settings */}
          <TabsContent value="integration" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Telegram Bot</CardTitle>
                  <CardDescription>Настройка интеграции с Telegram</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="telegram-token">Bot Token</Label>
                    <Input
                      id="telegram-token"
                      type="password"
                      placeholder="Введите токен бота"
                      value={settings.telegramToken}
                      onChange={(e) => setSettings({ ...settings, telegramToken: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => testConnection("Telegram")}>
                      Тестировать
                    </Button>
                    <Button className="flex-1">Подключить</Button>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">💡 Получите токен у @BotFather в Telegram</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Slack Integration</CardTitle>
                  <CardDescription>Настройка интеграции со Slack</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="slack-webhook">Webhook URL</Label>
                    <Input
                      id="slack-webhook"
                      type="url"
                      placeholder="https://hooks.slack.com/..."
                      value={settings.slackWebhook}
                      onChange={(e) => setSettings({ ...settings, slackWebhook: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => testConnection("Slack")}>
                      Тестировать
                    </Button>
                    <Button className="flex-1">Подключить</Button>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">💡 Создайте Incoming Webhook в настройках Slack</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Microsoft Teams</CardTitle>
                  <CardDescription>Настройка интеграции с Teams</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="teams-connector">Connector URL</Label>
                    <Input
                      id="teams-connector"
                      type="url"
                      placeholder="https://outlook.office.com/webhook/..."
                      value={settings.teamsConnector}
                      onChange={(e) => setSettings({ ...settings, teamsConnector: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => testConnection("Teams")}>
                      Тестировать
                    </Button>
                    <Button className="flex-1">Подключить</Button>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-800">💡 Настройте Incoming Webhook в Teams</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>Настройка REST API для кастомных интеграций</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Сгенерированный API ключ"
                      value="••••••••••••••••"
                      readOnly
                      className="mt-2"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      Сгенерировать новый
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Копировать
                    </Button>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 font-medium mb-2">Endpoint:</p>
                    <code className="text-xs bg-white p-2 rounded border block">
                      POST https://api.emotionbot.com/v1/analyze
                    </code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Уведомления</CardTitle>
                  <CardDescription>Настройка оповещений о событиях</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-alerts">Email уведомления</Label>
                      <p className="text-sm text-gray-600">Отправлять уведомления на email</p>
                    </div>
                    <Switch
                      id="email-alerts"
                      checked={settings.emailAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, emailAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="slack-notifications">Slack уведомления</Label>
                      <p className="text-sm text-gray-600">Отправлять в канал Slack</p>
                    </div>
                    <Switch
                      id="slack-notifications"
                      checked={settings.slackNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, slackNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="critical-only">Только критичные</Label>
                      <p className="text-sm text-gray-600">Уведомлять только о серьезных нарушениях</p>
                    </div>
                    <Switch
                      id="critical-only"
                      checked={settings.criticalAlertsOnly}
                      onCheckedChange={(checked) => setSettings({ ...settings, criticalAlertsOnly: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Типы уведомлений</CardTitle>
                  <CardDescription>Выберите события для оповещения</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Токсичные сообщения", enabled: true, severity: "high" },
                    { label: "Конфликты в команде", enabled: true, severity: "high" },
                    { label: "Снижение настроения", enabled: false, severity: "medium" },
                    { label: "Повышение стресса", enabled: true, severity: "medium" },
                    { label: "Позитивные тренды", enabled: false, severity: "low" },
                    { label: "Новые пользователи", enabled: false, severity: "low" },
                  ].map((notification, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Switch defaultChecked={notification.enabled} />
                        <span className="text-sm">{notification.label}</span>
                      </div>
                      <Badge
                        variant={
                          notification.severity === "high"
                            ? "destructive"
                            : notification.severity === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {notification.severity === "high"
                          ? "Критично"
                          : notification.severity === "medium"
                            ? "Важно"
                            : "Инфо"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Settings */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Хранение данных</CardTitle>
                  <CardDescription>Настройка сбора и хранения аналитики</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="retention">Период хранения данных</Label>
                    <Select
                      value={settings.dataRetention}
                      onValueChange={(value) => setSettings({ ...settings, dataRetention: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 дней</SelectItem>
                        <SelectItem value="90">90 дней</SelectItem>
                        <SelectItem value="180">6 месяцев</SelectItem>
                        <SelectItem value="365">1 год</SelectItem>
                        <SelectItem value="unlimited">Без ограничений</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="anonymize">Анонимизация данных</Label>
                      <p className="text-sm text-gray-600">Скрывать личные данные в отчетах</p>
                    </div>
                    <Switch
                      id="anonymize"
                      checked={settings.anonymizeData}
                      onCheckedChange={(checked) => setSettings({ ...settings, anonymizeData: checked })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="export-format">Формат экспорта</Label>
                    <Select
                      value={settings.exportFormat}
                      onValueChange={(value) => setSettings({ ...settings, exportFormat: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xlsx">Excel</SelectItem>
                        <SelectItem value="pdf">PDF отчет</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Метрики и KPI</CardTitle>
                  <CardDescription>Ключевые показатели для отслеживания</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { metric: "Индекс эмоционального здоровья", enabled: true },
                    { metric: "Коэффициент токсичности", enabled: true },
                    { metric: "Тренды настроения по отделам", enabled: true },
                    { metric: "Прогноз текучести кадров", enabled: false },
                    { metric: "Эффективность коммуникации", enabled: true },
                    { metric: "Время реакции на конфликты", enabled: false },
                  ].map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm">{metric.metric}</span>
                      <Switch defaultChecked={metric.enabled} />
                    </div>
                  ))}

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Автоматические отчеты</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked />
                        Еженедельный отчет для HR
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" />
                        Ежемесячный анализ трендов
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked />
                        Квартальный обзор эффективности
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
