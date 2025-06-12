interface TranscriptionResponse {
  text: string
  confidence: number
}

export async function transcribeVoice(audioUrl: string): Promise<string> {
  try {
    // Скачиваем аудио файл
    const audioResponse = await fetch(audioUrl)
    const audioBuffer = await audioResponse.arrayBuffer()

    // Используем Whisper API от OpenAI (бесплатная альтернativa - Hugging Face)
    const transcriptionResponse = await fetch("https://api-inference.huggingface.co/models/openai/whisper-large-v3", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/octet-stream",
      },
      body: audioBuffer,
    })

    if (!transcriptionResponse.ok) {
      throw new Error(`Transcription failed: ${transcriptionResponse.statusText}`)
    }

    const result = await transcriptionResponse.json()

    // Hugging Face Whisper возвращает объект с текстом
    if (result.text) {
      return result.text.trim()
    }

    // Fallback на локальную обработку если API недоступен
    return await fallbackTranscription(audioBuffer)
  } catch (error) {
    console.error("Voice transcription error:", error)

    // Возвращаем заглушку для продолжения анализа
    return "[Голосовое сообщение - транскрипция недоступна]"
  }
}

async function fallbackTranscription(audioBuffer: ArrayBuffer): Promise<string> {
  try {
    // Альтернативный API для транскрипции (например, AssemblyAI)
    const response = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_data: Buffer.from(audioBuffer).toString("base64"),
        language_code: "ru", // Поддержка русского языка
      }),
    })

    const result = await response.json()
    return result.text || "[Не удалось распознать речь]"
  } catch (error) {
    console.error("Fallback transcription failed:", error)
    return "[Голосовое сообщение]"
  }
}

// Функция для определения языка аудио
export async function detectAudioLanguage(audioUrl: string): Promise<string> {
  try {
    const audioResponse = await fetch(audioUrl)
    const audioBuffer = await audioResponse.arrayBuffer()

    // Используем модель для определения языка
    const response = await fetch("https://api-inference.huggingface.co/models/facebook/wav2vec2-xlsr-53-espeak-cv-ft", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/octet-stream",
      },
      body: audioBuffer,
    })

    const result = await response.json()
    return result.language || "ru"
  } catch (error) {
    console.error("Language detection failed:", error)
    return "ru" // По умолчанию русский
  }
}

// Анализ эмоций в голосе (тон, интонация)
export async function analyzeVoiceEmotion(audioUrl: string): Promise<{
  emotion: string
  confidence: number
  arousal: number // Возбуждение
  valence: number // Валентность (позитив/негатив)
}> {
  try {
    const audioResponse = await fetch(audioUrl)
    const audioBuffer = await audioResponse.arrayBuffer()

    // Используем модель для анализа эмоций в речи
    const response = await fetch(
      "https://api-inference.huggingface.co/models/ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/octet-stream",
        },
        body: audioBuffer,
      },
    )

    const result = await response.json()

    if (result && result.length > 0) {
      const topEmotion = result[0]
      return {
        emotion: topEmotion.label,
        confidence: topEmotion.score,
        arousal: calculateArousal(topEmotion.label),
        valence: calculateValence(topEmotion.label),
      }
    }

    return {
      emotion: "neutral",
      confidence: 0.5,
      arousal: 0.5,
      valence: 0.5,
    }
  } catch (error) {
    console.error("Voice emotion analysis failed:", error)
    return {
      emotion: "unknown",
      confidence: 0,
      arousal: 0.5,
      valence: 0.5,
    }
  }
}

function calculateArousal(emotion: string): number {
  const arousalMap: Record<string, number> = {
    angry: 0.9,
    fear: 0.8,
    happy: 0.7,
    sad: 0.3,
    surprise: 0.8,
    disgust: 0.6,
    neutral: 0.5,
  }
  return arousalMap[emotion.toLowerCase()] || 0.5
}

function calculateValence(emotion: string): number {
  const valenceMap: Record<string, number> = {
    angry: 0.2,
    fear: 0.1,
    happy: 0.9,
    sad: 0.1,
    surprise: 0.6,
    disgust: 0.2,
    neutral: 0.5,
  }
  return valenceMap[emotion.toLowerCase()] || 0.5
}
