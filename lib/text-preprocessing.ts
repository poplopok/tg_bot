export function preprocessText(text: string): string {
  // Словарь замен для сленга и сокращений
  const slangMap: { [key: string]: string } = {
    спс: "спасибо",
    пжлст: "пожалуйста",
    норм: "нормально",
    кст: "кстати",
    ваще: "вообще",
    оч: "очень",
    мб: "может быть",
    хз: "не знаю",
    лол: "смешно",
    кек: "смешно",
    кул: "круто",
    топ: "отлично",
    имхо: "по моему мнению",
    афк: "отошел",
    бро: "брат",
    сис: "сестра",
    др: "день рождения",
    дз: "домашнее задание",
    универ: "университет",
    препод: "преподаватель",
    домой: "домой",
    работа: "работа",
  }

  // Замена сленга
  let processedText = text.toLowerCase()
  Object.entries(slangMap).forEach(([slang, normal]) => {
    const regex = new RegExp(`\\b${slang}\\b`, "gi")
    processedText = processedText.replace(regex, normal)
  })

  // Исправление частых опечаток
  const typoMap: { [key: string]: string } = {
    превет: "привет",
    спосибо: "спасибо",
    харашо: "хорошо",
    плахо: "плохо",
    сдесь: "здесь",
    щас: "сейчас",
    чё: "что",
    када: "когда",
    токо: "только",
    тока: "только",
    ниче: "ничего",
    канеш: "конечно",
    прост: "просто",
  }

  Object.entries(typoMap).forEach(([typo, correct]) => {
    const regex = new RegExp(`\\b${typo}\\b`, "gi")
    processedText = processedText.replace(regex, correct)
  })

  // Обработка повторяющихся символов (ааааа -> а, оооо -> о)
  processedText = processedText.replace(/(.)\1{2,}/g, "$1$1")

  // Удаление лишних пробелов
  processedText = processedText.replace(/\s+/g, " ").trim()

  return processedText
}

export function enhanceWithContext(text: string, previousMessages: string[] = []): string {
  // Анализ контекста для лучшего понимания эмоций
  const contextKeywords = previousMessages.join(" ").toLowerCase()

  if (contextKeywords.includes("шутка") || contextKeywords.includes("прикол") || contextKeywords.includes("смех")) {
    return `[КОНТЕКСТ: юмор] ${text}`
  }

  if (contextKeywords.includes("проблема") || contextKeywords.includes("беда") || contextKeywords.includes("плохо")) {
    return `[КОНТЕКСТ: проблема] ${text}`
  }

  if (contextKeywords.includes("работа") || contextKeywords.includes("учеба") || contextKeywords.includes("дела")) {
    return `[КОНТЕКСТ: дела] ${text}`
  }

  return text
}

export function detectEmotionalIntensity(text: string): "low" | "medium" | "high" {
  const intensityMarkers = {
    high: ["!!!", "???", "очень", "супер", "ужасно", "кошмар", "восторг", "обожаю", "ненавижу"],
    medium: ["!", "?", "довольно", "весьма", "прилично", "неплохо"],
    low: [".", "нормально", "ладно", "окей"],
  }

  const lowerText = text.toLowerCase()

  for (const marker of intensityMarkers.high) {
    if (lowerText.includes(marker)) return "high"
  }

  for (const marker of intensityMarkers.medium) {
    if (lowerText.includes(marker)) return "medium"
  }

  return "low"
}
