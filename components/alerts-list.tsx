"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, CheckCircle, X } from "lucide-react"

interface Alert {
  id: string
  type: "toxicity" | "conflict" | "stress" | "inactivity"
  severity: "low" | "medium" | "high"
  message: string
  username?: string
  chatId: string
  timestamp: string
  resolved: boolean
}

export function AlertsList() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 10000) // Обновляем каждые 10 секунд
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts")
      const result = await response.json()
      setAlerts(result.alerts || generateMockAlerts())
    } catch (error) {
      console.error("Failed to fetch alerts:", error)
      setAlerts(generateMockAlerts())
    } finally {
      setLoading(false)
    }
  }

  const generateMockAlerts = (): Alert[] => {
    return [
      {
        id: "alert-1",
        type: "toxicity",
        severity: "high",
        message: "Обнаружено токсичное сообщение от пользователя Дмитрий",
        username: "Дмитрий",
        chatId: "chat-123",
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 минут назад
        resolved: false,
      },
      {
        id: "alert-2",
        type: "stress",
        severity: "medium",
        message: "Повышенный уровень стресса в команде разработки",
        chatId: "chat-456",
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 минут назад
        resolved: false,
      },
      {
        id: "alert-3",
        type: "conflict",
        severity: "high",
        message: "Потенциальный конфликт между Алексей и Мария",
        username: "Алексей",
        chatId: "chat-789",
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 час назад
        resolved: true,
      },
    ]
  }

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch(`/api/alerts/${alertId}/resolve`, { method: "POST" })
      setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, resolved: true } : alert)))
    } catch (error) {
      console.error("Failed to resolve alert:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "toxicity":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "conflict":
        return <X className="h-4 w-4 text-orange-500" />
      case "stress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "toxicity":
        return "Токсичность"
      case "conflict":
        return "Конфликт"
      case "stress":
        return "Стресс"
      case "inactivity":
        return "Неактивность"
      default:
        return "Неизвестно"
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const activeAlerts = alerts.filter((alert) => !alert.resolved)
  const resolvedAlerts = alerts.filter((alert) => alert.resolved)

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          Активные уведомления ({activeAlerts.length})
        </h3>
        <div className="space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>Нет активных уведомлений</p>
            </div>
          ) : (
            activeAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getTypeIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(alert.type)}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium mb-1">{alert.message}</p>
                      <p className="text-xs text-gray-600">{new Date(alert.timestamp).toLocaleString("ru-RU")}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                    Решено
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Решенные уведомления ({resolvedAlerts.length})
          </h3>
          <div className="space-y-3">
            {resolvedAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="p-4 border rounded-lg bg-gray-50 opacity-75">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {getTypeLabel(alert.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{alert.message}</p>
                    <p className="text-xs text-gray-500">Решено: {new Date(alert.timestamp).toLocaleString("ru-RU")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
