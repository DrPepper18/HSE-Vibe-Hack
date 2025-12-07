from models.models import *
from models.database import async_session_maker
import sqlalchemy as db


async def query_all_users():
    async with async_session_maker() as session:
        query_select = db.select(User)
        result = await session.execute(query_select)
        user_data = result.scalars().fetchall()
        return user_data