-- Создание таблиц для Telegram бота анализа эмоций
-- Выполните этот скрипт в SQL Editor вашего Supabase проекта

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица сообщений
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  username VARCHAR(255),
  message_text TEXT NOT NULL,
  message_id INTEGER, -- ID сообщения в Telegram
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица анализа эмоций
CREATE TABLE IF NOT EXISTS emotion_analysis (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
  primary_emotion VARCHAR(50) NOT NULL,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  toxicity DECIMAL(3,2) NOT NULL DEFAULT 0 CHECK (toxicity >= 0 AND toxicity <= 1),
  sentiment VARCHAR(20) NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  explanation TEXT,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица статистики чатов
CREATE TABLE IF NOT EXISTS chat_stats (
  id SERIAL PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_messages INTEGER DEFAULT 0,
  positive_messages INTEGER DEFAULT 0,
  negative_messages INTEGER DEFAULT 0,
  neutral_messages INTEGER DEFAULT 0,
  toxic_messages INTEGER DEFAULT 0,
  avg_toxicity DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_id, date)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_analysis_message_id ON emotion_analysis(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_stats_chat_date ON chat_stats(chat_id, date);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at в таблице users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Включение Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_stats ENABLE ROW LEVEL SECURITY;

-- Политики доступа для сервисного ключа (полный доступ)
CREATE POLICY "Service role can do everything on users" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on messages" ON messages
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on emotion_analysis" ON emotion_analysis
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on chat_stats" ON chat_stats
    FOR ALL USING (auth.role() = 'service_role');

-- Политики для анонимного доступа (только чтение для дашборда)
CREATE POLICY "Anonymous can read messages" ON messages
    FOR SELECT USING (true);

CREATE POLICY "Anonymous can read emotion_analysis" ON emotion_analysis
    FOR SELECT USING (true);

CREATE POLICY "Anonymous can read chat_stats" ON chat_stats
    FOR SELECT USING (true);

CREATE POLICY "Anonymous can read users" ON users
    FOR SELECT USING (true);

-- Комментарии к таблицам
COMMENT ON TABLE users IS 'Пользователи Telegram бота';
COMMENT ON TABLE messages IS 'Сообщения из Telegram чатов';
COMMENT ON TABLE emotion_analysis IS 'Результаты анализа эмоций сообщений';
COMMENT ON TABLE chat_stats IS 'Статистика по чатам за день';

-- Функция для обновления статистики чата
CREATE OR REPLACE FUNCTION update_chat_stats()
RETURNS TRIGGER AS $$
DECLARE
    chat_record RECORD;
BEGIN
    -- Получаем статистику для чата за сегодня
    SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN ea.sentiment = 'positive' THEN 1 END) as positive,
        COUNT(CASE WHEN ea.sentiment = 'negative' THEN 1 END) as negative,
        COUNT(CASE WHEN ea.sentiment = 'neutral' THEN 1 END) as neutral,
        COUNT(CASE WHEN ea.toxicity > 0.5 THEN 1 END) as toxic,
        AVG(ea.toxicity) as avg_tox
    INTO chat_record
    FROM messages m
    LEFT JOIN emotion_analysis ea ON m.id = ea.message_id
    WHERE m.chat_id = NEW.chat_id 
    AND DATE(m.created_at) = CURRENT_DATE;

    -- Обновляем или создаем запись статистики
    INSERT INTO chat_stats (
        chat_id, 
        date, 
        total_messages, 
        positive_messages, 
        negative_messages, 
        neutral_messages, 
        toxic_messages, 
        avg_toxicity
    ) VALUES (
        NEW.chat_id,
        CURRENT_DATE,
        chat_record.total,
        chat_record.positive,
        chat_record.negative,
        chat_record.neutral,
        chat_record.toxic,
        COALESCE(chat_record.avg_tox, 0)
    )
    ON CONFLICT (chat_id, date) 
    DO UPDATE SET
        total_messages = chat_record.total,
        positive_messages = chat_record.positive,
        negative_messages = chat_record.negative,
        neutral_messages = chat_record.neutral,
        toxic_messages = chat_record.toxic,
        avg_toxicity = COALESCE(chat_record.avg_tox, 0);

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления статистики при добавлении анализа эмоций
CREATE TRIGGER update_chat_stats_trigger
    AFTER INSERT ON emotion_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_stats();

PRINT 'Таблицы успешно созданы!';
PRINT 'Настроены индексы, триггеры и политики безопасности.';
PRINT 'Теперь можно использовать бота для анализа эмоций.';
