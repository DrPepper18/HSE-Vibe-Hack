import os


def is_local_development():
    return not os.path.exists('/.dockerenv')


if is_local_development():
    from dotenv import load_dotenv
    load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL') 