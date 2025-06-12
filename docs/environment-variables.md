# Переменные окружения - Подробное руководство

## 🔐 FUNCTION_SECRET
**Что это:** Секретный ключ для защиты webhook от несанкционированных запросов

**Как получить:**
1. Сгенерируйте случайную строку длиной 32+ символов
2. Можно использовать онлайн генератор: https://generate-secret.vercel.app/32
3. Или в терминале: `openssl rand -hex 32`

**Пример:**
\`\`\`
FUNCTION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
\`\`\`

---

## 🎤 ASSEMBLYAI_API_KEY
**Что это:** API ключ для резервной транскрипции голосовых сообщений (опционально)

**Как получить:**
1. Зайдите на https://www.assemblyai.com/
2. Зарегистрируйтесь (бесплатно)
3. Перейдите в Dashboard → API Keys
4. Скопируйте ваш API ключ

**Альтернативы (если не нужен):**
- Можно оставить пустым - система будет использовать только Hugging Face
- Или использовать другие сервисы транскрипции

**Пример:**
\`\`\`
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
\`\`\`

---

## 🔑 NEXTAUTH_SECRET
**Что это:** Секретный ключ для шифрования JWT токенов (если планируете добавить аутентификацию)

**Как получить:**
1. Сгенерируйте случайную строку длиной 32+ символов
2. Онлайн генератор: https://generate-secret.vercel.app/32
3. Или в терминале: `openssl rand -hex 32`

**Примечание:** Эта переменная нужна только если вы планируете добавить систему входа для администраторов

**Пример:**
\`\`\`
NEXTAUTH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4
\`\`\`

---

## 🌐 NEXTAUTH_URL
**Что это:** URL вашего приложения для правильной работы аутентификации

**Как получить:**
1. После деплоя на Vercel, скопируйте URL вашего приложения
2. Обычно выглядит как: `https://your-project-name.vercel.app`
3. Или ваш кастомный домен

**Для разработки:**
\`\`\`
NEXTAUTH_URL=http://localhost:3000
\`\`\`

**Для продакшена:**
\`\`\`
NEXTAUTH_URL=https://your-project-name.vercel.app
\`\`\`

---

## 📋 Полный список всех переменных

### Обязательные:
\`\`\`env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_from_botfather
HUGGINGFACE_API_KEY=your_huggingface_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### Рекомендуемые:
\`\`\`env
FUNCTION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
\`\`\`

### Опциональные:
\`\`\`env
ASSEMBLYAI_API_KEY=your_assemblyai_key_for_better_transcription
NEXTAUTH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
\`\`\`

---

## 🛠️ Быстрая настройка

### 1. Генерация секретов одной командой:
\`\`\`bash
echo "FUNCTION_SECRET=$(openssl rand -hex 32)"
echo "NEXTAUTH_SECRET=$(openssl rand -hex 32)"
\`\`\`

### 2. Минимальная конфигурация для старта:
Для базовой работы достаточно этих переменных:
\`\`\`env
TELEGRAM_BOT_TOKEN=your_bot_token
HUGGINGFACE_API_KEY=your_hf_token
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
FUNCTION_SECRET=generated_random_string
\`\`\`

### 3. Добавление в Vercel:
1. Откройте ваш проект в Vercel Dashboard
2. Перейдите в Settings → Environment Variables
3. Добавьте каждую переменную отдельно
4. Нажмите "Save" и сделайте redeploy

---

## ⚠️ Важные замечания

1. **Никогда не коммитьте .env файлы в Git**
2. **FUNCTION_SECRET** - добавьте для безопасности webhook
3. **ASSEMBLYAI_API_KEY** - можно пропустить, если используете только Hugging Face
4. **NextAuth переменные** - нужны только если планируете аутентификацию
5. **Все секреты должны быть уникальными** для каждого проекта

---

## 🔗 Полезные ссылки

- [Генератор секретов](https://generate-secret.vercel.app/32)
- [Hugging Face API Keys](https://huggingface.co/settings/tokens)
- [AssemblyAI Dashboard](https://www.assemblyai.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
