import os


def is_local_development():
    return not os.path.exists('/.dockerenv')


if is_local_development():
    from dotenv import load_dotenv
    load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
YANDEX_API_KEY = os.getenv('YANDEX_API_KEY')
FOLDER_ID = os.getenv('FOLDER_ID')