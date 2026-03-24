from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dmc_ai.chatbot import get_chatbot_service

router = APIRouter(prefix='/api/v1/chat', tags=['AI Chat'])


class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]]
    subject: str | None = None
    module: str | None = None


@router.post('')
@router.post('/')
def chatbot(req: ChatRequest):
    if not req.messages:
        raise HTTPException(400, 'messages must be a non-empty list')

    service = get_chatbot_service()
    result = service.chat(req.messages, subject=req.subject, module=req.module)

    if 'error' in result:
        err = result['error']
        status = result.get('status', 500)
        if isinstance(status, int) and 400 <= status <= 599:
            raise HTTPException(status, err)
        raise HTTPException(500, err)

    return result
