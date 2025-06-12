import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials:", {
    url: !!supabaseUrl,
    key: !!supabaseKey,
  })
  throw new Error("Missing Supabase credentials")
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface MessageData {
  chatId: number
  userId: number
  username: string
  messageId: number
  text: string
  messageType: "text" | "voice" | "video_note"
  emotions: {
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
  }
  timestamp: Date
}

export async function saveMessage(data: MessageData) {
  console.log("💾 Saving message to database:", {
    chatId: data.chatId,
    username: data.username,
    text: data.text.substring(0, 50) + "...",
  })

  try {
    const { error } = await supabase.from("messages").insert({
      chat_id: data.chatId,
      user_id: data.userId,
      username: data.username,
      message_id: data.messageId,
      text: data.text,
      message_type: data.messageType,
      joy: data.emotions.joy,
      anger: data.emotions.anger,
      fear: data.emotions.fear,
      sadness: data.emotions.sadness,
      surprise: data.emotions.surprise,
      disgust: data.emotions.disgust,
      neutral: data.emotions.neutral,
      toxicity: data.emotions.toxicity,
      sentiment: data.emotions.sentiment,
      confidence: data.emotions.confidence,
      created_at: data.timestamp.toISOString(),
    })

    if (error) {
      console.error("❌ Database save error:", error)
      throw error
    }

    console.log("✅ Message saved successfully")
  } catch (error) {
    console.error("❌ Database error:", error)
    throw error
  }
}

export async function getChatSettings(chatId: number) {
  try {
    const { data, error } = await supabase.from("chat_settings").select("*").eq("chat_id", chatId).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching chat settings:", error)
      throw error
    }

    // Если настройки не найдены, создаем дефолтные
    if (!data) {
      const defaultSettings = {
        chat_id: chatId,
        enabled: true,
        toxicity_threshold: 0.7,
        alert_admins: true,
        language: "ru",
      }

      const { data: newSettings, error: insertError } = await supabase
        .from("chat_settings")
        .insert(defaultSettings)
        .select()
        .single()

      if (insertError) {
        console.error("Error creating default settings:", insertError)
        throw insertError
      }

      return newSettings
    }

    return data
  } catch (error) {
    console.error("Database error:", error)
    return { enabled: true, toxicity_threshold: 0.7 } // Fallback
  }
}

export async function getMessages(chatId?: number, limit = 50) {
  try {
    let query = supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(limit)

    if (chatId) {
      query = query.eq("chat_id", chatId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching messages:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Database error:", error)
    return []
  }
}

export async function getEmotionAnalytics(chatId?: number, days = 7) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let query = supabase
      .from("messages")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true })

    if (chatId) {
      query = query.eq("chat_id", chatId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching analytics:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Database error:", error)
    return []
  }
}

export async function getTeamAnalytics(chatId?: number) {
  try {
    let query = supabase
      .from("messages")
      .select("username, joy, anger, sadness, fear, toxicity, sentiment, created_at")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Последние 7 дней

    if (chatId) {
      query = query.eq("chat_id", chatId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching team analytics:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Database error:", error)
    return []
  }
}

export async function saveAlert(alert: {
  chatId: number
  type: string
  severity: string
  message: string
  username?: string
}) {
  try {
    const { error } = await supabase.from("alerts").insert({
      chat_id: alert.chatId,
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      username: alert.username,
      resolved: false,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving alert:", error)
      throw error
    }
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}

export async function getAlerts(resolved = false) {
  try {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("resolved", resolved)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching alerts:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Database error:", error)
    return []
  }
}
