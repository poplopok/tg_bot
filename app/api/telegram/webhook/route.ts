import { type NextRequest, NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(
  process.env.HUGGINGFACE_API_KEY || "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"
);
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Обновленный список моделей с fallback вариантами
const EMOTION_MODELS = [
  "cardiffnlp/twitter-roberta-base-emotion-multilingual-latest", // Мультиязычная модель
  "j-hartmann/emotion-english-distilroberta-base", // Английская модель
  "cointegrated/rubert-base-cased-emotion", // Русская модель (может не работать)
];

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  text?: string;
  voice?: {
    file_id: string;
    duration: number;
  };
}

interface TelegramUpdate {
  update_id: number;
  message: TelegramMessage;
}

// Функция для анализа эмоций с несколькими моделями
async function analyzeEmotions(text: string) {
  const results = [];
  let workingModels = 0;

  for (const model of EMOTION_MODELS) {
    try {
      const result = await hf.textClassification({
        model,
        inputs: text,
      });
      results.push({
        model,
        emotions: result,
      });
      workingModels++;

      // Если хотя бы одна модель работает, можем продолжить
      if (workingModels >= 1) {
        console.log(`Successfully used model: ${model}`);
      }
    } catch (error) {
      console.error(`Error with model ${model}:`, error.message);
      // Продолжаем с следующей моделью
    }
  }

  if (results.length === 0) {
    throw new Error("Ни одна модель эмоций не доступна");
  }

  // Агрегируем результаты
  const emotionScores: { [key: string]: number } = {};
  const totalModels = results.length;

  results.forEach((result) => {
    if (result.emotions && Array.isArray(result.emotions)) {
      result.emotions.forEach((emotion: any) => {
        const label = emotion.label.toLowerCase();
        emotionScores[label] = (emotionScores[label] || 0) + emotion.score;
      });
    }
  });

  // Усредняем результаты
  Object.keys(emotionScores).forEach((emotion) => {
    emotionScores[emotion] /= totalModels;
  });

  return {
    emotions: emotionScores,
    modelsUsed: results.length,
    totalModelsAttempted: EMOTION_MODELS.length,
  };
}

// Функция для обработки голосовых сообщений
async function processVoiceMessage(fileId: string) {
  try {
    // Получаем файл от Telegram
    const fileResponse = await fetch(
      `${TELEGRAM_API_URL}/getFile?file_id=${fileId}`
    );
    const fileData = await fileResponse.json();

    if (!fileData.ok) {
      throw new Error("Failed to get file info");
    }

    // Скачиваем аудиофайл
    const audioUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileData.result.file_path}`;
    const audioResponse = await fetch(audioUrl);
    const audioBuffer = await audioResponse.arrayBuffer();

    // Преобразуем голос в текст с помощью Hugging Face
    const transcription = await hf.automaticSpeechRecognition({
      model: "openai/whisper-large-v3", // Поддерживает русский язык
      data: audioBuffer,
    });

    return transcription.text;
  } catch (error) {
    console.error("Error processing voice message:", error);
    return null;
  }
}

// Функция для отправки сообщения в Telegram
async function sendTelegramMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });
}

// Функция для сохранения результатов в Supabase
async function saveToSupabase(
  userId: number,
  messageText: string,
  emotions: any,
  messageType: "text" | "voice"
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/emotion_analysis`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
        body: JSON.stringify({
          user_id: userId,
          message_text: messageText,
          emotions: emotions,
          message_type: messageType,
          created_at: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to save to Supabase:", await response.text());
    }
  } catch (error) {
    console.error("Error saving to Supabase:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();

    if (!update.message) {
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    const chatId = message.chat.id;
    const userId = message.from.id;

    let textToAnalyze = "";
    let messageType: "text" | "voice" = "text";

    // Обработка текстового сообщения
    if (message.text) {
      textToAnalyze = message.text;
      messageType = "text";
    }
    // Обработка голосового сообщения
    else if (message.voice) {
      await sendTelegramMessage(
        chatId,
        "🎤 Обрабатываю голосовое сообщение..."
      );

      const transcribedText = await processVoiceMessage(message.voice.file_id);
      if (!transcribedText) {
        await sendTelegramMessage(
          chatId,
          "❌ Не удалось обработать голосовое сообщение"
        );
        return NextResponse.json({ ok: true });
      }

      textToAnalyze = transcribedText;
      messageType = "voice";

      await sendTelegramMessage(
        chatId,
        `📝 Распознанный текст: "${transcribedText}"`
      );
    }

    if (!textToAnalyze) {
      return NextResponse.json({ ok: true });
    }

    // Анализируем эмоции
    await sendTelegramMessage(chatId, "🤖 Анализирую эмоции...");

    const analysisResult = await analyzeEmotions(textToAnalyze);
    const emotions = analysisResult.emotions;

    // Сохраняем в Supabase
    await saveToSupabase(userId, textToAnalyze, emotions, messageType);

    // Формируем ответ
    const sortedEmotions = Object.entries(emotions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3); // Топ-3 эмоции

    let responseText = `🎭 <b>Анализ эмоций:</b>\n\n`;

    if (messageType === "voice") {
      responseText += `🎤 <i>Голосовое сообщение</i>\n`;
    }

    responseText += `📝 <b>Текст:</b> ${textToAnalyze}\n\n`;
    responseText += `🤖 <b>Использовано моделей:</b> ${analysisResult.modelsUsed}/${analysisResult.totalModelsAttempted}\n`;
    responseText += `🎯 <b>Обнаруженные эмоции:</b>\n`;

    const emotionEmojis: { [key: string]: string } = {
      joy: "😊",
      happiness: "😊",
      sadness: "😢",
      anger: "😠",
      fear: "😨",
      surprise: "😲",
      disgust: "🤢",
      neutral: "😐",
      positive: "👍",
      negative: "👎",
    };

    sortedEmotions.forEach(([emotion, score]) => {
      const emoji = emotionEmojis[emotion.toLowerCase()] || "🎭";
      const percentage = (score * 100).toFixed(1);
      responseText += `${emoji} ${emotion}: ${percentage}%\n`;
    });

    await sendTelegramMessage(chatId, responseText);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
