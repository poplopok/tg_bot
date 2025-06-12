-- Создание таблицы для сообщений
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    username VARCHAR(255),
    message_id BIGINT NOT NULL,
    text TEXT,
    message_type VARCHAR(20) DEFAULT 'text',
    
    -- Эмоции
    joy DECIMAL(3,2) DEFAULT 0,
    anger DECIMAL(3,2) DEFAULT 0,
    fear DECIMAL(3,2) DEFAULT 0,
    sadness DECIMAL(3,2) DEFAULT 0,
    surprise DECIMAL(3,2) DEFAULT 0,
    disgust DECIMAL(3,2) DEFAULT 0,
    neutral DECIMAL(3,2) DEFAULT 1,
    
    -- Дополнительные метрики
    toxicity DECIMAL(3,2) DEFAULT 0,
    sentiment VARCHAR(10) DEFAULT 'neutral',
    confidence DECIMAL(3,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(chat_id, message_id)
);

-- Создание таблицы для настроек чатов
CREATE TABLE IF NOT EXISTS chat_settings (
    id BIGSERIAL PRIMARY KEY,
    chat_id BIGINT UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT true,
    toxicity_threshold DECIMAL(3,2) DEFAULT 0.7,
    alert_admins BOOLEAN DEFAULT true,
    language VARCHAR(5) DEFAULT 'ru',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы для алертов
CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    username VARCHAR(255),
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы для пользователей
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_username ON messages(username);
CREATE INDEX IF NOT EXISTS idx_messages_toxicity ON messages(toxicity);
CREATE INDEX IF NOT EXISTS idx_alerts_chat_id ON alerts(chat_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

-- Включение Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Создание политик безопасности (базовые, можно настроить под нужды)
CREATE POLICY "Allow all operations for service role" ON messages
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for service role" ON chat_settings
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for service role" ON alerts
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for service role" ON users
    FOR ALL USING (true);
