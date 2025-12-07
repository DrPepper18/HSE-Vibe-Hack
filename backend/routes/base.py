from fastapi import APIRouter, HTTPException, status, Query
from services.base import *
from services.tasks import *
import json
from pydantic import BaseModel
from typing import List, Dict, Any

class SplitRequest(BaseModel):
    text: str

class DoneRequest(BaseModel):
    id: int

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK)
async def get_health():
    return {"health": "ok"}


@router.post("/split")
async def split_text_into_tasks(request: SplitRequest):
    result = json.loads(get_tasks(text=request.text))
    await add_new_tasks(tasks=result["tasks"])
    return result


@router.get("/energy")
async def get_user_energy():
    result = await query_all_tasks_for_today()
    return {"energy": result}


@router.post("/done")
async def task_is_done(request: DoneRequest):
    result = await query_change_status(id=request.id)
    return {"energy": result}