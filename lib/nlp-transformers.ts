// Интерфейс для работы с Python transformers скриптом
import { spawn } from "child_process"
import path from "path"

interface TransformersResult {
  success: boolean
  results?: Array<{
    label: string
    score: number
  }>
  dominant_emotion?: string
  confidence?: number
  error?: string
}

// Функция для анализа эмоций через Python transformers
export async function analyzeEmotionsTransformers(text: string): Promise<TransformersResult> {
  return new Promise((resolve) => {
    console.log(`[TRANSFORMERS] Анализируем через Python: "${text}"`)

    const scriptPath = path.join(process.cwd(), "scripts", "emotion_analysis_transformers.py")
    const pythonProcess = spawn("python", [scriptPath, text])

    let output = ""
    let errorOutput = ""

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString()
    })

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString()
    })

    pythonProcess.on("close", (code) => {
      console.log(`[TRANSFORMERS] Python процесс завершен с кодом: ${code}`)

      if (code === 0 && output.trim()) {
        try {
          const result = JSON.parse(output.trim())
          console.log(`[TRANSFORMERS] Результат:`, result)
          resolve(result)
        } catch (parseError) {
          console.error(`[TRANSFORMERS] Ошибка парсинга JSON:`, parseError)
          console.error(`[TRANSFORMERS] Вывод:`, output)
          resolve({
            success: false,
            error: `JSON parse error: ${parseError}`,
          })
        }
      } else {
        console.error(`[TRANSFORMERS] Ошибка выполнения:`, errorOutput)
        resolve({
          success: false,
          error: `Python script error: ${errorOutput || "Unknown error"}`,
        })
      }
    })

    // Таймаут на случай зависания
    setTimeout(() => {
      pythonProcess.kill()
      resolve({
        success: false,
        error: "Timeout: Python script took too long",
      })
    }, 30000) // 30 секунд
  })
}

// Функция для тестирования transformers модели
export async function testTransformersModel(): Promise<string> {
  return new Promise((resolve) => {
    console.log(`[TRANSFORMERS TEST] Запускаем тестирование модели`)

    const scriptPath = path.join(process.cwd(), "scripts", "emotion_analysis_transformers.py")
    const pythonProcess = spawn("python", [scriptPath, "test"])

    let output = ""
    let errorOutput = ""

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString()
    })

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString()
    })

    pythonProcess.on("close", (code) => {
      const result = code === 0 ? output : `Error: ${errorOutput}`
      console.log(`[TRANSFORMERS TEST] Результат тестирования:`, result)
      resolve(result)
    })

    // Таймаут
    setTimeout(() => {
      pythonProcess.kill()
      resolve("Timeout: Test took too long")
    }, 60000) // 60 секунд для тестирования
  })
}
