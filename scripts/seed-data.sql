-- Добавление тестовых данных для демонстрации

-- Тестовые настройки чата
INSERT INTO chat_settings (chat_id, enabled, toxicity_threshold, alert_admins, language) 
VALUES 
    (-1001234567890, true, 0.7, true, 'ru'),
    (-1001234567891, true, 0.8, false, 'en')
ON CONFLICT (chat_id) DO NOTHING;

-- Тестовые пользователи
INSERT INTO users (user_id, username, first_name, is_admin) 
VALUES 
    (123456789, 'admin_user', 'Администратор', true),
    (987654321, 'test_user', 'Тестовый пользователь', false),
    (555666777, 'developer', 'Разработчик', false)
ON CONFLICT (user_id) DO NOTHING;

-- Тестовые сообщения с различными эмоциями
INSERT INTO messages (
    chat_id, user_id, username, message_id, text, message_type,
    joy, anger, fear, sadness, surprise, disgust, neutral,
    toxicity, sentiment, confidence
) VALUES 
    (
        -1001234567890, 987654321, 'test_user', 1001,
        'Отличная работа команды! Проект готов к релизу 🚀',
        'text', 0.8, 0.05, 0.02, 0.03, 0.05, 0.02, 0.03,
        0.1, 'positive', 0.9
    ),
    (
        -1001234567890, 555666777, 'developer', 1002,
        'Нужно срочно исправить критический баг в продакшене',
        'text', 0.1, 0.3, 0.4, 0.1, 0.05, 0.02, 0.03,
        0.4, 'negative', 0.8
    ),
    (
        -1001234567890, 987654321, 'test_user', 1003,
        '[Голосовое сообщение - 15 сек]',
        'voice', 0.3, 0.2, 0.1, 0.2, 0.1, 0.05, 0.05,
        0.3, 'negative', 0.7
    ),
    (
        -1001234567890, 555666777, 'developer', 1004,
        'Спасибо за помощь! Все работает как надо',
        'text', 0.7, 0.05, 0.05, 0.05, 0.1, 0.02, 0.03,
        0.1, 'positive', 0.85
    )
ON CONFLICT (chat_id, message_id) DO NOTHING;

-- Тестовые алерты
INSERT INTO alerts (chat_id, type, severity, message, username, resolved) 
VALUES 
    (-1001234567890, 'toxicity', 'high', 'Обнаружено токсичное сообщение от пользователя developer', 'developer', false),
    (-1001234567890, 'stress', 'medium', 'Повышенный уровень стресса в команде разработки', NULL, false),
    (-1001234567890, 'conflict', 'high', 'Потенциальный конфликт между участниками', 'test_user', true);
