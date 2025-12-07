from sqlalchemy.orm import declarative_base
from sqlalchemy import *


Base = declarative_base()

class Task(Base):
    __tablename__ = "tasks"
    id = Column(BigInteger(), primary_key=True, autoincrement=True)
    info = Column(String())
    date = Column(Date())
    is_completed = Column(Boolean())