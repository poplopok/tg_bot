---

## 🔍 Проверка работы webhook

### Проверка статуса
\`\`\`bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
\`\`\`

### Ожидаемый ответ:
\`\`\`json
{
  "ok": true,
  "result": {
    "url": "https://your-app.vercel.app/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40,
    "allowed_updates": ["message", "edited_message"]
  }
}
\`\`\`

---

## 🐛 Устранение проблем

### Проблема: Webhook не работает
**Решения:**
1. Проверьте URL приложения (должен быть HTTPS)
2. Убедитесь, что endpoint `/api/telegram/webhook` доступен
3. Проверьте переменные окружения в Vercel
4. Посмотрите логи в Vercel Dashboard

### Проблема: 403 Forbidden
**Решения:**
1. Проверьте токен бота
2. Убедитесь, что бот не заблокирован
3. Проверьте права бота в чате

### Проблема: Timeout
**Решения:**
1. Оптимизируйте код обработки сообщений
2. Используйте асинхронную обработку
3. Добавьте таймауты в API запросы

---

## 📱 Тестирование webhook

### 1. Отправьте тестовое сообщение
Напишите боту в личные сообщения или добавьте в группу

### 2. Проверьте логи Vercel
1. Откройте Vercel Dashboard
2. Перейдите в Functions → View Function Logs
3. Найдите логи от `/api/telegram/webhook`

### 3. Проверьте базу данных
Убедитесь, что сообщения сохраняются в Supabase

---

## 🔄 Удаление webhook

Если нужно отключить webhook:
\`\`\`bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/deleteWebhook"
\`\`\`

---

## 📚 Дополнительные ресурсы

- [Telegram Bot API - Webhooks](https://core.telegram.org/bots/api#setwebhook)
- [Vercel Functions](https://vercel.com/docs/concepts/functions)
- [Debugging Webhooks](https://core.telegram.org/bots/api#getting-updates)

---

## ⚡ Быстрый старт

\`\`\`bash
# 1. Замените переменные
export BOT_TOKEN="your_bot_token"
export APP_URL="https://your-app.vercel.app"

# 2. Настройте webhook
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$APP_URL/api/telegram/webhook\"}"

# 3. Проверьте статус
curl "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo"
\`\`\`

Готово! Ваш бот теперь будет получать сообщения через webhook в реальном времени.
