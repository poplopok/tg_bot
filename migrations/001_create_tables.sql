-- Таблица пользователей
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT
);

-- Таблица сообщений
CREATE TABLE public.messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.users(id),
  message TEXT,
  emotion TEXT,
  score FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица предупреждений
CREATE TABLE public.warnings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.users(id),
  reason TEXT,
  emotion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
