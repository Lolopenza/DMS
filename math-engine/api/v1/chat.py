from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ai.chatbot import get_chatbot_service

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
        if '429' in err or 'rate limit' in err.lower() or 'too many requests' in err.lower():
            raise HTTPException(429, err)
        if '401' in err:
            raise HTTPException(401, err)
        if '402' in err:
            raise HTTPException(402, err)
        raise HTTPException(500, err)

    return result
