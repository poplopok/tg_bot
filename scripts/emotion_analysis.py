import re
import json
from typing import Dict, List, Tuple
import numpy as np

class EmotionAnalyzer:
    """
    Простая реализация анализатора эмоций для демонстрации
    В реальном проекте здесь будет использоваться BERT/RoBERTa модель
    """
    
    def __init__(self):
        # Словари ключевых слов для каждой эмоции
        self.emotion_keywords = {
            'радость': [
                'отлично', 'супер', 'здорово', 'классно', 'прекрасно', 'замечательно',
                'великолепно', 'восхитительно', 'круто', 'потрясающе', '👍', '😊', 
                '😄', '🎉', '💪', '🔥', 'ура', 'браво'
            ],
            'энтузиазм': [
                'давайте', 'можем', 'получится', 'вперед', 'попробуем', 'сделаем',
                'достигнем', 'победим', 'справимся', '🚀', '💪', '⚡', 'го', 'погнали'
            ],
            'стресс': [
                'дедлайн', 'срочно', 'проблема', 'не успеваю', 'завал', 'аврал',
                'катастрофа', 'кошмар', 'ужас', 'паника', '😰', '😤', '😫', 'помогите'
            ],
            'гнев': [
                'бесит', 'достало', 'надоело', 'злость', 'ярость', 'негодование',
                'возмущение', 'идиоты', 'дураки', '😡', '🤬', '💢', 'ненавижу'
            ],
            'разочарование': [
                'плохо', 'не получается', 'провал', 'неудача', 'облом', 'фиаско',
                'грустно', 'печально', '😞', '😔', '😢', '💔', 'расстроен'
            ],
            'нейтрально': [
                'хорошо', 'нормально', 'понятно', 'ясно', 'согласен', 'принято'
            ]
        }
        
        # Токсичные слова и фразы
        self.toxic_keywords = [
            'идиот', 'дурак', 'тупой', 'кретин', 'дебил', 'урод', 'мразь',
            'говно', 'херня', 'фигня', 'бред', 'чушь', 'ерунда'
        ]
        
        # Эмодзи и их эмоциональная окраска
        self.emoji_emotions = {
            '😊': ('радость', 0.8), '😄': ('радость', 0.9), '😃': ('радость', 0.8),
            '😁': ('радость', 0.7), '🙂': ('радость', 0.6), '😉': ('радость', 0.5),
            '😍': ('радость', 0.9), '🥰': ('радость', 0.9), '😘': ('радость', 0.8),
            '😎': ('энтузиазм', 0.7), '💪': ('энтузиазм', 0.8), '🔥': ('энтузиазм', 0.9),
            '🚀': ('энтузиазм', 0.9), '⚡': ('энтузиазм', 0.8), '🎉': ('радость', 0.9),
            '😰': ('стресс', 0.8), '😤': ('стресс', 0.7), '😫': ('стресс', 0.8),
            '😡': ('гнев', 0.9), '🤬': ('гнев', 1.0), '💢': ('гнев', 0.8),
            '😞': ('разочарование', 0.8), '😔': ('разочарование', 0.7), '😢': ('разочарование', 0.9),
            '💔': ('разочарование', 0.9), '😐': ('нейтрально', 0.8), '🤔': ('нейтрально', 0.6)
        }
    
    def preprocess_text(self, text: str) -> str:
        """Предобработка текста"""
        # Приведение к нижнему регистру
        text = text.lower()
        
        # Удаление лишних пробелов
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Исправление простых опечаток (базовая версия)
        corrections = {
            'превет': 'привет',
            'спосибо': 'спасибо',
            'харашо': 'хорошо',
            'делаем': 'делаем'
        }
        
        for wrong, correct in corrections.items():
            text = text.replace(wrong, correct)
        
        return text
    
    def extract_emojis(self, text: str) -> List[str]:
        """Извлечение эмодзи из текста"""
        emoji_pattern = re.compile(
            "["
            "\U0001F600-\U0001F64F"  # emoticons
            "\U0001F300-\U0001F5FF"  # symbols & pictographs
            "\U0001F680-\U0001F6FF"  # transport & map symbols
            "\U0001F1E0-\U0001F1FF"  # flags (iOS)
            "\U00002702-\U000027B0"
            "\U000024C2-\U0001F251"
            "]+", flags=re.UNICODE
        )
        return emoji_pattern.findall(text)
    
    def analyze_emotion(self, text: str) -> Dict:
        """Анализ эмоций в тексте"""
        processed_text = self.preprocess_text(text)
        emojis = self.extract_emojis(text)
        
        # Подсчет совпадений для каждой эмоции
        emotion_scores = {emotion: 0.0 for emotion in self.emotion_keywords.keys()}
        
        # Анализ ключевых слов
        for emotion, keywords in self.emotion_keywords.items():
            for keyword in keywords:
                if keyword in processed_text:
                    emotion_scores[emotion] += 0.3
        
        # Анализ эмодзи
        for emoji in emojis:
            if emoji in self.emoji_emotions:
                emotion, confidence = self.emoji_emotions[emoji]
                emotion_scores[emotion] += confidence * 0.5
        
        # Анализ пунктуации и регистра
        if '!!!' in text or text.isupper():
            if any(word in processed_text for word in self.emotion_keywords['гнев']):
                emotion_scores['гнев'] += 0.2
            else:
                emotion_scores['энтузиазм'] += 0.2
        
        # Нормализация и определение основной эмоции
        total_score = sum(emotion_scores.values())
        if total_score > 0:
            emotion_scores = {k: v/total_score for k, v in emotion_scores.items()}
        else:
            emotion_scores['нейтрально'] = 1.0
        
        primary_emotion = max(emotion_scores, key=emotion_scores.get)
        confidence = emotion_scores[primary_emotion]
        
        return {
            'primary_emotion': primary_emotion,
            'confidence': confidence,
            'emotion_breakdown': emotion_scores
        }
    
    def analyze_toxicity(self, text: str) -> float:
        """Анализ токсичности сообщения"""
        processed_text = self.preprocess_text(text)
        toxicity_score = 0.0
        
        # Проверка токсичных слов
        for toxic_word in self.toxic_keywords:
            if toxic_word in processed_text:
                toxicity_score += 0.3
        
        # Проверка агрессивных паттернов
        if re.search(r'[А-ЯЁ]{3,}', text):  # Много заглавных букв
            toxicity_score += 0.1
        
        if text.count('!') > 2:  # Много восклицательных знаков
            toxicity_score += 0.1
        
        # Проверка негативных эмодзи
        negative_emojis = ['😡', '🤬', '💢', '🖕']
        for emoji in negative_emojis:
            if emoji in text:
                toxicity_score += 0.2
        
        return min(toxicity_score, 1.0)
    
    def analyze_message(self, message: str, sender: str = None) -> Dict:
        """Полный анализ сообщения"""
        emotion_analysis = self.analyze_emotion(message)
        toxicity_score = self.analyze_toxicity(message)
        
        # Определение уровня риска
        risk_level = 'low'
        if toxicity_score > 0.7:
            risk_level = 'high'
        elif toxicity_score > 0.4:
            risk_level = 'medium'
        
        return {
            'message': message,
            'sender': sender,
            'emotion': emotion_analysis,
            'toxicity': toxicity_score,
            'risk_level': risk_level,
            'recommendations': self._generate_recommendations(emotion_analysis, toxicity_score)
        }
    
    def _generate_recommendations(self, emotion_analysis: Dict, toxicity_score: float) -> List[str]:
        """Генерация рекомендаций на основе анализа"""
        recommendations = []
        
        primary_emotion = emotion_analysis['primary_emotion']
        confidence = emotion_analysis['confidence']
        
        if toxicity_score > 0.5:
            recommendations.append("Рекомендуется модерация сообщения")
            recommendations.append("Уведомить HR о потенциальном нарушении")
        
        if primary_emotion == 'стресс' and confidence > 0.7:
            recommendations.append("Сотрудник испытывает стресс - рассмотреть поддержку")
            recommendations.append("Проверить рабочую нагрузку")
        
        if primary_emotion == 'гнев' and confidence > 0.6:
            recommendations.append("Высокий уровень агрессии - требуется вмешательство")
            recommendations.append("Провести индивидуальную беседу")
        
        if primary_emotion == 'разочарование' and confidence > 0.7:
            recommendations.append("Сотрудник разочарован - выяснить причины")
        
        return recommendations

# Демонстрация работы анализатора
def demo_analysis():
    analyzer = EmotionAnalyzer()
    
    test_messages = [
        "Привет всем! Отличная работа над проектом! 👍😊",
        "Опять эти дедлайны... Когда уже это закончится? 😰",
        "Этот код полное говно! Кто это писал?! 😡",
        "Не получается решить задачу, уже третий день мучаюсь 😞",
        "Давайте сделаем это! У нас все получится! 🚀💪",
        "Нормально, принято к сведению",
        "СРОЧНО!!! НУЖНО ИСПРАВИТЬ БАГИ!!!"
    ]
    
    print("=== ДЕМОНСТРАЦИЯ АНАЛИЗА ЭМОЦИЙ ===\n")
    
    for i, message in enumerate(test_messages, 1):
        print(f"Сообщение {i}: {message}")
        analysis = analyzer.analyze_message(message, f"Пользователь{i}")
        
        print(f"Эмоция: {analysis['emotion']['primary_emotion']} "
              f"(уверенность: {analysis['emotion']['confidence']:.2f})")
        print(f"Токсичность: {analysis['toxicity']:.2f}")
        print(f"Уровень риска: {analysis['risk_level']}")
        
        if analysis['recommendations']:
            print("Рекомендации:")
            for rec in analysis['recommendations']:
                print(f"  - {rec}")
        
        print("-" * 50)

if __name__ == "__main__":
    demo_analysis()
