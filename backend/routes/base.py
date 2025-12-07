from fastapi import APIRouter, HTTPException, status, Query
from services.base import *
from services.tasks import *
import json
from pydantic import BaseModel
from typing import List, Dict, Any

class SplitRequest(BaseModel):
    text: str

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK)
async def get_health():
    return {"health": "ok"}

@router.post("/split")
async def split_text_into_tasks(request: SplitRequest):
    return json.loads(get_tasks(text=request.text))