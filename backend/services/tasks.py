import requests
from config import *

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