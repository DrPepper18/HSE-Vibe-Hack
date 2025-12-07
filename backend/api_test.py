import requests
from config import *
import json


# text = "Я хочу помыть посуду, потом сделать уроки. А вечером надо будет погулять"
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


def split_task_with_ai(task: str) -> list[str]:
    """
    Разбивает одну задачу на 2 более мелкие подзадачи с помощью YandexGPT
    """
    prompt = (
        "Разбей следующую задачу на 2 более мелкие и конкретные подзадачи. "
        "Ответ предоставь в формате JSON: {\"subtasks\": [\"подзадача1\", \"подзадача2\"]}\n"
        f"Задача: {task}"
    )
    
    yandex_url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
    headers = {
        "Authorization": f"Api-Key {YANDEX_API_KEY}",
        "Content-Type": "application/json",
        "x-folder-id": FOLDER_ID,
    }
    
    data = {
        "modelUri": f"gpt://{FOLDER_ID}/yandexgpt-lite/latest",
        "completionOptions": {"temperature": 0.1, "maxTokens": 100},
        "messages": [{"role": "user", "text": prompt}],
    }
    
    try:
        resp = requests.post(yandex_url, headers=headers, json=data, timeout=15)
        resp.raise_for_status()
        result = resp.json()
        answer = result["result"]["alternatives"][0]["message"]["text"].strip()
        
        # Извлекаем JSON из ответа
        json_start = answer.find('{')
        json_end = answer.rfind('}') + 1
        if json_start != -1 and json_end != 0:
            json_str = answer[json_start:json_end]
            subtasks_data = json.loads(json_str)
            return subtasks_data.get("subtasks", [task])
        else:
            # Если не удалось распарсить JSON, возвращаем исходную задачу
            return [task]
            
    except Exception as e:
        print(f"Ошибка при разбиении задачи: {e}")
        return [task]


def split_all_tasks_with_ai(tasks: list[str]) -> dict[str, list[str]]:
    """
    Разбивает все задачи на подзадачи
    Возвращает словарь: {исходная_задача: [подзадача1, подзадача2]}
    """
    result = {}
    
    for task in tasks:
        subtasks = split_task_with_ai(task)
        result[task] = subtasks
    
    return result


text = input()
result = json.loads(get_tasks(text))
print(result)
print(split_all_tasks_with_ai(result["tasks"]))