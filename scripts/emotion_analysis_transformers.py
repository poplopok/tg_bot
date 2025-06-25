"""
Анализ эмоций с использованием transformers библиотеки напрямую
Использует модель Osiris/emotion_classifier
"""

import sys
import json
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np

# Глобальные переменные для модели
tokenizer = None
model = None

def load_model():
    """Загрузка модели Osiris/emotion_classifier"""
    global tokenizer, model
    
    try:
        print("🔄 Загружаем модель Osiris/emotion_classifier...")
        
        # Load model directly
        tokenizer = AutoTokenizer.from_pretrained("Osiris/emotion_classifier")
        model = AutoModelForSequenceClassification.from_pretrained("Osiris/emotion_classifier")
        
        print("✅ Модель успешно загружена!")
        print(f"📊 Количество классов: {model.config.num_labels}")
        print(f"🏷️ Метки классов: {model.config.id2label}")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка загрузки модели: {e}")
        return False

def analyze_emotion(text):
    """Анализ эмоций в тексте"""
    global tokenizer, model
    
    if tokenizer is None or model is None:
        if not load_model():
            return None
    
    try:
        print(f"🔍 Анализируем текст: '{text}'")
        
        # Токенизация
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
        
        # Предсказание
        with torch.no_grad():
            outputs = model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
        
        # Получаем результаты
        scores = predictions[0].numpy()
        labels = [model.config.id2label[i] for i in range(len(scores))]
        
        # Создаем результат в формате как у Hugging Face API
        results = []
        for label, score in zip(labels, scores):
            results.append({
                "label": label,
                "score": float(score)
            })
        
        # Сортируем по убыванию вероятности
        results.sort(key=lambda x: x["score"], reverse=True)
        
        print("📊 Результаты анализа:")
        for result in results:
            print(f"   {result['label']}: {result['score']:.4f} ({result['score']*100:.1f}%)")
        
        return results
        
    except Exception as e:
        print(f"❌ Ошибка анализа: {e}")
        return None

def test_model():
    """Тестирование модели на разных фразах"""
    test_phrases = [
        "I am very happy today!",
        "This makes me so angry!",
        "I feel sad and lonely",
        "What a surprise!",
        "I'm scared of this situation",
        "This is disgusting",
        "I love this so much",
        "ты дурак",
        "спасибо большое",
        "мне грустно",
        "какой ужас",
        "отлично работает"
    ]
    
    print("🧪 Тестируем модель на разных фразах:")
    print("=" * 60)
    
    for phrase in test_phrases:
        print(f"\n📝 Фраза: '{phrase}'")
        results = analyze_emotion(phrase)
        
        if results:
            top_emotion = results[0]
            print(f"🎯 Доминирующая эмоция: {top_emotion['label']} ({top_emotion['score']*100:.1f}%)")
        else:
            print("❌ Не удалось проанализировать")
        
        print("-" * 40)

def analyze_single_text(text):
    """Анализ одного текста (для вызова из Node.js)"""
    results = analyze_emotion(text)
    if results:
        return {
            "success": True,
            "results": results,
            "dominant_emotion": results[0]["label"],
            "confidence": results[0]["score"]
        }
    else:
        return {
            "success": False,
            "error": "Failed to analyze emotion"
        }

def main():
    """Основная функция"""
    print("🚀 Запуск анализатора эмоций с transformers")
    print("📦 Модель: Osiris/emotion_classifier")
    print("=" * 60)
    
    # Проверяем аргументы командной строки
    if len(sys.argv) > 1:
        if sys.argv[1] == "test":
            test_model()
        else:
            # Анализируем переданный текст
            text = " ".join(sys.argv[1:])
            result = analyze_single_text(text)
            print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        # Интерактивный режим
        if load_model():
            print("\n💬 Интерактивный режим. Введите текст для анализа (или 'exit' для выхода):")
            
            while True:
                try:
                    text = input("\n> ").strip()
                    if text.lower() in ['exit', 'quit', 'выход']:
                        break
                    if text:
                        analyze_emotion(text)
                except KeyboardInterrupt:
                    break
            
            print("\n👋 До свидания!")

if __name__ == "__main__":
    main()
