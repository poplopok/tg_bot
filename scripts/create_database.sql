-- Создание базы данных для системы анализа эмоций
-- Этот скрипт создает необходимые таблицы для хранения данных

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255),
    department VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Таблица чатов/каналов
CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    platform VARCHAR(50) NOT NULL, -- telegram, slack, teams, etc.
    chat_id VARCHAR(100) NOT NULL, -- ID чата в платформе
    department VARCHAR(100),
    is_monitored BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица сообщений
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id),
    user_id INTEGER REFERENCES users(id),
    message_text TEXT NOT NULL,
    message_id VARCHAR(100), -- ID сообщения в платформе
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);

-- Таблица анализа эмоций
CREATE TABLE IF NOT EXISTS emotion_analysis (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id),
    primary_emotion VARCHAR(50) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    emotion_breakdown JSONB, -- детальная разбивка по эмоциям
    toxicity_score DECIMAL(3,2) DEFAULT 0.00,
    risk_level VARCHAR(20) DEFAULT 'low',
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица инцидентов
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id),
    user_id INTEGER REFERENCES users(id),
    incident_type VARCHAR(50) NOT NULL, -- toxicity, conflict, stress, etc.
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    description TEXT,
    status VARCHAR(20) DEFAULT 'open', -- open, investigating, resolved, closed
    assigned_to INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Таблица настроек модерации
CREATE TABLE IF NOT EXISTS moderation_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- keyword, toxicity_threshold, etc.
    rule_value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица уведомлений
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER REFERENCES incidents(id),
    recipient_id INTEGER REFERENCES users(id),
    notification_type VARCHAR(50) NOT NULL, -- email, slack, teams
    message TEXT NOT NULL,
    sent_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' -- pending, sent, failed
);

-- Таблица статистики по отделам
CREATE TABLE IF NOT EXISTS department_stats (
    id SERIAL PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    total_messages INTEGER DEFAULT 0,
    positive_messages INTEGER DEFAULT 0,
    negative_messages INTEGER DEFAULT 0,
    toxic_messages INTEGER DEFAULT 0,
    average_sentiment DECIMAL(3,2) DEFAULT 0.00,
    risk_score DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department, date)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_messages_chat_timestamp ON messages(chat_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_user_timestamp ON messages(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_emotion_analysis_message ON emotion_analysis(message_id);
CREATE INDEX IF NOT EXISTS idx_incidents_user_created ON incidents(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_department_stats_date ON department_stats(department, date);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления timestamps
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moderation_rules_updated_at 
    BEFORE UPDATE ON moderation_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблицам
COMMENT ON TABLE users IS 'Пользователи системы';
COMMENT ON TABLE chats IS 'Чаты и каналы для мониторинга';
COMMENT ON TABLE messages IS 'Сообщения из чатов';
COMMENT ON TABLE emotion_analysis IS 'Результаты анализа эмоций';
COMMENT ON TABLE incidents IS 'Инциденты и нарушения';
COMMENT ON TABLE moderation_rules IS 'Правила модерации';
COMMENT ON TABLE notifications IS 'Уведомления пользователям';
COMMENT ON TABLE department_stats IS 'Статистика по отделам';

PRINT 'База данных успешно создана!';
