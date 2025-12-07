from sqlalchemy.orm import declarative_base
from sqlalchemy import *


Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(BigInteger(), primary_key=True, autoincrement=True)
    name = Column(String())
    is_admin = Column(Boolean())