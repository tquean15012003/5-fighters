import logging

from fastapi import APIRouter

from api.chat.model import ChatRequest
from api.chat.handler import ChatHandler


logger = logging.getLogger(__name__)


class ChatRouter:
    def __init__(self):
        self.router = APIRouter()
        self.router.add_api_route("/summary", self.summarize, methods=["POST"])
        self.router.add_api_route("/generate", self.chat, methods=["POST"])
        self.handler = ChatHandler()

    def summarize(self, body: ChatRequest):
        messages = body.messages
        logger.info("Summarize function called")
        return self.handler.handle_summarize(messages)

    def chat(self, body: ChatRequest):
        logger.info("Chat function called")
        messages = body.messages
        return self.handler.handle_chat(messages)
