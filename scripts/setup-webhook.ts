// Скрипт для автоматической настройки webhook
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const VERCEL_URL = process.env.VERCEL_URL || process.env.NEXTAUTH_URL

async function setupWebhook() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения")
    return
  }

  if (!VERCEL_URL) {
    console.error("❌ URL приложения не найден. Установите VERCEL_URL или NEXTAUTH_URL")
    return
  }

  const webhookUrl = `${VERCEL_URL}/api/telegram/webhook`

  console.log("🔗 Настройка webhook...")
  console.log(`📍 URL: ${webhookUrl}`)

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "edited_message"],
        drop_pending_updates: true,
      }),
    })

    const result = await response.json()

    if (result.ok) {
      console.log("✅ Webhook успешно настроен!")
      console.log(`📝 Описание: ${result.description}`)

      // Проверяем статус webhook
      await checkWebhookStatus()
    } else {
      console.error("❌ Ошибка настройки webhook:")
      console.error(result)
    }
  } catch (error) {
    console.error("❌ Ошибка подключения к Telegram API:", error)
  }
}

async function checkWebhookStatus() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`)
    const info = await response.json()

    if (info.ok) {
      console.log("\n📊 Статус webhook:")
      console.log(`🔗 URL: ${info.result.url}`)
      console.log(`✅ Активен: ${info.result.url ? "Да" : "Нет"}`)
      console.log(`📈 Ожидающих обновлений: ${info.result.pending_update_count}`)

      if (info.result.last_error_date) {
        console.log(`⚠️ Последняя ошибка: ${new Date(info.result.last_error_date * 1000).toLocaleString()}`)
        console.log(`📝 Сообщение ошибки: ${info.result.last_error_message}`)
      }
    }
  } catch (error) {
    console.error("❌ Ошибка получения статуса webhook:", error)
  }
}

// Запуск скрипта
setupWebhook()
