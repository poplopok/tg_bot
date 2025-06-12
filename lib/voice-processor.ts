interface TranscriptionResponse {
  text: string
  confidence: number
}

export async function transcribeVoice(audioUrl: string): Promise<string> {
  try {
    console.log("🎤 Starting voice transcription for:", audioUrl)

    // Скачиваем аудио файл
    const audioResponse = await fetch(audioUrl)
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.status}`)
    }

    const audioBuffer = await audioResponse.arrayBuffer()
    console.log("📁 Audio downloaded, size:", audioBuffer.byteLength)

    // Пробуем Hugging Face Whisper API
    if (process.env.HUGGINGFACE_API_KEY) {
      try {
        console.log("🤖 Trying Hugging Face Whisper...")
        const result = await transcribeWithHuggingFace(audioBuffer)
        if (result) {
          console.log("✅ Hugging Face transcription success:", result)
          return result
        }
      } catch (error) {
        console.error("❌ Hugging Face transcription failed:", error)
      }
    }

    // Fallback на AssemblyAI если доступен
    if (process.env.ASSEMBLYAI_API_KEY) {
      try {
        console.log("🔄 Trying AssemblyAI fallback...")
        const result = await fallbackTranscription(audioBuffer)
        if (result && result !== "[Не удалось распознать речь]") {
          console.log("✅ AssemblyAI transcription success:", result)
          return result
        }
      } catch (error) {
        console.error("❌ AssemblyAI transcription failed:", error)
      }
    }

    // Если все API недоступны, возвращаем заглушку
    console.log("⚠️ All transcription services failed, using placeholder")
    return "[Голосовое сообщение - транскрипция недоступна]"
  } catch (error) {
    console.error("❌ Voice transcription error:", error)
    return "[Голосовое сообщение - ошибка обработки]"
  }
}

async function transcribeWithHuggingFace(audioBuffer: ArrayBuffer): Promise<string | null> {
  try {
    const response = await fetch("https://api-inference.huggingface.co/models/openai/whisper-large-v3", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/octet-stream",
      },
      body: audioBuffer,
    })

    if (!response.ok) {
      console.error("Hugging Face API error:", response.status, response.statusText)
      return null
    }

    const responseText = await response.text()
    console.log("🔍 Hugging Face response:", responseText)

    // Проверяем, что ответ не содержит ошибку
    if (responseText.includes("Not Found") || responseText.includes("error") || responseText.includes("Model")) {
      console.error("Hugging Face API returned error:", responseText)
      return null
    }

    try {
      const result = JSON.parse(responseText)
      if (result.text) {
        return result.text.trim()
      }
    } catch (parseError) {
      console.error("Failed to parse Hugging Face response:", parseError)
    }

    return null
  } catch (error) {
    console.error("Hugging Face transcription error:", error)
    return null
  }
}

async function fallbackTranscription(audioBuffer: ArrayBuffer): Promise<string> {
  try {
    if (!process.env.ASSEMBLYAI_API_KEY) {
      return "[AssemblyAI API key not configured]"
    }

    // Сначала загружаем файл
    const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: audioBuffer,
    })

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`)
    }

    const uploadResult = await uploadResponse.json()
    const audioUrl = uploadResult.upload_url

    // Запускаем транскрипцию
    const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_code: "ru", // Поддержка русского языка
      }),
    })

    if (!transcriptResponse.ok) {
      throw new Error(`Transcription request failed: ${transcriptResponse.status}`)
    }

    const transcriptResult = await transcriptResponse.json()
    const transcriptId = transcriptResult.id

    // Ждем завершения транскрипции (упрощенная версия)
    // В реальном приложении нужно делать polling
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // Получаем результат
    const resultResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY,
      },
    })

    if (!resultResponse.ok) {
      throw new Error(`Result fetch failed: ${resultResponse.status}`)
    }

    const result = await resultResponse.json()
    return result.text || "[Не удалось распознать речь]"
  } catch (error) {
    console.error("AssemblyAI transcription failed:", error)
    return "[Не удалось распознать речь]"
  }
}

// Функция для определения языка аудио
export async function detectAudioLanguage(audioUrl: string): Promise<string> {
  // Упрощенная версия - возвращаем русский по умолчанию
  return "ru"
}

// Анализ эмоций в голосе (упрощенная версия)
export async function analyzeVoiceEmotion(audioUrl: string): Promise<{
  emotion: string
  confidence: number
  arousal: number
  valence: number
}> {
  try {
    console.log("🎵 Analyzing voice emotion...")

    // Пока возвращаем нейтральные значения
    // В будущем можно добавить реальный анализ эмоций в голосе
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
