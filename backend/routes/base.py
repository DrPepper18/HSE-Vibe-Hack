from fastapi import APIRouter, HTTPException, status, Query
from services.base import *

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK)
async def get_health():
    return {"health": "ok"}

@router.get("/users")
async def get_all_users():
    return {"health": "ok"}