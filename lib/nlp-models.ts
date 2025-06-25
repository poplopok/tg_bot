// Интерфейсы для типизации
interface NLPResult {
  originalText: string
  correctedText: string
  normalizedText: string
  detectedLanguage: string
  slangDetected: string[]
  errorsFixed: string[]
  sentiment: {
    emotion: string
    confidence: number
    categories: {
      aggression: number
      stress: number
      sarcasm: number
      toxicity: number
      positivity: number
    }
  }
  modelUsed: string[]
}

// Огромная база данных сленга и исправлений
const SLANG_DATABASE = {
  // IT сленг
  it: {
    ботать: "работать",
    кодить: "программировать",
    пушить: "отправлять",
    пулить: "получать",
    мерджить: "объединять",
    коммитить: "сохранять",
    деплоить: "развертывать",
    билдить: "собирать",
    тестить: "тестировать",
    дебажить: "отлаживать",
    рефакторить: "переписывать",
    ревьюить: "проверять",
    апрувить: "одобрять",
    реджектить: "отклонять",
    фиксить: "исправлять",
    брейкать: "ломать",
    крашить: "падать",
    лагать: "тормозить",
    фризить: "зависать",
    глючить: "работать неправильно",
    багованный: "с ошибками",
    стейджинг: "тестовая среда",
    продакшн: "рабочая среда",
    девелопмент: "разработка",
    фронтенд: "клиентская часть",
    бэкенд: "серверная часть",
    фулстек: "полный стек",
    джуниор: "младший разработчик",
    мидл: "средний разработчик",
    сеньор: "старший разработчик",
    тимлид: "руководитель команды",
    скрам: "методология разработки",
    спринт: "итерация разработки",
    стендап: "ежедневная встреча",
    ретро: "ретроспектива",
    планинг: "планирование",
    гроуминг: "уточнение задач",
    бэклог: "список задач",
    таска: "задача",
    фича: "функция",
    багрепорт: "отчет об ошибке",
    хотфикс: "срочное исправление",
    релиз: "выпуск",
    версионинг: "управление версиями",
    докер: "контейнеризация",
    кубер: "оркестрация",
    микросервисы: "архитектура",
    монолит: "единое приложение",
    апи: "программный интерфейс",
    рест: "архитектурный стиль",
    "граф кью эл": "язык запросов",
    ноуд: "среда выполнения",
    реакт: "библиотека",
    вью: "фреймворк",
    ангуляр: "платформа",
    некст: "фреймворк",
    нукст: "фреймворк",
    тайпскрипт: "язык программирования",
    джаваскрипт: "язык программирования",
    питон: "язык программирования",
    джава: "язык программирования",
    "си шарп": "язык программирования",
    пхп: "язык программирования",
    руби: "язык программирования",
    го: "язык программирования",
    раст: "язык программирования",
    свифт: "язык программирования",
    котлин: "язык программирования",
  },

  // Общий сленг
  general: {
    норм: "нормально",
    окей: "хорошо",
    ок: "хорошо",
    кул: "круто",
    супер: "отлично",
    топ: "отлично",
    огонь: "отлично",
    бомба: "отлично",
    кайф: "удовольствие",
    прикол: "интересно",
    жесть: "сильно",
    капец: "очень",
    пипец: "очень",
    ваще: "вообще",
    щас: "сейчас",
    чё: "что",
    чо: "что",
    шо: "что",
    када: "когда",
    токо: "только",
    тока: "только",
    "чуть чуть": "немного",
    чутка: "немного",
    малость: "немного",
    капельку: "немного",
    тип: "типа",
    типо: "типа",
    короче: "в общем",
    вобщем: "в общем",
    вообщем: "в общем",
    канеш: "конечно",
    канешн: "конечно",
    пон: "понятно",
    понял: "понятно",
    ясн: "ясно",
    збс: "здорово",
    имхо: "по моему мнению",
    кмк: "как мне кажется",
    афаик: "насколько я знаю",
    фуфло: "плохо",
    отстой: "плохо",
    лажа: "плохо",
    фигня: "плохо",
    херня: "плохо",
    дичь: "плохо",
    треш: "плохо",
    кринж: "неловко",
    стыдоба: "стыдно",
    позор: "стыдно",
    эпик: "эпично",
    легенда: "легендарно",
    мем: "шутка",
    лол: "смешно",
    кек: "смешно",
    ржу: "смеюсь",
    угар: "смешно",
    ржака: "смешно",
    прикольно: "интересно",
    забавно: "интересно",
    смешно: "забавно",
    весело: "радостно",
  },

  // Корпоративный сленг
  corporate: {
    митинг: "встреча",
    колл: "звонок",
    зум: "видеоконференция",
    скайп: "видеосвязь",
    слак: "мессенджер",
    телега: "телеграм",
    мейл: "электронная почта",
    емейл: "электронная почта",
    "гугл док": "документ",
    эксель: "таблица",
    ворд: "документ",
    презентация: "доклад",
    слайды: "презентация",
    дедлайн: "срок",
    дедлайны: "сроки",
    таймлайн: "временные рамки",
    роадмап: "план развития",
    майлстоун: "этап",
    кпи: "показатели эффективности",
    окр: "цели и ключевые результаты",
    квартал: "три месяца",
    репорт: "отчет",
    фидбек: "обратная связь",
    ревью: "обзор",
    апдейт: "обновление",
    статус: "состояние",
    прогресс: "продвижение",
    результат: "итог",
    аутком: "результат",
    импакт: "влияние",
    эффект: "воздействие",
    бенефит: "выгода",
    профит: "прибыль",
    лосс: "потеря",
    риск: "опасность",
    иссью: "проблема",
    челлендж: "вызов",
    оппортунити: "возможность",
    инсайт: "понимание",
    экшн: "действие",
    план: "план действий",
    стратегия: "стратегический план",
    тактика: "тактические действия",
    подход: "метод",
    методология: "система методов",
    процесс: "последовательность действий",
    процедура: "установленный порядок",
    алгоритм: "последовательность шагов",
    воркфлоу: "рабочий процесс",
    пайплайн: "конвейер",
    фреймворк: "структура",
    темплейт: "шаблон",
    паттерн: "образец",
    "бест практис": "лучшие практики",
    кейс: "случай",
    "юз кейс": "сценарий использования",
    стори: "пользовательская история",
    персона: "целевая аудитория",
    сегмент: "группа пользователей",
    таргет: "цель",
    аудитория: "целевая группа",
    кастомер: "клиент",
    юзер: "пользователь",
    стейкхолдер: "заинтересованная сторона",
    партнер: "деловой партнер",
    вендор: "поставщик",
    саплаер: "поставщик",
    контрактор: "подрядчик",
    фрилансер: "свободный работник",
    консультант: "советник",
    эксперт: "специалист",
    ментор: "наставник",
    коуч: "тренер",
    лидер: "руководитель",
    менеджер: "управляющий",
    директор: "руководитель",
    хед: "глава",
    вп: "вице-президент",
    сео: "генеральный директор",
    сто: "технический директор",
    сфо: "финансовый директор",
    смо: "маркетинговый директор",
    чро: "директор по персоналу",
  },

  // Эмоциональные выражения
  emotional: {
    бесит: "раздражает",
    достал: "надоел",
    задолбал: "надоел",
    заколебал: "надоел",
    замучил: "утомил",
    достало: "надоело",
    надоело: "утомило",
    устал: "утомился",
    выматывает: "утомляет",
    напрягает: "беспокоит",
    стрессует: "вызывает стресс",
    парит: "беспокоит",
    грузит: "давит",
    давит: "угнетает",
    душит: "угнетает",
    убивает: "расстраивает",
    добивает: "расстраивает",
    финиширует: "заканчивает",
    кончает: "заканчивает",
    "жесть какая": "очень сильно",
    "пипец как": "очень сильно",
    "капец как": "очень сильно",
    "ужас как": "очень сильно",
    "кошмар как": "очень сильно",
    "жуть как": "очень сильно",
    "страх как": "очень сильно",
    боюсь: "опасаюсь",
    страшно: "пугает",
    жутко: "пугает",
    ужасно: "очень плохо",
    кошмарно: "очень плохо",
    отвратительно: "очень плохо",
    мерзко: "неприятно",
    гадко: "неприятно",
    тошно: "неприятно",
    противно: "неприятно",
    воротит: "вызывает отвращение",
    "блевать хочется": "вызывает отвращение",
    тошнит: "вызывает тошноту",
    рвет: "вызывает рвоту",
    выворачивает: "вызывает отвращение",
    бомбит: "очень злит",
    взрывает: "очень злит",
    кипит: "злится",
    горит: "злится",
    пылает: "очень злится",
    пламенеет: "очень злится",
    вскипает: "злится",
    закипает: "начинает злиться",
    взбешен: "очень зол",
    "в ярости": "очень зол",
    "в бешенстве": "очень зол",
    "в гневе": "зол",
    разозлен: "зол",
    сердит: "недоволен",
    недоволен: "не удовлетворен",
    расстроен: "огорчен",
    огорчен: "печален",
    грустен: "печален",
    печален: "грустен",
    тоскует: "грустит",
    скучает: "тоскует",
    депрессует: "находится в депрессии",
    унывает: "грустит",
    хандрит: "грустит",
    меланхолирует: "грустит",
    радуется: "испытывает радость",
    веселится: "радуется",
    ликует: "очень радуется",
    торжествует: "празднует",
    празднует: "отмечает",
    счастлив: "испытывает счастье",
    доволен: "удовлетворен",
    удовлетворен: "доволен",
    восхищен: "восторгается",
    восторгается: "восхищается",
    "в восторге": "очень доволен",
    "в экстазе": "в восторге",
    "на седьмом небе": "очень счастлив",
    "на вершине блаженства": "очень счастлив",
    окрылен: "воодушевлен",
    воодушевлен: "вдохновлен",
    вдохновлен: "мотивирован",
    мотивирован: "заинтересован",
    заинтересован: "увлечен",
    увлечен: "заинтересован",
    заворожен: "очарован",
    очарован: "восхищается",
    покорен: "восхищается",
    пленен: "очарован",
    сражен: "поражен",
    поражен: "удивлен",
    удивлен: "изумлен",
    изумлен: "поражен",
    ошеломлен: "потрясен",
    потрясен: "шокирован",
    шокирован: "потрясен",
    ошарашен: "ошеломлен",
    обалдел: "ошеломлен",
    офигел: "ошеломлен",
    охренел: "ошеломлен",
    обомлел: "ошеломлен",
    остолбенел: "ошеломлен",
    окаменел: "ошеломлен",
    застыл: "замер",
    замер: "остановился",
    оцепенел: "застыл",
    онемел: "потерял дар речи",
    "лишился дара речи": "онемел",
    "потерял дар речи": "онемел",
  },

  // Ошибки и опечатки
  typos: {
    превет: "привет",
    спосибо: "спасибо",
    пожалуйста: "пожалуйста",
    извените: "извините",
    извенить: "извинить",
    сдесь: "здесь",
    здесь: "здесь",
    тут: "здесь",
    вчера: "вчера",
    сегодня: "сегодня",
    завтра: "завтра",
    послезавтра: "послезавтра",
    позавчера: "позавчера",
    недавно: "недавно",
    скоро: "скоро",
    потом: "потом",
    затем: "затем",
    после: "после",
    до: "до",
    перед: "перед",
    между: "между",
    среди: "среди",
    около: "около",
    рядом: "рядом",
    далеко: "далеко",
    близко: "близко",
    высоко: "высоко",
    низко: "низко",
    глубоко: "глубоко",
    мелко: "мелко",
    широко: "широко",
    узко: "узко",
    длинно: "длинно",
    коротко: "коротко",
    быстро: "быстро",
    медленно: "медленно",
    тихо: "тихо",
    громко: "громко",
    ясно: "ясно",
    темно: "темно",
    светло: "светло",
    ярко: "ярко",
    тускло: "тускло",
    четко: "четко",
    размыто: "размыто",
    резко: "резко",
    плавно: "плавно",
    гладко: "гладко",
    шершаво: "шершаво",
    мягко: "мягко",
    жестко: "жестко",
    твердо: "твердо",
    слабо: "слабо",
    сильно: "сильно",
    крепко: "крепко",
    слегка: "слегка",
    немного: "немного",
    много: "много",
    мало: "мало",
    достаточно: "достаточно",
    недостаточно: "недостаточно",
    слишком: "слишком",
    очень: "очень",
    весьма: "весьма",
    довольно: "довольно",
    вполне: "вполне",
    совсем: "совсем",
    совершенно: "совершенно",
    абсолютно: "абсолютно",
    полностью: "полностью",
    частично: "частично",
    наполовину: "наполовину",
    целиком: "целиком",
    полностью: "полностью",
  },
}

// Функция для исправления опечаток через Hugging Face
async function correctSpelling(text: string): Promise<{ corrected: string; errors: string[] }> {
  // Упрощенное исправление - только возвращаем оригинальный текст
  console.log(`[ОРФОГРАФИЯ] Пропускаем исправление орфографии`)
  return { corrected: text, errors: [] }
}

// Функция для нормализации сленга
function normalizeSlang(text: string): { normalized: string; slangDetected: string[] } {
  let normalized = text.toLowerCase()
  const slangDetected: string[] = []

  // Проходим по всем категориям сленга
  Object.entries(SLANG_DATABASE).forEach(([category, slangMap]) => {
    Object.entries(slangMap).forEach(([slang, normal]) => {
      const regex = new RegExp(`\\b${slang}\\b`, "gi")
      if (regex.test(normalized)) {
        slangDetected.push(`${slang} (${category})`)
        normalized = normalized.replace(regex, normal)
      }
    })
  })

  return { normalized, slangDetected }
}

// Функция для определения языка
async function detectLanguage(text: string): Promise<string> {
  // Простое определение языка по символам
  const cyrillicPattern = /[а-яё]/i
  const latinPattern = /[a-z]/i

  const cyrillicCount = (text.match(cyrillicPattern) || []).length
  const latinCount = (text.match(latinPattern) || []).length

  console.log(`[ЯЗЫК] Кириллица: ${cyrillicCount}, Латиница: ${latinCount}`)

  const detectedLang = cyrillicCount > latinCount ? "ru" : "en"
  console.log(`[ЯЗЫК] Определен язык: ${detectedLang}`)

  return detectedLang
}

// Функция для анализа эмоций через одну специализированную модель
async function analyzeEmotionsHuggingFace(text: string): Promise<NLPResult["sentiment"]> {
  try {
    // Используем только одну проверенную модель
    const model = "Osiris/emotion_classifier"

    console.log(`[ЭМОЦИИ] Используем модель: ${model}`)
    console.log(`[DEBUG] API Key присутствует: ${!!process.env.HUGGINGFACE_API_KEY}`)
    console.log(`[DEBUG] API Key длина: ${process.env.HUGGINGFACE_API_KEY?.length || 0}`)
    console.log(`[DEBUG] Отправляем запрос к модели: ${model}`)
    console.log(`[DEBUG] Текст для анализа: "${text}"`)

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        options: {
          wait_for_model: true,
          use_cache: false,
        },
      }),
    })

    if (!response.ok) {
      console.error(`[ЭМОЦИИ] Ошибка HTTP: ${response.status} ${response.statusText}`)
      console.error(`[ЭМОЦИИ] Заголовки ответа:`, Object.fromEntries(response.headers.entries()))
      const responseBody = await response.text()
      console.error(`[ЭМОЦИИ] Тело ответа:`, responseBody)
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log(`[DEBUG] Статус ответа: ${response.status}`)
    console.log(`[DEBUG] Заголовки ответа:`, Object.fromEntries(response.headers.entries()))
    console.log(`[DEBUG] Полный ответ от API:`, JSON.stringify(result, null, 2))
    console.log(`[DEBUG] Тип результата:`, typeof result)
    console.log(`[DEBUG] Является массивом:`, Array.isArray(result))

    if (result.error) {
      console.log(`[DEBUG] Ошибка в ответе API:`, result.error)
      throw new Error(`API вернул ошибку: ${result.error}`)
    }

    // Обрабатываем результат
    if (Array.isArray(result) && result.length > 0) {
      return processOsirisEmotionResults(result, text)
    } else {
      throw new Error("Неожиданный формат ответа от API")
    }
  } catch (error) {
    console.error("Ошибка Hugging Face анализа эмоций:", error)
    // Fallback на усиленный локальный анализ
    return await analyzeEmotionsLocal(text)
  }
}

// Функция для обработки результатов от модели Osiris/emotion_classifier
function processOsirisEmotionResults(results: any[], text: string): NLPResult["sentiment"] {
  console.log(`[DEBUG OSIRIS] Входные результаты:`, JSON.stringify(results, null, 2))
  console.log(`[DEBUG OSIRIS] Текст: "${text}"`)

  // Маппинг эмоций Osiris на наши категории
  const emotionMapping: Record<string, string> = {
    // Osiris emotion_classifier возвращает различные эмоции
    anger: "aggression",
    fear: "stress",
    joy: "positivity",
    love: "positivity",
    sadness: "stress",
    surprise: "neutral",
    neutral: "neutral",
    disgust: "aggression",
    shame: "stress",
    guilt: "stress",
    // Дополнительные возможные метки
    happy: "positivity",
    angry: "aggression",
    sad: "stress",
    excited: "positivity",
    calm: "neutral",
    frustrated: "aggression",
    worried: "stress",
    confident: "positivity",
  }

  const categories = {
    aggression: 0,
    stress: 0,
    sarcasm: 0,
    toxicity: 0,
    positivity: 0,
  }

  let dominantEmotion = "neutral"
  let maxConfidence = 0

  // Обрабатываем результаты
  results.forEach((emotion: any) => {
    const label = emotion.label?.toLowerCase() || ""
    const score = (emotion.score || 0) * 100

    console.log(`[DEBUG OSIRIS] Обрабатываем: ${label} = ${score.toFixed(1)}%`)

    // Обновляем максимальную уверенность
    if (score > maxConfidence) {
      maxConfidence = score
      dominantEmotion = emotionMapping[label] || "neutral"
    }

    // Распределяем по категориям
    const mappedCategory = emotionMapping[label]
    if (mappedCategory === "aggression") {
      categories.aggression = Math.max(categories.aggression, score)
    } else if (mappedCategory === "stress") {
      categories.stress = Math.max(categories.stress, score)
    } else if (mappedCategory === "positivity") {
      categories.positivity = Math.max(categories.positivity, score)
    }
  })

  // Дополнительный анализ для улучшения точности
  const additionalAnalysis = analyzeTextFeatures(text)

  // Объединяем результаты AI и локального анализа
  categories.aggression = Math.min(100, categories.aggression + additionalAnalysis.aggression)
  categories.stress = Math.min(100, categories.stress + additionalAnalysis.stress)
  categories.positivity = Math.min(100, categories.positivity + additionalAnalysis.positivity)
  categories.sarcasm = additionalAnalysis.sarcasm

  // Вычисляем токсичность
  categories.toxicity = Math.min(100, categories.aggression * 0.8 + categories.stress * 0.4)

  // Пересчитываем доминирующую эмоцию с учетом дополнительного анализа
  const finalScores = {
    aggression: categories.aggression,
    stress: categories.stress,
    positivity: categories.positivity,
    sarcasm: categories.sarcasm,
  }

  const maxCategory = Object.entries(finalScores).reduce((a, b) =>
    finalScores[a[0] as keyof typeof finalScores] > finalScores[b[0] as keyof typeof finalScores] ? a : b,
  )

  if (maxCategory[1] > maxConfidence) {
    dominantEmotion = maxCategory[0]
    maxConfidence = maxCategory[1]
  }

  console.log(`[DEBUG OSIRIS] Финальный результат:`, {
    emotion: dominantEmotion,
    confidence: maxConfidence,
    categories,
  })

  return {
    emotion: dominantEmotion,
    confidence: maxConfidence,
    categories,
  }
}

// Функция для дополнительного анализа текстовых особенностей
function analyzeTextFeatures(text: string): {
  aggression: number
  stress: number
  positivity: number
  sarcasm: number
} {
  const features = {
    aggression: 0,
    stress: 0,
    positivity: 0,
    sarcasm: 0,
  }

  // Анализ пунктуации
  const exclamationCount = (text.match(/!/g) || []).length
  if (exclamationCount > 2) {
    features.stress += exclamationCount * 10
    features.aggression += exclamationCount * 5
  }

  // Анализ CAPS
  const upperCaseRatio = (text.match(/[А-ЯA-Z]/g) || []).length / text.length
  if (upperCaseRatio > 0.5 && text.length > 10) {
    features.aggression += 25
  }

  // Анализ эмодзи
  const aggressiveEmojis = ["😡", "🤬", "😤", "💢", "👿", "😠", "🖕"]
  const stressEmojis = ["😰", "😱", "🤯", "😵", "🔥", "⚡", "💥", "🚨"]
  const positiveEmojis = ["😊", "😄", "👍", "✅", "🎉", "💪", "❤️", "👏"]
  const sarcasticEmojis = ["🙄", "🤡", "😏", "🤷", "🤦"]

  aggressiveEmojis.forEach((emoji) => {
    if (text.includes(emoji)) features.aggression += 20
  })

  stressEmojis.forEach((emoji) => {
    if (text.includes(emoji)) features.stress += 15
  })

  positiveEmojis.forEach((emoji) => {
    if (text.includes(emoji)) features.positivity += 15
  })

  sarcasticEmojis.forEach((emoji) => {
    if (text.includes(emoji)) features.sarcasm += 25
  })

  // Анализ многоточий и других признаков сарказма
  if (text.includes("...") || text.includes("ага") || text.includes("конечно")) {
    features.sarcasm += 15
  }

  // Анализ повторяющихся символов
  if (/(.)\1{2,}/.test(text)) {
    features.stress += 10
  }

  return features
}

// Функция для анализа эмоций через Python модели
// async function analyzeEmotionsPython(text: string): Promise<NLPResult["sentiment"]> {
//   try {
//     const response = await fetch("/api/analyze-emotions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ text }),
//     })

//     if (!response.ok) {
//       throw new Error(`Python emotion analysis error: ${response.status}`)
//     }

//     const result = await response.json()
//     return result.sentiment
//   } catch (error) {
//     console.error("Ошибка Python анализа эмоций:", error)
//     // Fallback на локальный анализ
//     return await analyzeEmotionsLocal(text)
//   }
// }

// Усиленный локальный анализ как fallback
async function analyzeEmotionsLocal(text: string): Promise<NLPResult["sentiment"]> {
  console.log(`[ЛОКАЛЬНЫЙ АНАЛИЗ] Анализируем: "${text}"`)
  const lowerText = text.toLowerCase()

  // Расширенные словари для русского и английского
  const aggressionWords = [
    // Русские
    "дурак",
    "идиот",
    "тупой",
    "бред",
    "ерунда",
    "херня",
    "фигня",
    "говно",
    "дерьмо",
    "мудак",
    "козел",
    "урод",
    "кретин",
    "дебил",
    "заткнись",
    "отвали",
    "пошел",
    "достал",
    "надоел",
    "бесит",
    "задолбал",
    "заколебал",
    "замучил",
    "петух",
    // Английские
    "fuck",
    "shit",
    "damn",
    "stupid",
    "idiot",
    "moron",
    "asshole",
    "bitch",
    "bastard",
    "crap",
    "suck",
    "hate",
    "kill",
    "die",
    "shut up",
  ]

  const stressWords = [
    // Русские
    "срочно",
    "быстрее",
    "опять",
    "не успеваем",
    "горит",
    "пожар",
    "аврал",
    "завал",
    "дедлайн",
    "вчера нужно было",
    "когда это закончится",
    "не работает",
    "сломалось",
    "глючит",
    "падает",
    "крашится",
    "виснет",
    "лагает",
    "паника",
    "ужас",
    "кошмар",
    // Английские
    "urgent",
    "asap",
    "deadline",
    "panic",
    "stress",
    "worried",
    "anxious",
    "scared",
    "terrified",
    "nightmare",
    "disaster",
    "emergency",
    "crisis",
    "help",
  ]

  const positiveWords = [
    // Русские
    "спасибо",
    "отлично",
    "хорошо",
    "молодец",
    "супер",
    "рад",
    "классно",
    "круто",
    "замечательно",
    "прекрасно",
    "великолепно",
    "чудесно",
    "благодарю",
    "ценю",
    "уважаю",
    "поддержу",
    "согласен",
    "правильно",
    "точно",
    "здорово",
    // Английские
    "thanks",
    "great",
    "good",
    "excellent",
    "awesome",
    "amazing",
    "wonderful",
    "fantastic",
    "perfect",
    "love",
    "happy",
    "glad",
    "appreciate",
    "support",
  ]

  let aggression = 0
  let stress = 0
  let positivity = 0
  let sarcasm = 0

  // Анализ слов с весами
  aggressionWords.forEach((word) => {
    if (lowerText.includes(word)) {
      const weight = word.length > 4 ? 40 : 30 // Длинные слова весят больше
      aggression += weight
      console.log(`[ЛОКАЛЬНЫЙ] Найдено агрессивное слово: "${word}" (+${weight})`)
    }
  })

  stressWords.forEach((word) => {
    if (lowerText.includes(word)) {
      const weight = word.length > 4 ? 35 : 25
      stress += weight
      console.log(`[ЛОКАЛЬНЫЙ] Найдено стрессовое слово: "${word}" (+${weight})`)
    }
  })

  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) {
      const weight = word.length > 4 ? 30 : 25
      positivity += weight
      console.log(`[ЛОКАЛЬНЫЙ] Найдено позитивное слово: "${word}" (+${weight})`)
    }
  })

  // Анализ пунктуации и структуры
  const exclamationCount = (text.match(/!/g) || []).length
  if (exclamationCount > 0) {
    const exclamationBonus = exclamationCount * 15
    stress += exclamationBonus
    aggression += exclamationBonus * 0.5
    console.log(`[ЛОКАЛЬНЫЙ] Восклицательные знаки: ${exclamationCount} (+${exclamationBonus} стресс)`)
  }

  const upperCaseRatio = (text.match(/[А-ЯA-Z]/g) || []).length / text.length
  if (upperCaseRatio > 0.3 && text.length > 5) {
    const capsBonus = 25
    aggression += capsBonus
    console.log(`[ЛОКАЛЬНЫЙ] CAPS LOCK: ${(upperCaseRatio * 100).toFixed(1)}% (+${capsBonus} агрессия)`)
  }

  // Анализ эмодзи
  const aggressiveEmojis = ["😡", "🤬", "😤", "💢", "👿", "😠", "🖕", "💩"]
  const stressEmojis = ["😰", "😱", "🤯", "😵", "🔥", "⚡", "💥", "🚨"]
  const positiveEmojis = ["😊", "😄", "👍", "✅", "🎉", "💪", "❤️", "👏", "🥰", "😍"]
  const sarcasticEmojis = ["🙄", "🤡", "😏", "🤷", "🤦"]

  aggressiveEmojis.forEach((emoji) => {
    if (text.includes(emoji)) {
      aggression += 30
      console.log(`[ЛОКАЛЬНЫЙ] Агрессивный эмодзи: ${emoji} (+30)`)
    }
  })

  stressEmojis.forEach((emoji) => {
    if (text.includes(emoji)) {
      stress += 25
      console.log(`[ЛОКАЛЬНЫЙ] Стрессовый эмодзи: ${emoji} (+25)`)
    }
  })

  positiveEmojis.forEach((emoji) => {
    if (text.includes(emoji)) {
      positivity += 25
      console.log(`[ЛОКАЛЬНЫЙ] Позитивный эмодзи: ${emoji} (+25)`)
    }
  })

  sarcasticEmojis.forEach((emoji) => {
    if (text.includes(emoji)) {
      sarcasm += 40
      console.log(`[ЛОКАЛЬНЫЙ] Саркастический эмодзи: ${emoji} (+40)`)
    }
  })

  // Анализ сарказма
  const sarcasticPhrases = ["конечно", "ага", "да-да", "ну да", "как же", "еще бы", "sure", "yeah right", "of course"]
  sarcasticPhrases.forEach((phrase) => {
    if (lowerText.includes(phrase) && text.includes("...")) {
      sarcasm += 30
      console.log(`[ЛОКАЛЬНЫЙ] Саркастическая фраза: "${phrase}" с многоточием (+30)`)
    }
  })

  // Ограничиваем значения
  aggression = Math.min(100, aggression)
  stress = Math.min(100, stress)
  positivity = Math.min(100, positivity)
  sarcasm = Math.min(100, sarcasm)

  const toxicity = Math.min(100, aggression * 0.8 + stress * 0.4)
  const maxScore = Math.max(aggression, stress, positivity, sarcasm)

  let dominantEmotion = "neutral"
  if (aggression === maxScore && aggression > 25) dominantEmotion = "aggression"
  else if (stress === maxScore && stress > 25) dominantEmotion = "stress"
  else if (sarcasm === maxScore && sarcasm > 25) dominantEmotion = "sarcasm"
  else if (positivity === maxScore && positivity > 25) dominantEmotion = "positivity"

  console.log(
    `[ЛОКАЛЬНЫЙ] Результат: ${dominantEmotion} (${maxScore.toFixed(1)}%), токсичность: ${toxicity.toFixed(1)}%`,
  )

  return {
    emotion: dominantEmotion,
    confidence: maxScore,
    categories: {
      aggression,
      stress,
      sarcasm,
      toxicity,
      positivity,
    },
  }
}
