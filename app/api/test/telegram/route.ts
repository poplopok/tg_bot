import { NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function GET() {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "TELEGRAM_BOT_TOKEN не найден в переменных окружения",
        },
        { status: 400 },
      )
    }

    // Проверяем подключение к Telegram API
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`)
    const data = await response.json()

    if (data.ok) {
      return NextResponse.json({
        success: true,
        bot_info: data.result,
        message: "Подключение к Telegram API успешно",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: data.description,
          suggestion: "Проверьте правильность TELEGRAM_BOT_TOKEN",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        suggestion: "Проверьте интернет-соединение и токен бота",
      },
      { status: 500 },
    )
  }
}
