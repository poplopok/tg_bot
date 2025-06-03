-- Создание таблицы для хранения результатов анализа эмоций
CREATE TABLE emotion_analysis (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  message_text TEXT NOT NULL,
  emotions JSONB NOT NULL,
  message_type VARCHAR(10) NOT NULL CHECK (message_type IN ('text', 'voice')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX idx_emotion_analysis_user_id ON emotion_analysis(user_id);
CREATE INDEX idx_emotion_analysis_created_at ON emotion_analysis(created_at);
CREATE INDEX idx_emotion_analysis_message_type ON emotion_analysis(message_type);

-- Включение Row Level Security
ALTER TABLE emotion_analysis ENABLE ROW LEVEL SECURITY;

-- Политика для доступа к данным (настройте под ваши нужды)
CREATE POLICY "Allow service role access" ON emotion_analysis
  FOR ALL USING (auth.role() = 'service_role');
