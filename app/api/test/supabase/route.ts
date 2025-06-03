import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase переменные окружения не найдены",
          missing: {
            url: !supabaseUrl,
            key: !supabaseKey,
          },
        },
        { status: 400 },
      )
    }

    // Проверяем подключение к Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
      },
    })

    if (response.ok) {
      // Проверяем существование таблицы
      const tableResponse = await fetch(`${supabaseUrl}/rest/v1/emotion_analysis?limit=1`, {
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
      })

      return NextResponse.json({
        success: true,
        connection: "OK",
        table_exists: tableResponse.ok,
        message: tableResponse.ok
          ? "Supabase подключен, таблица emotion_analysis найдена"
          : "Supabase подключен, но таблица emotion_analysis не найдена. Выполните SQL из schema.sql",
        supabase_url: supabaseUrl,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Не удалось подключиться к Supabase",
          status: response.status,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        suggestion: "Проверьте настройки Supabase",
      },
      { status: 500 },
    )
  }
}
