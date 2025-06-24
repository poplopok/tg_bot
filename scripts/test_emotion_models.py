"""
Тестирование моделей анализа эмоций
"""

import json
from emotion_analyzer import EmotionAnalyzer

def test_emotions():
    """Тестирование анализа эмоций на различных примерах"""
    
    # Создаем анализатор
    analyzer = EmotionAnalyzer()
    
    # Тестовые фразы
    test_cases = [
        # Русские фразы
        ("Это отличная новость! Я очень рад за вас!", "ru", "positivity"),
        ("Меня это очень раздражает! Сколько можно это терпеть?!", "ru", "aggression"),
        ("Я не успеваю закончить к дедлайну, у меня паника!", "ru", "stress"),
        ("Да, конечно, отличная идея... 🙄", "ru", "sarcasm"),
        ("Нормально, работаем дальше.", "ru", "neutral"),
        
        # Английские фразы
        ("This is amazing news! I'm so happy for you!", "en", "positivity"),
        ("This is really annoying! How long can this go on?!", "en", "aggression"),
        ("I can't finish by the deadline, I'm panicking!", "en", "stress"),
        ("Yeah, sure, great idea... 🙄", "en", "sarcasm"),
        ("Okay, let's continue working.", "en", "neutral"),
    ]
    
    print("🧪 Тестирование моделей анализа эмоций\n")
    print("=" * 80)
    
    for i, (text, expected_lang, expected_emotion) in enumerate(test_cases, 1):
        print(f"\n📝 Тест {i}: {text}")
        print(f"🎯 Ожидаемый язык: {expected_lang}, эмоция: {expected_emotion}")
        
        try:
            result = analyzer.analyze_emotion(text)
            
            print(f"🔍 Результат:")
            print(f"   Язык: {result['detected_language']}")
            print(f"   Эмоция: {result['emotion']} (уверенность: {result['confidence']:.1f}%)")
            print(f"   Исходная эмоция: {result['raw_emotion']}")
            print(f"   Модель: {result['model_used']}")
            print(f"   Категории:")
            for category, score in result['categories'].items():
                print(f"     {category}: {score:.1f}%")
            
            # Проверяем правильность
            lang_correct = "✅" if result['detected_language'] == expected_lang else "❌"
            emotion_correct = "✅" if result['emotion'] == expected_emotion else "❌"
            
            print(f"   Язык: {lang_correct} | Эмоция: {emotion_correct}")
            
        except Exception as e:
            print(f"❌ Ошибка: {e}")
        
        print("-" * 80)
    
    print("\n🎉 Тестирование завершено!")

if __name__ == "__main__":
    test_emotions()
