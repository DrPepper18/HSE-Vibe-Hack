from models.models import *
from models.database import async_session_maker
import sqlalchemy as db
from config import *
import requests
from datetime import date


def get_tasks(text: str): 
    prompt = (
        "Сейчас я тебе скину текст. Тебе надо оттуда извлечь задачи.\n"
        "Результат выведи в формате JSON одной строкой\n"
        "Пример: {\"tasks\": List[str]}"
        f"Текст:\n{text}"
    )
    yandex_url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
    headers = {
        "Authorization": f"Api-Key {YANDEX_API_KEY}",
        "Content-Type": "application/json",
        "x-folder-id": FOLDER_ID,
    }
    data = {
        "modelUri": f"gpt://{FOLDER_ID}/yandexgpt-lite/latest",
        "completionOptions": {"temperature": 0.1, "maxTokens": 50},
        "messages": [{"role": "user", "text": prompt}],
    }
    resp = requests.post(yandex_url, headers=headers, json=data, timeout=15)
    resp.raise_for_status()
    result = resp.json()
    answer = result["result"]["alternatives"][0]["message"]["text"].strip()
    return answer[4:-4]


async def add_new_tasks(tasks: list):
    async with async_session_maker() as session:
        for task in tasks:
            new_task = Task(
                info=task,
                date=date.today(),
                is_completed=False
            )
            session.add(new_task)
        await session.commit()


async def query_all_tasks_completed():
    async with async_session_maker() as session:
        query_select = db.select(db.func.count(Task.id)).where(
            (Task.date == date.today()) &
            (Task.is_completed == True)
        )
        result = await session.execute(query_select)
        user_data = result.scalar()
        return user_data


async def query_all_tasks():
    async with async_session_maker() as session:
        query_select = db.select(Task)
        result = await session.execute(query_select)
        user_data = result.scalars().all()
        return user_data


async def query_change_status(id: int):
    async with async_session_maker() as session:
        stmt = (
            update(Task)
            .where(Task.id == id)
            .values(is_completed=True)
        )  
        await session.execute(stmt)
        await session.commit()