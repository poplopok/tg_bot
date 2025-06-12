import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("🧪 Test webhook received:", JSON.stringify(body, null, 2))

    // Симуляция обработки сообщения
    const testMessage = {
      message: {
        message_id: 999,
        from: {
          id: 123456789,
          username: "test_user",
          first_name: "Test User",
        },
        chat: {
          id: -1001234567890,
          type: "group",
        },
        date: Math.floor(Date.now() / 1000),
        text: "Тестовое сообщение для проверки бота",
      },
    }

    // Отправляем на основной webhook
    const webhookResponse = await fetch(`${request.url.replace("/test-webhook", "/telegram/webhook")}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testMessage),
    })

    const webhookResult = await webhookResponse.text()

    return NextResponse.json({
      success: true,
      message: "Test webhook sent",
      webhookResponse: webhookResult,
      testData: testMessage,
    })
  } catch (error) {
    console.error("❌ Test webhook error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
