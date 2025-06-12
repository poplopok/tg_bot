import { saveAlert } from "./database"

interface EmotionResult {
  joy: number
  anger: number
  fear: number
  sadness: number
  surprise: number
  disgust: number
  neutral: number
  toxicity: number
  sentiment: "positive" | "negative" | "neutral"
  confidence: number
}

export async function checkAlerts(chatId: number, emotions: EmotionResult, username: string) {
  try {
    // Проверка токсичности
    if (emotions.toxicity > 0.7) {
      await saveAlert({
        chatId,
        type: "toxicity",
        severity: emotions.toxicity > 0.9 ? "high" : "medium",
        message: `Обнаружено токсичное сообщение от пользователя ${username}`,
        username,
      })

      // Отправляем уведомление администраторам
      await notifyAdmins(chatId, "toxicity", username, emotions.toxicity)
    }

    // Проверка высокого уровня гнева
    if (emotions.anger > 0.8) {
      await saveAlert({
        chatId,
        type: "anger",
        severity: "high",
        message: `Высокий уровень гнева у пользователя ${username}`,
        username,
      })
    }

    // Проверка стресса (комбинация страха и грусти)
    const stressLevel = emotions.fear + emotions.sadness
    if (stressLevel > 0.7) {
      await saveAlert({
        chatId,
        type: "stress",
        severity: stressLevel > 0.9 ? "high" : "medium",
        message: `Повышенный уровень стресса у пользователя ${username}`,
        username,
      })
    }

    // Проверка паттернов конфликта (анализ последних сообщений)
    await checkConflictPatterns(chatId, username, emotions)
  } catch (error) {
    console.error("Error checking alerts:", error)
  }
}

async function checkConflictPatterns(chatId: number, username: string, emotions: EmotionResult) {
  // Здесь можно добавить более сложную логику анализа паттернов
  // Например, анализ взаимодействий между конкретными пользователями

  if (emotions.anger > 0.6 && emotions.toxicity > 0.5) {
    await saveAlert({
      chatId,
      type: "conflict",
      severity: "medium",
      message: `Потенциальный конфликт с участием ${username}`,
      username,
    })
  }
}

async function notifyAdmins(chatId: number, alertType: string, username: string, severity: number) {
  try {
    // Получаем список администраторов чата
    const admins = await getChatAdmins(chatId)

    const message = `🚨 Алерт: ${alertType}\n👤 Пользователь: ${username}\n📊 Уровень: ${(severity * 100).toFixed(0)}%\n💬 Чат: ${chatId}`

    // Отправляем уведомления администраторам
    for (const admin of admins) {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: admin.userId,
          text: message,
          parse_mode: "HTML",
        }),
      })
    }
  } catch (error) {
    console.error("Error notifying admins:", error)
  }
}

async function getChatAdmins(chatId: number) {
  try {
    // Получаем администраторов чата через Telegram API
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChatAdministrators?chat_id=${chatId}`,
    )
    const data = await response.json()

    if (data.ok) {
      return data.result.map((admin: any) => ({
        userId: admin.user.id,
        username: admin.user.username,
        firstName: admin.user.first_name,
      }))
    }

    return []
  } catch (error) {
    console.error("Error fetching chat admins:", error)
    return []
  }
}

// Функция для анализа трендов команды
export async function analyzeTeamTrends(chatId: number) {
  try {
    // Здесь можно добавить анализ долгосрочных трендов
    // Например, снижение общей позитивности команды за последние недели

    // Пример: если средняя позитивность упала ниже 50% за последние 3 дня
    // создаем алерт о проблемах в команде

    console.log(`Analyzing trends for chat ${chatId}`)
  } catch (error) {
    console.error("Error analyzing team trends:", error)
  }
}
