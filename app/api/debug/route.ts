import { NextResponse } from "next/server"
import { supabase } from "@/lib/database"

export async function GET() {
  try {
    console.log("🔍 Debug: Checking environment variables...")

    const envCheck = {
      TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
      HUGGINGFACE_API_KEY: !!process.env.HUGGINGFACE_API_KEY,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    }

    console.log("📋 Environment variables:", envCheck)

    // Тест подключения к Supabase
    console.log("🔗 Testing Supabase connection...")
    const { data, error } = await supabase.from("messages").select("count").limit(1)

    if (error) {
      console.error("❌ Supabase connection error:", error)
      return NextResponse.json({
        success: false,
        env: envCheck,
        supabase: { connected: false, error: error.message },
      })
    }

    console.log("✅ Supabase connected successfully")

    // Тест Telegram API
    console.log("🤖 Testing Telegram API...")
    let telegramTest = { connected: false, botInfo: null }

    if (process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`)
        const botInfo = await response.json()

        if (botInfo.ok) {
          telegramTest = { connected: true, botInfo: botInfo.result }
          console.log("✅ Telegram bot connected:", botInfo.result.username)
        } else {
          console.error("❌ Telegram API error:", botInfo)
        }
      } catch (error) {
        console.error("❌ Telegram API connection error:", error)
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      env: envCheck,
      supabase: { connected: true, data },
      telegram: telegramTest,
    })
  } catch (error) {
    console.error("❌ Debug API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
