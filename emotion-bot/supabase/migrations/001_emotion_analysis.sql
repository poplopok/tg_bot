-- Создание таблицы для хранения результатов анализа эмоций
CREATE TABLE emotion_analysis (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  chat_id BIGINT NOT NULL,
  message_text TEXT,
  emotion_label VARCHAR(50) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL,
  raw_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX idx_emotion_analysis_user_id ON emotion_analysis(user_id);
CREATE INDEX idx_emotion_analysis_chat_id ON emotion_analysis(chat_id);
CREATE INDEX idx_emotion_analysis_created_at ON emotion_analysis(created_at);
CREATE INDEX idx_emotion_analysis_emotion_label ON emotion_analysis(emotion_label);

-- Создание таблицы для обучающих данных
CREATE TABLE training_data (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  emotion_label VARCHAR(50) NOT NULL,
  confidence DECIMAL(5,4),
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
