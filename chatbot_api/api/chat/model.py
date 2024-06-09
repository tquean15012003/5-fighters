from typing import List
from pydantic import BaseModel
from helpers.eventHandler import TMessage


class ChatRequest(BaseModel):
    messages: List[TMessage]
