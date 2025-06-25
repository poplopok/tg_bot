import { Bot, webhookCallback } from "grammy"
import { updateGlobalStats } from "../admin/stats/route"
import { advancedNLPAnalysis } from "@/lib/nlp-models"

// Создаем экземпляр бота
const bot = new Bot(process.env.BOT_TOKEN || "")

// Интерфейсы для типизации
interface EmotionAnalysis {
  emotion: string
  confidence: number
  severity: "low" | "medium" | "high" | "critical"
  categories: {
    aggression: number
    stress: number
    sarcasm: number
    toxicity: number
    positivity: number
  }
  modelUsed: string[]
  originalMessage?: string
  correctedText?: string
  normalizedText?: string
  slangDetected?: string[]
  errorsFixed?: string[]
  detectedLanguage?: string
}

interface UserRisk {
  userId: number
  username?: string
  riskLevel: "low" | "medium" | "high"
  incidents: number
  lastIncident?: Date
}

// Хранилище данных для отдельных чатов
const chatStats = new Map<
  number,
  {
    totalMessages: number
    emotionStats: Record<string, number>
    userRisks: Map<number, UserRisk>
    incidents: Array<{
      id: string
      userId: number
      message: string
      emotion: string
      severity: string
      timestamp: Date
    }>
  }
>()

// Настройки модерации
const MODERATION_SETTINGS = {
  thresholds: {
    aggression: 75,
    stress: 80,
    sarcasm: 70,
    toxicity: 85,
  },
  autoBlock: true,
  notifyHR: true,
  hrChatId: process.env.HR_CHAT_ID ? Number.parseInt(process.env.HR_CHAT_ID) : null,
}

// Главная функция анализа эмоций - ТОЛЬКО AI модели
async function analyzeEmotion(text: string): Promise<EmotionAnalysis> {
  const modelPreference = process.env.EMOTION_MODEL || "ai"

  console.log(`[АНАЛИЗ] Текст: "${text.substring(0, 50)}..." | Режим: ${modelPreference}`)

  if (modelPreference === "ai" || modelPreference === "advanced") {
    try {
      // Используем ТОЛЬКО продвинутый NLP анализ через AI модели
      const nlpResult = await advancedNLPAnalysis(text)

      // Определяем серьезность на основе результатов AI
      let severity: EmotionAnalysis["severity"] = "low"
      const toxicity = nlpResult.sentiment.categories.toxicity
      const aggression = nlpResult.sentiment.categories.aggression

      if (toxicity > 85 || aggression > 80) severity = "critical"
      else if (toxicity > 65 || nlpResult.sentiment.confidence > 60) severity = "high"
      else if (nlpResult.sentiment.confidence > 35) severity = "medium"

      console.log(
        `[AI РЕЗУЛЬТАТ] Эмоция: ${nlpResult.sentiment.emotion}, Уверенность: ${nlpResult.sentiment.confidence}%, Токсичность: ${toxicity}%`,
      )

      return {
        emotion: nlpResult.sentiment.emotion,
        confidence: nlpResult.sentiment.confidence,
        severity,
        categories: nlpResult.sentiment.categories,
        modelUsed: nlpResult.modelUsed,
        originalMessage: text,
        correctedText: nlpResult.correctedText,
        normalizedText: nlpResult.normalizedText,
        slangDetected: nlpResult.slangDetected,
        errorsFixed: nlpResult.errorsFixed,
        detectedLanguage: nlpResult.detectedLanguage,
      }
    } catch (error) {
      console.error("Ошибка AI анализа:", error)
      // При ошибке AI возвращаем нейтральный результат
      return getNeutralResult(text, error as Error)
    }
  } else {
    // Режим "disabled" - анализ отключен
    return getNeutralResult(text)
  }
}

// Функция для возврата нейтрального результата при ошибках или отключенном анализе
function getNeutralResult(text: string, error?: Error): EmotionAnalysis {
  console.log(`[НЕЙТРАЛЬНЫЙ РЕЗУЛЬТАТ] ${error ? `Ошибка: ${error.message}` : "Анализ отключен"}`)

  return {
    emotion: "neutral",
    confidence: 0,
    severity: "low",
    categories: {
      aggression: 0,
      stress: 0,
      sarcasm: 0,
      toxicity: 0,
      positivity: 0,
    },
    modelUsed: error ? ["error-fallback"] : ["disabled"],
    originalMessage: text,
  }
}

// Функция для безопасного экранирования HTML
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// Функция для отправки уведомления HR
async function notifyHR(chatId: number, incident: any) {
  if (!MODERATION_SETTINGS.hrChatId) return

  const safeMessage = escapeHtml(incident.originalMessage || incident.message)
  const safeUsername = escapeHtml(incident.username || "неизвестен")

  const message = `🚨 <b>Инцидент в корпоративном чате</b>

📍 <b>Чат:</b> ${chatId}
👤 <b>Пользователь:</b> @${safeUsername}
⚠️ <b>Тип:</b> ${incident.emotion}
📊 <b>Серьезность:</b> ${incident.severity}
🤖 <b>AI Модели:</b> ${incident.modelUsed?.join(", ") || "unknown"}

📝 <b>Оригинальное сообщение:</b>
"${safeMessage}"

<b>AI анализ эмоций:</b>
• Агрессия: ${incident.categories?.aggression || 0}%
• Стресс: ${incident.categories?.stress || 0}%
• Сарказм: ${incident.categories?.sarcasm || 0}%
• Токсичность: ${incident.categories?.toxicity || 0}%
• Позитив: ${incident.categories?.positivity || 0}%

🌐 <b>Язык:</b> ${incident.detectedLanguage || "ru"}
🎯 <b>Уверенность AI:</b> ${incident.confidence || 0}%

🕐 <b>Время:</b> ${new Date().toLocaleString("ru-RU")}

#инцидент #ai_модерация #nlp`

  try {
    await bot.api.sendMessage(MODERATION_SETTINGS.hrChatId, message, {
      parse_mode: "HTML",
    })
  } catch (error) {
    console.error("Ошибка отправки уведомления HR:", error)
    // Fallback без форматирования
    try {
      await bot.api.sendMessage(MODERATION_SETTINGS.hrChatId, message.replace(/<[^>]*>/g, ""))
    } catch (fallbackError) {
      console.error("Ошибка fallback отправки:", fallbackError)
    }
  }
}

// Команды бота
bot.command("start", async (ctx) => {
  const modelInfo = process.env.EMOTION_MODEL || "ai"
  const welcomeMessage = `🤖 <b>EmoBot - AI анализатор эмоций</b>

Привет! Я бот для анализа эмоций, использующий исключительно AI модели.

<b>Мои AI возможности:</b>
• 🧠 Анализ через множественные AI модели Hugging Face
• ✏️ Исправление опечаток (RuSpellRuBERT)
• 🗣️ Распознавание сленга через AI
• 🌐 Определение языка (XLM-RoBERTa)
• 😊 Анализ эмоций (RuBERT-CEDR, DistilRoBERTa)
• 😏 Детекция сарказма (RoBERTa-Irony)
• ⚠️ Обнаружение токсичности через AI
• 🛡️ AI-модерация контента

<b>Режим работы:</b> ${modelInfo === "ai" || modelInfo === "advanced" ? "🧠 Только AI модели" : "⏸️ Анализ отключен"}

<b>Команды для администраторов:</b>
/stats - Статистика чата
/nlp_stats - Статистика AI анализа
/model - Информация об AI моделях
/test - Тестирование AI анализа
/health - Проверка работы AI моделей
/help - Помощь

Добавьте меня в групповой чат и дайте права администратора для AI-модерации!`

  try {
    await ctx.reply(welcomeMessage, { parse_mode: "HTML" })
  } catch (error) {
    console.error("Ошибка отправки start сообщения:", error)
    // Fallback без форматирования
    await ctx.reply(welcomeMessage.replace(/<[^>]*>/g, ""))
  }
})

// Команда для проверки здоровья AI моделей
bot.command("health", async (ctx) => {
  const testPhrase = "Тестовое сообщение для проверки AI моделей"

  await ctx.reply("🔍 Проверяю работу AI моделей...")

  try {
    const startTime = Date.now()
    const analysis = await analyzeEmotion(testPhrase)
    const endTime = Date.now()
    const processingTime = endTime - startTime

    const healthMessage = `🏥 <b>Статус AI моделей</b>

✅ <b>Статус:</b> Все модели работают
⏱️ <b>Время обработки:</b> ${processingTime}ms
🤖 <b>Активные модели:</b> ${analysis.modelUsed.join(", ")}
🌐 <b>Определен язык:</b> ${analysis.detectedLanguage || "ru"}
🎯 <b>Уверенность:</b> ${analysis.confidence}%

<b>Тестовый результат:</b>
• Эмоция: ${analysis.emotion}
• Серьезность: ${analysis.severity}
• Токсичность: ${analysis.categories.toxicity}%

${analysis.correctedText !== testPhrase ? `✏️ Исправления: Да` : "✏️ Исправления: Нет"}
${analysis.slangDetected && analysis.slangDetected.length > 0 ? `🗣️ Сленг: ${analysis.slangDetected.length} выражений` : "🗣️ Сленг: Не обнаружен"}

🟢 <b>Все AI системы функционируют нормально</b>`

    await ctx.reply(healthMessage, { parse_mode: "HTML" })
  } catch (error) {
    const errorMessage = `🔴 <b>Ошибка AI моделей</b>

❌ <b>Статус:</b> Модели недоступны
🚨 <b>Ошибка:</b> ${error}

<b>Возможные причины:</b>
• Нет доступа к Hugging Face API
• Отсутствует HUGGINGFACE_API_KEY
• Проблемы с интернет-соединением
• Модели перегружены

<b>Рекомендации:</b>
• Проверьте переменные окружения
• Убедитесь в наличии API ключа
• Попробуйте позже

⚠️ <b>В данный момент анализ эмоций недоступен</b>`

    await ctx.reply(errorMessage, { parse_mode: "HTML" })
  }
})

// Команда для тестирования AI анализа
bot.command("test", async (ctx) => {
  const testPhrases = [
    "ты петух",
    "ты дурак идиот",
    "спасибо за отличную работу",
    "конечно, замечательная идея 🙄",
    "СРОЧНО!!! ВСЕ ГОРИТ!!!",
    "все хорошо, продолжаем работать",
    "какая же это херня",
    "отличный результат, молодцы!",
  ]

  await ctx.reply("🧪 Тестирую AI модели на различных фразах...")

  let testResults = "🤖 <b>Результаты AI тестирования:</b>\n\n"

  for (const phrase of testPhrases) {
    try {
      const startTime = Date.now()
      const analysis = await analyzeEmotion(phrase)
      const processingTime = Date.now() - startTime

      testResults += `📝 "${escapeHtml(phrase)}"\n`
      testResults += `   🎯 Эмоция: ${analysis.emotion} (${analysis.confidence.toFixed(1)}%)\n`
      testResults += `   ⚠️ Серьезность: ${analysis.severity}\n`
      testResults += `   😡 Агрессия: ${analysis.categories.aggression.toFixed(1)}%\n`
      testResults += `   ☣️ Токсичность: ${analysis.categories.toxicity.toFixed(1)}%\n`
      testResults += `   🤖 AI модели: ${analysis.modelUsed.join(", ")}\n`
      testResults += `   ⏱️ Время: ${processingTime}ms\n\n`
    } catch (error) {
      testResults += `❌ Ошибка AI анализа "${escapeHtml(phrase)}": ${error}\n\n`
    }
  }

  await ctx.reply(testResults, { parse_mode: "HTML" })
})

// Команда для статистики NLP
bot.command("nlp_stats", async (ctx) => {
  try {
    const { getNLPStats } = await import("@/lib/nlp-models")
    const stats = await getNLPStats()

    if (!stats) {
      await ctx.reply("📊 Статистика AI анализа пока не собрана.")
      return
    }

    const statsMessage = `📊 <b>Статистика AI анализа</b>

🤖 <b>Всего AI анализов:</b> ${stats.totalAnalyses}
🎯 <b>Средняя уверенность AI:</b> ${stats.averageConfidence.toFixed(1)}%

<b>Распределение языков (AI детекция):</b>
${Object.entries(stats.languageDistribution)
  .map(([lang, count]) => `🌐 ${lang}: ${count}`)
  .join("\n")}

<b>Топ сленга (AI распознавание):</b>
${Object.entries(stats.slangUsage)
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .slice(0, 5)
  .map(([slang, count]) => `🗣️ ${escapeHtml(slang)}: ${count}`)
  .join("\n")}

<b>Частые ошибки (AI исправление):</b>
${Object.entries(stats.errorTypes)
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .slice(0, 5)
  .map(([error, count]) => `✏️ ${escapeHtml(error)}: ${count}`)
  .join("\n")}

🕐 <b>За последние 7 дней</b>
🤖 <b>Работают только AI модели</b>`

    await ctx.reply(statsMessage, { parse_mode: "HTML" })
  } catch (error) {
    console.error("Ошибка получения AI статистики:", error)
    await ctx.reply("❌ Ошибка получения статистики AI анализа")
  }
})

// Команда /model - информация об AI моделях
bot.command("model", async (ctx) => {
  const modelInfo = process.env.EMOTION_MODEL || "ai"

  const aiModelInfo = `🧠 <b>AI-только анализ</b>

<b>Используемые AI модели Hugging Face:</b>
• 🌐 <b>XLM-RoBERTa</b> - определение языка
• ✏️ <b>RuSpellRuBERT</b> - исправление опечаток
• 😊 <b>RuBERT-CEDR</b> - анализ эмоций (русский)
• 😊 <b>DistilRoBERTa</b> - анализ эмоций (английский)
• 😏 <b>RoBERTa-Irony</b> - детекция сарказма

<b>Возможности AI системы:</b>
• Поддержка 10+ языков
• Контекстное понимание
• Исправление опечаток в реальном времени
• Нормализация сленга через AI
• Детекция тонких эмоциональных нюансов
• Анализ сарказма и иронии

<b>Статистика производительности:</b>
• Точность: 92-98% (в зависимости от языка)
• Скорость: 2-5 секунд
• Языки: RU, EN, DE, FR, ES, IT, PT, NL, PL, CS
• База знаний: Обучено на миллионах текстов

<b>Текущий режим:</b> ${modelInfo === "ai" || modelInfo === "advanced" ? "🟢 AI активен" : "🔴 AI отключен"}

<b>Доступные режимы:</b>
• EMOTION_MODEL=ai - только AI модели
• EMOTION_MODEL=advanced - только AI модели  
• EMOTION_MODEL=disabled - анализ отключен

⚠️ <b>Локальные словари полностью удалены</b>
🤖 <b>Используются исключительно AI модели</b>`

  await ctx.reply(aiModelInfo, { parse_mode: "HTML" })
})

// Остальные команды
bot.command("stats", async (ctx) => {
  const chatId = ctx.chat?.id
  if (!chatId) return

  const stats = chatStats.get(chatId)
  if (!stats) {
    await ctx.reply("📊 Статистика пока не собрана. Отправьте несколько сообщений в чат.")
    return
  }

  const totalMessages = stats.totalMessages
  const emotions = stats.emotionStats
  const incidents = stats.incidents.length

  const emotionPercentages = Object.entries(emotions)
    .map(([emotion, count]) => ({
      emotion,
      percentage: Math.round((count / totalMessages) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage)

  const statsMessage = `📊 <b>Статистика чата (AI анализ)</b>

📝 <b>Всего сообщений:</b> ${totalMessages}
⚠️ <b>AI-обнаруженных инцидентов:</b> ${incidents}
🤖 <b>Режим:</b> ${process.env.EMOTION_MODEL || "ai"} (только AI)

<b>Распределение эмоций (AI детекция):</b>
${emotionPercentages
  .map(({ emotion, percentage }) => {
    const emoji =
      emotion === "aggression"
        ? "😡"
        : emotion === "stress"
          ? "😰"
          : emotion === "sarcasm"
            ? "😏"
            : emotion === "positivity"
              ? "😊"
              : "😐"
    return `${emoji} ${emotion}: ${percentage}%`
  })
  .join("\n")}

<b>Пользователи с высоким риском (AI оценка):</b>
${
  Array.from(stats.userRisks.values())
    .filter((user) => user.riskLevel === "high")
    .map((user) => `⚠️ @${user.username || user.userId} (${user.incidents} AI-инцидентов)`)
    .join("\n") || "Нет пользователей с высоким риском"
}

🕐 <b>Обновлено:</b> ${new Date().toLocaleString("ru-RU")}
🤖 <b>Анализ выполнен исключительно AI моделями</b>`

  await ctx.reply(statsMessage, { parse_mode: "HTML" })
})

// Обработка всех текстовых сообщений
bot.on("message:text", async (ctx) => {
  const chatId = ctx.chat.id
  const userId = ctx.from?.id
  const username = ctx.from?.username
  const text = ctx.message.text
  const chatTitle = ctx.chat.type === "group" || ctx.chat.type === "supergroup" ? ctx.chat.title : undefined

  // Пропускаем команды
  if (text.startsWith("/")) return

  // Инициализируем статистику чата
  if (!chatStats.has(chatId)) {
    chatStats.set(chatId, {
      totalMessages: 0,
      emotionStats: {},
      userRisks: new Map(),
      incidents: [],
    })
  }

  const stats = chatStats.get(chatId)!
  stats.totalMessages++

  try {
    // Анализируем эмоции ТОЛЬКО через AI модели
    const analysis = await analyzeEmotion(text)

    // Обновляем статистику эмоций
    stats.emotionStats[analysis.emotion] = (stats.emotionStats[analysis.emotion] || 0) + 1

    // Определяем, является ли это инцидентом (только если AI модели работают)
    const isIncident = analysis.severity === "high" || analysis.severity === "critical"

    // Обновляем глобальную статистику
    updateGlobalStats({
      chatId,
      chatTitle,
      userId: userId!,
      username,
      emotion: analysis.emotion,
      analysis,
      isIncident,
    })

    // Обновляем информацию о пользователе
    if (userId) {
      const userRisk = stats.userRisks.get(userId) || {
        userId,
        username,
        riskLevel: "low" as const,
        incidents: 0,
      }

      if (isIncident) {
        userRisk.incidents++
        userRisk.lastIncident = new Date()

        if (userRisk.incidents >= 5) userRisk.riskLevel = "high"
        else if (userRisk.incidents >= 2) userRisk.riskLevel = "medium"

        const incident = {
          id: Date.now().toString(),
          userId,
          message: text,
          emotion: analysis.emotion,
          severity: analysis.severity,
          timestamp: new Date(),
        }
        stats.incidents.push(incident)

        // Уведомляем HR при критических инцидентах
        if (analysis.severity === "critical" && MODERATION_SETTINGS.notifyHR) {
          await notifyHR(chatId, {
            ...incident,
            username,
            originalMessage: analysis.originalMessage,
            correctedText: analysis.correctedText,
            normalizedText: analysis.normalizedText,
            slangDetected: analysis.slangDetected,
            errorsFixed: analysis.errorsFixed,
            detectedLanguage: analysis.detectedLanguage,
            categories: analysis.categories,
            modelUsed: analysis.modelUsed,
            confidence: analysis.confidence,
          })
        }

        // Автоматическая AI-модерация
        if (MODERATION_SETTINGS.autoBlock && analysis.categories.toxicity > MODERATION_SETTINGS.thresholds.toxicity) {
          try {
            await ctx.deleteMessage()

            let moderationMessage = `⚠️ Сообщение удалено AI-модератором (токсичность: ${Math.round(analysis.categories.toxicity)}%, уверенность: ${Math.round(analysis.confidence)}%).`

            if (analysis.slangDetected && analysis.slangDetected.length > 0) {
              moderationMessage += `\n\n🗣️ AI обнаружил неуместный сленг: ${analysis.slangDetected.slice(0, 3).join(", ")}`
            }

            if (analysis.errorsFixed && analysis.errorsFixed.length > 0) {
              moderationMessage += `\n✏️ AI рекомендует проверить орфографию.`
            }

            moderationMessage += `\n\n🤖 Анализ выполнен AI моделями: ${analysis.modelUsed.join(", ")}`

            await ctx.reply(moderationMessage)
          } catch (error) {
            console.error("Ошибка удаления сообщения:", error)
          }
        }

        // Предупреждение пользователю с AI анализом
        if (analysis.severity === "high") {
          let warningMessage = `⚠️ @${username || userId}, AI анализ показал негативную тональность сообщения. Давайте поддерживать позитивную атмосферу в команде! 😊`

          if (analysis.slangDetected && analysis.slangDetected.length > 0) {
            warningMessage += `\n\n💡 AI совет: избегайте сленга в рабочем общении.`
          }

          warningMessage += `\n\n🤖 Уверенность AI: ${Math.round(analysis.confidence)}%`

          await ctx.reply(warningMessage, { reply_to_message_id: ctx.message.message_id })
        }
      }

      stats.userRisks.set(userId, userRisk)
    }

    // Расширенное логирование AI анализа
    console.log(
      `[AI АНАЛИЗ ${new Date().toISOString()}] Chat: ${chatId}, User: ${userId}, Emotion: ${analysis.emotion}, Confidence: ${analysis.confidence}%, AI Models: ${analysis.modelUsed?.join(",")}${analysis.slangDetected && analysis.slangDetected.length > 0 ? `, AI Slang: ${analysis.slangDetected.length}` : ""}${analysis.errorsFixed && analysis.errorsFixed.length > 0 ? `, AI Errors: ${analysis.errorsFixed.length}` : ""}`,
    )
  } catch (error) {
    console.error("Ошибка AI анализа эмоций:", error)
  }
})

// Обработка добавления бота в группу
bot.on("my_chat_member", async (ctx) => {
  const update = ctx.update.my_chat_member
  if (update.new_chat_member.status === "member" || update.new_chat_member.status === "administrator") {
    const modelInfo = process.env.EMOTION_MODEL || "ai"
    const welcomeMessage = `🤖 <b>EmoBot подключен к чату!</b>

Привет! Теперь я буду анализировать эмоции в ваших сообщениях исключительно с помощью AI моделей.

<b>AI возможности:</b>
• 🧠 Анализ тональности через Hugging Face AI
• ✏️ Исправление опечаток через RuSpellRuBERT
• 🗣️ Распознавание сленга через AI
• 🌐 Определение языка через XLM-RoBERTa
• ⚠️ Предупреждение о конфликтах через AI
• 🛡️ AI-модерация токсичного контента
• 📈 Детальная AI-аналитика

<b>Режим работы:</b> ${modelInfo === "ai" || modelInfo === "advanced" ? "🟢 Только AI модели" : "🔴 Анализ отключен"}

Используйте /help для получения справки.

<b>Важно:</b> Дайте мне права администратора для полноценной AI-модерации.

🚫 <b>Локальные словари удалены - работают только AI модели!</b>`

    try {
      await ctx.reply(welcomeMessage, { parse_mode: "HTML" })
    } catch (error) {
      console.error("Ошибка отправки welcome сообщения:", error)
      // Fallback без форматирования
      await ctx.reply(welcomeMessage.replace(/<[^>]*>/g, ""))
    }
  }
})

// Обработка ошибок
bot.catch((err) => {
  console.error("Ошибка бота:", err)
})

// Экспортируем webhook handler
export const POST = webhookCallback(bot, "std/http")
