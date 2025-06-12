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
    console.log("🧠 Analyzing emotion for text:", text.substring(0, 100) + "...")

    // Анализ текста
    const textEmotions = await analyzeTextEmotion(text)

    // Анализ голоса (если есть аудио)
    let voiceEmotion = undefined
    if (audioUrl) {
      try {
        voiceEmotion = await analyzeVoiceEmotion(audioUrl)
      } catch (error) {
        console.error("Voice emotion analysis failed:", error)
      }
    }

    // Комбинируем результаты текста и голоса
    const combinedResult = combineEmotionResults(textEmotions, voiceEmotion)

    console.log("✅ Emotion analysis completed:", {
      sentiment: combinedResult.sentiment,
      toxicity: combinedResult.toxicity,
      confidence: combinedResult.confidence,
    })

    return {
      ...combinedResult,
      voiceEmotion,
    }
  } catch (error) {
    console.error("❌ Emotion analysis error:", error)
    return getDefaultEmotions()
  }
}

async function analyzeTextEmotion(text: string): Promise<EmotionResult> {
  // Предобработка текста
  const cleanText = preprocessText(text)

  if (!cleanText.trim()) {
    return getDefaultEmotions()
  }

  console.log("🔍 Analyzing preprocessed text:", cleanText)

  // Сначала пробуем rule-based анализ
  const fallbackResult = await fallbackAnalysis(cleanText)

  // Если есть Hugging Face API ключ, пробуем использовать API
  if (process.env.HUGGINGFACE_API_KEY) {
    try {
      console.log("🤖 Trying Hugging Face API...")

      const apiResult = await analyzeWithHuggingFace(cleanText)
      if (apiResult) {
        console.log("✅ Hugging Face API success")
        return apiResult
      }
    } catch (error) {
      console.error("❌ Hugging Face API failed:", error)
    }
  }

  console.log("⚠️ Using fallback analysis")
  return fallbackResult
}

async function analyzeWithHuggingFace(text: string): Promise<EmotionResult | null> {
  try {
    // Используем более простые и надежные модели
    const requests = [
      // Анализ тональности
      fetch("https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }),

      // Анализ токсичности
      fetch("https://api-inference.huggingface.co/models/unitary/toxic-bert", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }),
    ]

    const responses = await Promise.allSettled(requests)

    let sentimentData = null
    let toxicityData = null

    // Обрабатываем ответ тональности
    if (responses[0].status === "fulfilled") {
      try {
        const sentimentText = await responses[0].value.text()
        console.log("📊 Sentiment API response:", sentimentText)

        if (sentimentText && !sentimentText.includes("Not Found") && !sentimentText.includes("error")) {
          sentimentData = JSON.parse(sentimentText)
        }
      } catch (error) {
        console.error("Failed to parse sentiment response:", error)
      }
    }

    // Обрабатываем ответ токсичности
    if (responses[1].status === "fulfilled") {
      try {
        const toxicityText = await responses[1].value.text()
        console.log("🔍 Toxicity API response:", toxicityText)

        if (toxicityText && !toxicityText.includes("Not Found") && !toxicityText.includes("error")) {
          toxicityData = JSON.parse(toxicityText)
        }
      } catch (error) {
        console.error("Failed to parse toxicity response:", error)
      }
    }

    // Если хотя бы один API сработал, используем результаты
    if (sentimentData || toxicityData) {
      return processApiResults(sentimentData, toxicityData, text)
    }

    return null
  } catch (error) {
    console.error("❌ Hugging Face API error:", error)
    return null
  }
}

function processApiResults(sentimentData: any, toxicityData: any, text: string): EmotionResult {
  let sentiment: "positive" | "negative" | "neutral" = "neutral"
  let toxicity = 0
  let confidence = 0.5

  // Обрабатываем тональность
  if (sentimentData && Array.isArray(sentimentData) && sentimentData.length > 0) {
    const topSentiment = sentimentData[0]
    if (topSentiment.label) {
      if (topSentiment.label.toLowerCase().includes("positive")) {
        sentiment = "positive"
      } else if (topSentiment.label.toLowerCase().includes("negative")) {
        sentiment = "negative"
      }
      confidence = Math.max(confidence, topSentiment.score || 0.5)
    }
  }

  // Обрабатываем токсичность
  if (toxicityData && Array.isArray(toxicityData) && toxicityData.length > 0) {
    const toxicItem = toxicityData.find((item: any) => item.label && item.label.toLowerCase().includes("toxic"))
    if (toxicItem) {
      toxicity = toxicItem.score || 0
    }
  }

  // Генерируем эмоции на основе тональности
  const emotions = generateEmotionsFromSentiment(sentiment, text)

  return {
    ...emotions,
    toxicity,
    sentiment,
    confidence,
  }
}

function generateEmotionsFromSentiment(sentiment: string, text: string) {
  const lowerText = text.toLowerCase()

  // Базовые значения
  let joy = 0.1
  let anger = 0.1
  let sadness = 0.1
  let fear = 0.1
  let surprise = 0.1
  let disgust = 0.1
  let neutral = 0.5

  // Корректируем на основе тональности
  if (sentiment === "positive") {
    joy = 0.6
    neutral = 0.3
  } else if (sentiment === "negative") {
    if (lowerText.includes("злой") || lowerText.includes("бесит") || lowerText.includes("ненавижу")) {
      anger = 0.5
    } else if (lowerText.includes("грустно") || lowerText.includes("печально")) {
      sadness = 0.5
    } else if (lowerText.includes("боюсь") || lowerText.includes("страшно")) {
      fear = 0.5
    } else {
      anger = 0.3
      sadness = 0.2
    }
    neutral = 0.2
  }

  // Нормализация
  const total = joy + anger + sadness + fear + surprise + disgust + neutral
  if (total > 0) {
    joy /= total
    anger /= total
    sadness /= total
    fear /= total
    surprise /= total
    disgust /= total
    neutral /= total
  }

  return { joy, anger, sadness, fear, surprise, disgust, neutral }
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
  console.log("🔄 Using rule-based fallback analysis")

  // Простой rule-based анализ как fallback
  const lowerText = text.toLowerCase()

  let anger = 0
  let joy = 0
  let sadness = 0
  let fear = 0
  let toxicity = 0

  // Ключевые слова для эмоций
  const angerWords = ["злой", "бесит", "достал", "ненавижу", "дурак", "идиот", "сволочь", "урод", "тупой"]
  const joyWords = ["отлично", "супер", "класс", "круто", "молодец", "ура", "здорово", "прекрасно", "замечательно"]
  const sadWords = ["грустно", "печально", "расстроен", "плохо", "ужасно", "депрессия", "тоска"]
  const fearWords = ["боюсь", "страшно", "волнуюсь", "переживаю", "тревожно", "паника"]
  const toxicWords = ["дурак", "идиот", "сволочь", "урод", "тупой", "дебил", "кретин", "мудак"]

  // Подсчет совпадений
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

  toxicWords.forEach((word) => {
    if (lowerText.includes(word)) toxicity += 0.4
  })

  // Проверяем восклицательные знаки (могут указывать на эмоциональность)
  const exclamationCount = (text.match(/!/g) || []).length
  if (exclamationCount > 0) {
    anger += exclamationCount * 0.1
    joy += exclamationCount * 0.1
  }

  // Проверяем капс (может указывать на крик/гнев)
  const capsRatio = (text.match(/[A-ZА-Я]/g) || []).length / text.length
  if (capsRatio > 0.3) {
    anger += 0.2
    toxicity += 0.2
  }

  // Нормализация
  const total = anger + joy + sadness + fear
  const neutral = Math.max(0, 1 - total)

  // Определяем тональность
  let sentiment: "positive" | "negative" | "neutral" = "neutral"
  if (joy > anger + sadness + fear) sentiment = "positive"
  else if (anger + sadness + fear > joy) sentiment = "negative"

  return {
    joy: Math.min(joy, 1),
    anger: Math.min(anger, 1),
    fear: Math.min(fear, 1),
    sadness: Math.min(sadness, 1),
    surprise: 0,
    disgust: 0,
    neutral: Math.max(neutral, 0),
    toxicity: Math.min(toxicity, 1),
    sentiment,
    confidence: 0.7, // Средняя уверенность для rule-based анализа
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
