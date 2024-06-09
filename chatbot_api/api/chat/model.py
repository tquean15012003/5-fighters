from typing import List
from pydantic import BaseModel

from helpers.LLMManager import TMessage


class ChatRequest(BaseModel):
    messages: List[TMessage]


class ChatSummaryResponse(BaseModel):
    summary: str
    tasks: List[str]
