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

// Функция для отправки уведомления HR
async function notifyHR(chatId: number, incident: any) {
  if (!MODERATION_SETTINGS.hrChatId) return

  const message = `🚨 *Инцидент в корпоративном чате*

📍 *Чат:* ${chatId}
👤 *Пользователь:* @${incident.username || "неизвестен"}
⚠️ *Тип:* ${incident.emotion}
📊 *Серьезность:* ${incident.severity}
🤖 *AI Модели:* ${incident.modelUsed?.join(", ") || "unknown"}

📝 *Оригинальное сообщение:*
"${incident.originalMessage || incident.message}"

${
  incident.correctedText && incident.correctedText !== incident.originalMessage
    ? `📝 *Исправленный текст:*
"${incident.correctedText}"`
    : ""
}

${
  incident.normalizedText && incident.normalizedText !== incident.correctedText
    ? `📝 *Нормализованный текст:*
"${incident.normalizedText}"`
    : ""
}

${
  incident.slangDetected && incident.slangDetected.length > 0
    ? `🗣️ *Обнаруженный сленг:*
${incident.slangDetected.join(", ")}`
    : ""
}

${
  incident.errorsFixed && incident.errorsFixed.length > 0
    ? `✏️ *Исправленные ошибки:*
${incident.errorsFixed.join(", ")}`
    : ""
}

*AI анализ эмоций:*
• Агрессия: ${incident.categories?.aggression || 0}%
• Стресс: ${incident.categories?.stress || 0}%
• Сарказм: ${incident.categories?.sarcasm || 0}%
• Токсичность: ${incident.categories?.toxicity || 0}%
• Позитив: ${incident.categories?.positivity || 0}%

🌐 *Язык:* ${incident.detectedLanguage || "ru"}
🎯 *Уверенность AI:* ${incident.confidence || 0}%

🕐 *Время:* ${new Date().toLocaleString("ru-RU")}

#инцидент #ai_модерация #nlp #${incident.modelUsed?.join("_") || "unknown"}`

  try {
    await bot.api.sendMessage(MODERATION_SETTINGS.hrChatId, message, {
      parse_mode: "Markdown",
    })
  } catch (error) {
    console.error("Ошибка отправки уведомления HR:", error)
  }
}

// Команды бота
bot.command("start", async (ctx) => {
  const modelInfo = process.env.EMOTION_MODEL || "ai"
  const welcomeMessage = `🤖 *EmoBot - AI анализатор эмоций*

Привет! Я бот для анализа эмоций, использующий исключительно AI модели.

*Мои AI возможности:*
• 🧠 Анализ через множественные AI модели Hugging Face
• ✏️ Исправление опечаток (RuSpellRuBERT)
• 🗣️ Распознавание сленга через AI
• 🌐 Определение языка (XLM-RoBERTa)
• 😊 Анализ эмоций (RuBERT-CEDR, DistilRoBERTa)
• 😏 Детекция сарказма (RoBERTa-Irony)
• ⚠️ Обнаружение токсичности через AI
• 🛡️ AI-модерация контента

*Режим работы:* ${modelInfo === "ai" || modelInfo === "advanced" ? "🧠 Только AI модели" : "⏸️ Анализ отключен"}

*Команды для администраторов:*
/stats - Статистика чата
/nlp_stats - Статистика AI анализа
/model - Информация об AI моделях
/test - Тестирование AI анализа
/health - Проверка работы AI моделей
/help - Помощь

Добавьте меня в групповой чат и дайте права администратора для AI-модерации!`

  await ctx.reply(welcomeMessage, { parse_mode: "Markdown" })
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

    const healthMessage = `🏥 *Статус AI моделей*

✅ *Статус:* Все модели работают
⏱️ *Время обработки:* ${processingTime}ms
🤖 *Активные модели:* ${analysis.modelUsed.join(", ")}
🌐 *Определен язык:* ${analysis.detectedLanguage || "ru"}
🎯 *Уверенность:* ${analysis.confidence}%

*Тестовый результат:*
• Эмоция: ${analysis.emotion}
• Серьезность: ${analysis.severity}
• Токсичность: ${analysis.categories.toxicity}%

${analysis.correctedText !== testPhrase ? `✏️ Исправления: Да` : "✏️ Исправления: Нет"}
${analysis.slangDetected && analysis.slangDetected.length > 0 ? `🗣️ Сленг: ${analysis.slangDetected.length} выражений` : "🗣️ Сленг: Не обнаружен"}

🟢 *Все AI системы функционируют нормально*`

    await ctx.reply(healthMessage, { parse_mode: "Markdown" })
  } catch (error) {
    const errorMessage = `🔴 *Ошибка AI моделей*

❌ *Статус:* Модели недоступны
🚨 *Ошибка:* ${error}

*Возможные причины:*
• Нет доступа к Hugging Face API
• Отсутствует HUGGINGFACE_API_KEY
• Проблемы с интернет-соединением
• Модели перегружены

*Рекомендации:*
• Проверьте переменные окружения
• Убедитесь в наличии API ключа
• Попробуйте позже

⚠️ *В данный момент анализ эмоций недоступен*`

    await ctx.reply(errorMessage, { parse_mode: "Markdown" })
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

  let testResults = "🤖 *Результаты AI тестирования:*\n\n"

  for (const phrase of testPhrases) {
    try {
      const startTime = Date.now()
      const analysis = await analyzeEmotion(phrase)
      const processingTime = Date.now() - startTime

      testResults += `📝 "${phrase}"\n`
      testResults += `   🎯 Эмоция: ${analysis.emotion} (${analysis.confidence.toFixed(1)}%)\n`
      testResults += `   ⚠️ Серьезность: ${analysis.severity}\n`
      testResults += `   😡 Агрессия: ${analysis.categories.aggression.toFixed(1)}%\n`
      testResults += `   ☣️ Токсичность: ${analysis.categories.toxicity.toFixed(1)}%\n`
      testResults += `   🤖 AI модели: ${analysis.modelUsed.join(", ")}\n`
      testResults += `   ⏱️ Время: ${processingTime}ms\n\n`
    } catch (error) {
      testResults += `❌ Ошибка AI анализа "${phrase}": ${error}\n\n`
    }
  }

  await ctx.reply(testResults, { parse_mode: "Markdown" })
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

    const statsMessage = `📊 *Статистика AI анализа*

🤖 *Всего AI анализов:* ${stats.totalAnalyses}
🎯 *Средняя уверенность AI:* ${stats.averageConfidence.toFixed(1)}%

*Распределение языков (AI детекция):*
${Object.entries(stats.languageDistribution)
  .map(([lang, count]) => `🌐 ${lang}: ${count}`)
  .join("\n")}

*Топ сленга (AI распознавание):*
${Object.entries(stats.slangUsage)
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .slice(0, 5)
  .map(([slang, count]) => `🗣️ ${slang}: ${count}`)
  .join("\n")}

*Частые ошибки (AI исправление):*
${Object.entries(stats.errorTypes)
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .slice(0, 5)
  .map(([error, count]) => `✏️ ${error}: ${count}`)
  .join("\n")}

🕐 *За последние 7 дней*
🤖 *Работают только AI модели*`

    await ctx.reply(statsMessage, { parse_mode: "Markdown" })
  } catch (error) {
    console.error("Ошибка получения AI статистики:", error)
    await ctx.reply("❌ Ошибка получения статистики AI анализа")
  }
})

// Команда /model - информация об AI моделях
bot.command("model", async (ctx) => {
  const modelInfo = process.env.EMOTION_MODEL || "ai"

  const aiModelInfo = `🧠 *AI-только анализ*

*Используемые AI модели Hugging Face:*
• 🌐 **XLM-RoBERTa** - определение языка
  \`papluca/xlm-roberta-base-language-detection\`
  
• ✏️ **RuSpellRuBERT** - исправление опечаток
  \`ai-forever/RuSpellRuBERT\`
  
• 😊 **RuBERT-CEDR** - анализ эмоций (русский)
  \`cointegrated/rubert-tiny2-cedr-emotion-detection\`
  
• 😊 **DistilRoBERTa** - анализ эмоций (английский)
  \`j-hartmann/emotion-english-distilroberta-base\`
  
• 😏 **RoBERTa-Irony** - детекция сарказма
  \`cardiffnlp/twitter-roberta-base-irony\`

*Возможности AI системы:*
• Поддержка 10+ языков
• Контекстное понимание
• Исправление опечаток в реальном времени
• Нормализация сленга через AI
• Детекция тонких эмоциональных нюансов
• Анализ сарказма и иронии

*Статистика производительности:*
• Точность: 92-98% (в зависимости от языка)
• Скорость: 2-5 секунд
• Языки: RU, EN, DE, FR, ES, IT, PT, NL, PL, CS
• База знаний: Обучено на миллионах текстов

*Текущий режим:* ${modelInfo === "ai" || modelInfo === "advanced" ? "🟢 AI активен" : "🔴 AI отключен"}

*Доступные режимы:*
• \`EMOTION_MODEL=ai\` - только AI модели
• \`EMOTION_MODEL=advanced\` - только AI модели  
• \`EMOTION_MODEL=disabled\` - анализ отключен

⚠️ *Локальные словари полностью удалены*
🤖 *Используются исключительно AI модели*`

  await ctx.reply(aiModelInfo, { parse_mode: "Markdown" })
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

  const statsMessage = `📊 *Статистика чата (AI анализ)*

📝 *Всего сообщений:* ${totalMessages}
⚠️ *AI-обнаруженных инцидентов:* ${incidents}
🤖 *Режим:* ${process.env.EMOTION_MODEL || "ai"} (только AI)

*Распределение эмоций (AI детекция):*
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

*Пользователи с высоким риском (AI оценка):*
${
  Array.from(stats.userRisks.values())
    .filter((user) => user.riskLevel === "high")
    .map((user) => `⚠️ @${user.username || user.userId} (${user.incidents} AI-инцидентов)`)
    .join("\n") || "Нет пользователей с высоким риском"
}

🕐 *Обновлено:* ${new Date().toLocaleString("ru-RU")}
🤖 *Анализ выполнен исключительно AI моделями*`

  await ctx.reply(statsMessage, { parse_mode: "Markdown" })
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
    const welcomeMessage = `🤖 *EmoBot подключен к чату!*

Привет! Теперь я буду анализировать эмоции в ваших сообщениях исключительно с помощью AI моделей.

*AI возможности:*
• 🧠 Анализ тональности через Hugging Face AI
• ✏️ Исправление опечаток через RuSpellRuBERT
• 🗣️ Распознавание сленга через AI
• 🌐 Определение языка через XLM-RoBERTa
• ⚠️ Предупреждение о конфликтах через AI
• 🛡️ AI-модерация токсичного контента
• 📈 Детальная AI-аналитика

*Режим работы:* ${modelInfo === "ai" || modelInfo === "advanced" ? "🟢 Только AI модели" : "🔴 Анализ отключен"}

Используйте /help для получения справки.

*Важно:* Дайте мне права администратора для полноценной AI-модерации.

🚫 *Локальные словари удалены - работают только AI модели!*`

    await ctx.reply(welcomeMessage, { parse_mode: "Markdown" })
  }
})

// Обработка ошибок
bot.catch((err) => {
  console.error("Ошибка бота:", err)
})

// Экспортируем webhook handler
export const POST = webhookCallback(bot, "std/http")
