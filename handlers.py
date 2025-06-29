from aiogram import types
from aiogram.enums import ParseMode
from aiogram.types import ChatPermissions
from aiogram.filters import Command
import asyncio
from datetime import datetime, timedelta
from pydub import AudioSegment
import io
import time

WARNING_THRESHOLD = 2
EMOTION_SCORE_THRESHOLD = 0.75

last_emotion_response_time = {}

def register_handlers(dp, bot, supabase, emotion_analyzer):

    def should_send_emotion_response(chat_id: int, emotion: str, score: float) -> bool:
        now = time.time()
        last_time = last_emotion_response_time.get(chat_id, 0)

        if score < EMOTION_SCORE_THRESHOLD:
            return False

        if now - last_time < 60:  # минимум 60 секунд между ответами
            return False

        if emotion in ["sad", "angry", "positive"]:
            last_emotion_response_time[chat_id] = now
            return True

        return False

    def get_emotion_response(emotion: str) -> str | None:
        if emotion == "sad":
            return "Мне кажется, ты немного грустишь... Всё будет хорошо! "
        elif emotion == "angry":
            return "Вижу, ты злишься. Попробуй немного выдохнуть, я рядом. 🤝"
        elif emotion == "positive":
            return "Отличное настроение! Рад это видеть 😄"
        return None

    async def analyze_emotion(text):
        return emotion_analyzer.analyze_text(text)

    async def store_message(user: types.User, text: str, emotion: str, score: float):
        user_resp = supabase.table("users").select("id").eq("telegram_id", user.id).execute()
        if not user_resp.data:
            user_data = {
                "telegram_id": user.id,
                "username": user.username,
            }
            user_resp = supabase.table("users").insert(user_data).execute()
        user_id = user_resp.data[0]["id"]
        supabase.table("messages").insert({
            "user_id": user_id,
            "message": text,
            "emotion": emotion,
            "score": score,
        }).execute()
        return user_id
    
    async def unmute_user(chat_id: int, user_id: int):
        permissions = ChatPermissions(
            can_send_messages=True,
            can_send_media_messages=True,
            can_send_polls=True,
            can_send_other_messages=True,
            can_add_web_page_previews=True,
            can_change_info=False,
            can_invite_users=True,
            can_pin_messages=False,
        )
        try:
            await bot.restrict_chat_member(
                chat_id=chat_id,
                user_id=user_id,
                permissions=permissions,
            )
            await bot.send_message(chat_id, "Пользователь размучен.")
        except Exception as e:
            await bot.send_message(chat_id, f"Ошибка при размучивании: {e}")

    async def unmute_after_delay(chat_id: int, user_id: int, delay: int = 10):
        await asyncio.sleep(delay)
        await unmute_user(chat_id, user_id)

    async def handle_warnings(user_id: str, user: types.User, emotion: str, chat_id: int):
        if emotion in ["anger", "fear", "sadness"]:
            supabase.table("warnings").insert({
                "user_id": user_id,
                "reason": "Негативная эмоция",
                "emotion": emotion,
            }).execute()

            warning_resp = supabase.table("warnings").select("*").eq("user_id", user_id).execute()
            warning_count = len(warning_resp.data) if warning_resp.data else 0

            if warning_count < WARNING_THRESHOLD:
                await bot.send_message(chat_id,
                                    f"Пожалуйста, будьте внимательнее в выражениях. Обнаружена эмоция: {emotion}.",
                                    parse_mode=ParseMode.HTML)
            else:
                permissions = ChatPermissions(
                    can_send_messages=False,
                    can_send_media_messages=False,
                    can_send_polls=False,
                    can_send_other_messages=False,
                    can_add_web_page_previews=False,
                    can_change_info=False,
                    can_invite_users=False,
                    can_pin_messages=False,
                )
                try:
                    until_timestamp = int((datetime.utcnow() + timedelta(seconds=10)).timestamp())
                    await bot.restrict_chat_member(
                        chat_id=chat_id,
                        user_id=user.id,
                        permissions=permissions,
                        until_date=until_timestamp,
                    )
                    await bot.send_message(chat_id,
                                        "Вы были временно ограничены на 10 секунд из-за повторяющейся агрессии.",
                                        parse_mode=ParseMode.HTML)
                    asyncio.create_task(unmute_after_delay(chat_id, user.id, delay=10))
                except Exception as e:
                    await bot.send_message(chat_id,
                                        f"Не удалось применить мут: {e}",
                                        parse_mode=ParseMode.HTML)

    @dp.message(Command("start"))
    async def cmd_start(message: types.Message):
        await message.answer("Привет! Я бот для анализа эмоций. Я слежу за порядком!")

    @dp.message(Command("stats"))
    async def cmd_stats(message: types.Message):
        user_resp = supabase.table("users").select("id").eq("telegram_id", message.from_user.id).execute()
        if not user_resp.data:
            await message.answer("Пользователь не найден в базе данных.")
            return

        user_id = user_resp.data[0]["id"]

        messages_resp = supabase.table("messages").select("emotion", "score").eq("user_id", user_id).execute()
        messages = messages_resp.data or []

        messages_count = len(messages)

        warnings_resp = supabase.table("warnings").select("id").eq("user_id", user_id).execute()
        warnings_count = len(warnings_resp.data) if warnings_resp.data else 0

        positive_emotions = {"joy", "love", "surprise", "positive"}
        negative_emotions = {"anger", "fear", "sadness", "sad"}

        pos_scores = [msg["score"] for msg in messages if msg["emotion"] in positive_emotions]
        neg_scores = [msg["score"] for msg in messages if msg["emotion"] in negative_emotions]

        avg_pos = sum(pos_scores) / len(pos_scores) if pos_scores else 0
        avg_neg = sum(neg_scores) / len(neg_scores) if neg_scores else 0

        mood_summary = ""
        if avg_pos > avg_neg:
            mood_summary = f"Ваш общий настрой позитивный 😊 (средний положительный балл: {avg_pos:.2f})"
        elif avg_neg > avg_pos:
            mood_summary = f"Ваш общий настрой негативный 😞 (средний отрицательный балл: {avg_neg:.2f})"
        else:
            mood_summary = "Ваш общий настрой нейтральный 😐"

        text = (f"📊 Статистика для пользователя @{message.from_user.username or message.from_user.full_name}:\n"
                f"Всего сообщений: {messages_count}\n"
                f"Предупреждений: {warnings_count}\n\n"
                f"{mood_summary}")

        await message.answer(text)

    @dp.message()
    async def on_message(message: types.Message):
        if message.text:
            emotion, score = await analyze_emotion(message.text)
            user_id = await store_message(message.from_user, message.text, emotion, score)
            await handle_warnings(user_id, message.from_user, emotion, message.chat.id)

            if should_send_emotion_response(message.chat.id, emotion, score):
                response = get_emotion_response(emotion)
                if response:
                    await message.answer(response)

        elif message.voice:
            file = await bot.get_file(message.voice.file_id)
            audio_bytes = await bot.download_file(file.file_path)
            audio_data = audio_bytes.read()

            ogg_audio = AudioSegment.from_file(io.BytesIO(audio_data), format="ogg")
            wav_io = io.BytesIO()
            ogg_audio.export(wav_io, format="wav")
            wav_bytes = wav_io.getvalue()

            emotion, score = emotion_analyzer.analyze_audio(wav_bytes)

            await message.answer(f"Распознанная эмоция: {emotion} (вероятность: {score:.2f})")

            user_id = await store_message(message.from_user, "[voice message]", emotion, score)
            await handle_warnings(user_id, message.from_user, emotion, message.chat.id)

            if should_send_emotion_response(message.chat.id, emotion, score):
                response = get_emotion_response(emotion)
                if response:
                    await message.answer(response)

        else:
            await message.answer("Пожалуйста, отправьте текст или голосовое сообщение.")
