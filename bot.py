import os
import asyncio
from aiogram import Bot, Dispatcher
from dotenv import load_dotenv
from supabase import create_client
from emotion_analyzer import EmotionAnalyzer
from handlers import register_handlers

load_dotenv()

TOKEN = os.getenv("TELEGRAM_TOKEN")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

bot = Bot(token=TOKEN)
dp = Dispatcher()
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
emotion_analyzer = EmotionAnalyzer()

async def main():
    register_handlers(dp, bot, supabase, emotion_analyzer)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
