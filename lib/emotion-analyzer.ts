import { analyzeVoiceEmotion } from "./voice-processor"

interface EmotionResult {
  joy: number
  anger: number
  fear: number
  sadness: number
  surprise: number
  disgust: number
  neutral: number
  toxicity: number
  sentiment: "positive" | "negative" | "neutral"
  confidence: number
  voiceEmotion?: {
    emotion: string
    confidence: number
    arousal: number
    valence: number
  }
}

export async function analyzeEmotion(text: string, audioUrl?: string): Promise<EmotionResult> {
  try {
    // Анализ текста
    const textEmotions = await analyzeTextEmotion(text)

    // Анализ голоса (если есть аудио)
    let voiceEmotion = undefined
    if (audioUrl) {
      voiceEmotion = await analyzeVoiceEmotion(audioUrl)
    }

    // Комбинируем результаты текста и голоса
    const combinedResult = combineEmotionResults(textEmotions, voiceEmotion)

    return {
      ...combinedResult,
      voiceEmotion,
    }
  } catch (error) {
    console.error("Emotion analysis error:", error)
    return getDefaultEmotions()
  }
}

async function analyzeTextEmotion(text: string): Promise<EmotionResult> {
  // Предобработка текста
  const cleanText = preprocessText(text)

  if (!cleanText.trim()) {
    return getDefaultEmotions()
  }

  try {
    // Анализ эмоций через Hugging Face
    const emotionResponse = await fetch(
      "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: cleanText }),
      },
    )

    // Анализ токсичности
    const toxicityResponse = await fetch("https://api-inference.huggingface.co/models/martin-ha/toxic-comment-model", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: cleanText }),
    })

    // Анализ тональности
    const sentimentResponse = await fetch(
      "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: cleanText }),
      },
    )

    const [emotionData, toxicityData, sentimentData] = await Promise.all([
      emotionResponse.json(),
      toxicityResponse.json(),
      sentimentResponse.json(),
    ])

    return processEmotionResults(emotionData, toxicityData, sentimentData)
  } catch (error) {
    console.error("API analysis failed, using fallback:", error)
    return await fallbackAnalysis(cleanText)
  }
}

function combineEmotionResults(textEmotions: EmotionResult, voiceEmotion?: any): EmotionResult {
  if (!voiceEmotion) {
    return textEmotions
  }

  // Весовые коэффициенты для комбинирования
  const textWeight = 0.6
  const voiceWeight = 0.4

  // Комбинируем эмоции с учетом весов
  const combinedEmotions = {
    joy: textEmotions.joy * textWeight + (voiceEmotion.emotion === "happy" ? voiceEmotion.confidence * voiceWeight : 0),
    anger:
      textEmotions.anger * textWeight + (voiceEmotion.emotion === "angry" ? voiceEmotion.confidence * voiceWeight : 0),
    fear:
      textEmotions.fear * textWeight + (voiceEmotion.emotion === "fear" ? voiceEmotion.confidence * voiceWeight : 0),
    sadness:
      textEmotions.sadness * textWeight + (voiceEmotion.emotion === "sad" ? voiceEmotion.confidence * voiceWeight : 0),
    surprise:
      textEmotions.surprise * textWeight +
      (voiceEmotion.emotion === "surprise" ? voiceEmotion.confidence * voiceWeight : 0),
    disgust:
      textEmotions.disgust * textWeight +
      (voiceEmotion.emotion === "disgust" ? voiceEmotion.confidence * voiceWeight : 0),
    neutral:
      textEmotions.neutral * textWeight +
      (voiceEmotion.emotion === "neutral" ? voiceEmotion.confidence * voiceWeight : 0),
  }

  // Нормализуем значения
  const total = Object.values(combinedEmotions).reduce((sum, val) => sum + val, 0)
  if (total > 0) {
    Object.keys(combinedEmotions).forEach((key) => {
      combinedEmotions[key as keyof typeof combinedEmotions] /= total
    })
  }

  return {
    ...combinedEmotions,
    toxicity: textEmotions.toxicity, // Токсичность только из текста
    sentiment: determineSentiment(combinedEmotions),
    confidence: Math.max(textEmotions.confidence, voiceEmotion.confidence),
  }
}

function determineSentiment(emotions: any): "positive" | "negative" | "neutral" {
  const positive = emotions.joy + emotions.surprise
  const negative = emotions.anger + emotions.fear + emotions.sadness + emotions.disgust

  if (positive > negative + 0.1) return "positive"
  if (negative > positive + 0.1) return "negative"
  return "neutral"
}

function preprocessText(text: string): string {
  // Удаляем лишние пробелы и символы
  let cleaned = text.trim().replace(/\s+/g, " ")

  // Обрабатываем эмодзи
  cleaned = processEmojis(cleaned)

  // Исправляем распространенные опечатки
  cleaned = fixCommonTypos(cleaned)

  return cleaned
}

function processEmojis(text: string): string {
  const emojiMap: Record<string, string> = {
    "😡": " angry ",
    "😠": " angry ",
    "😤": " frustrated ",
    "😢": " sad ",
    "😭": " very sad ",
    "😂": " very happy ",
    "😊": " happy ",
    "😍": " love ",
    "🤔": " thinking ",
    "😬": " awkward ",
    "🙄": " sarcastic ",
    "😱": " shocked ",
    "😨": " scared ",
    "🤬": " very angry ",
    "😴": " tired ",
    "🤯": " mind blown ",
  }

  let processed = text
  Object.entries(emojiMap).forEach(([emoji, meaning]) => {
    processed = processed.replace(new RegExp(emoji, "g"), meaning)
  })

  return processed
}

function fixCommonTypos(text: string): string {
  const typoMap: Record<string, string> = {
    превет: "привет",
    спасиба: "спасибо",
    харашо: "хорошо",
    сдлеать: "сделать",
    работет: "работает",
  }

  let fixed = text
  Object.entries(typoMap).forEach(([typo, correct]) => {
    fixed = fixed.replace(new RegExp(`\\b${typo}\\b`, "gi"), correct)
  })

  return fixed
}

async function fallbackAnalysis(text: string): Promise<EmotionResult> {
  // Простой rule-based анализ как fallback
  const lowerText = text.toLowerCase()

  let anger = 0
  let joy = 0
  let sadness = 0
  let fear = 0

  // Ключевые слова для эмоций
  const angerWords = ["злой", "бесит", "достал", "ненавижу", "дурак", "идиот"]
  const joyWords = ["отлично", "супер", "класс", "круто", "молодец", "ура"]
  const sadWords = ["грустно", "печально", "расстроен", "плохо", "ужасно"]
  const fearWords = ["боюсь", "страшно", "волнуюсь", "переживаю"]

  angerWords.forEach((word) => {
    if (lowerText.includes(word)) anger += 0.3
  })

  joyWords.forEach((word) => {
    if (lowerText.includes(word)) joy += 0.3
  })

  sadWords.forEach((word) => {
    if (lowerText.includes(word)) sadness += 0.3
  })

  fearWords.forEach((word) => {
    if (lowerText.includes(word)) fear += 0.3
  })

  // Нормализация
  const total = anger + joy + sadness + fear
  const neutral = Math.max(0, 1 - total)

  return {
    joy: Math.min(joy, 1),
    anger: Math.min(anger, 1),
    fear: Math.min(fear, 1),
    sadness: Math.min(sadness, 1),
    surprise: 0,
    disgust: 0,
    neutral,
    toxicity: anger > 0.5 ? 0.7 : 0.2,
    sentiment: joy > anger + sadness ? "positive" : anger > joy ? "negative" : "neutral",
    confidence: 0.6,
  }
}

function processEmotionResults(emotionData: any, toxicityData: any, sentimentData: any): EmotionResult {
  const emotions = {
    joy: 0,
    anger: 0,
    fear: 0,
    sadness: 0,
    surprise: 0,
    disgust: 0,
    neutral: 0,
  }

  // Обрабатываем результаты эмоций
  if (Array.isArray(emotionData) && emotionData.length > 0) {
    emotionData[0].forEach((item: any) => {
      const label = item.label.toLowerCase()
      if (label in emotions) {
        emotions[label as keyof typeof emotions] = item.score
      }
    })
  }

  // Обрабатываем токсичность
  let toxicity = 0
  if (Array.isArray(toxicityData) && toxicityData.length > 0) {
    const toxicItem = toxicityData[0].find((item: any) => item.label === "TOXIC")
    toxicity = toxicItem ? toxicItem.score : 0
  }

  // Обрабатываем тональность
  let sentiment: "positive" | "negative" | "neutral" = "neutral"
  if (Array.isArray(sentimentData) && sentimentData.length > 0) {
    const topSentiment = sentimentData[0][0]
    if (topSentiment.label.includes("POSITIVE")) sentiment = "positive"
    else if (topSentiment.label.includes("NEGATIVE")) sentiment = "negative"
  }

  return {
    ...emotions,
    toxicity,
    sentiment,
    confidence: 0.8,
  }
}

function getDefaultEmotions(): EmotionResult {
  return {
    joy: 0,
    anger: 0,
    fear: 0,
    sadness: 0,
    surprise: 0,
    disgust: 0,
    neutral: 1,
    toxicity: 0,
    sentiment: "neutral",
    confidence: 0,
  }
}
