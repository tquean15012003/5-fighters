from typing import List, Literal
from pydantic import BaseModel

from helpers.LLMManager import TMessage


class ChatRequest(BaseModel):
    messages: List[TMessage]


MessageStatus = Literal["START", "COMPLETE", "IN_PROGRESS", "ERROR"]


class ChatWsResponse(BaseModel):
    status: MessageStatus
    content: str


class ChatSummaryResponse(BaseModel):
    summary: str
    tasks: List[str]
