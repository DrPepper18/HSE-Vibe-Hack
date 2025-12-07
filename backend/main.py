from models.database import *
from routes import base
from fastapi import FastAPI
from contextlib import asynccontextmanager
import uvicorn
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database
    await init_db()
    print("Database initialized")
    yield
    # Shutdown: cleanup if needed
    print("Shutting down")

app = FastAPI(lifespan=lifespan)
app.include_router(base.router)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)