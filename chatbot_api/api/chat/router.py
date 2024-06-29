import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from api.chat.model import ChatRequest, ChatWsResponse
from api.chat.handler import ChatHandler


logger = logging.getLogger(__name__)


class ChatRouter:
    def __init__(self):
        self.router = APIRouter()
        self.router.add_api_route("/summary", self.summarize, methods=["POST"])
        self.router.add_api_route("/generate", self.chat, methods=["POST"])
        self.router.add_websocket_route("/ws/generate", self.async_chat)

        self.handler = ChatHandler()

    def summarize(self, body: ChatRequest):
        messages = body.messages
        logger.info("Summarize function called")
        return self.handler.handle_summarize(messages)

    async def chat(self, body: ChatRequest):
        logger.info("Chat function called")
        messages = body.messages
        response = await self.handler.handle_chat(messages)
        return response

    async def async_chat(self, websocket: WebSocket):
        logger.info("Chat function called")
        await websocket.accept()
        try:
            while True:
                try:
                    data = await websocket.receive_text()
                    data_json = json.loads(data)
                    request_body = ChatRequest(**data_json)
                    await self.handler.handle_chat(
                        messages=request_body.messages, websocket=websocket
                    )
                except json.JSONDecodeError as error:
                    logger.error(f"JSON decode error: {error}")
                    await websocket.send_text(
                        ChatWsResponse(
                            status="ERROR", content=error.msg
                        ).model_dump_json()
                    )
                except ValidationError as error:
                    logger.error(f"Body is not valid: {error}")
                    await websocket.send_text(
                        ChatWsResponse(
                            status="ERROR", content=error.json()
                        ).model_dump_json()
                    )
        except WebSocketDisconnect as error:
            logger.info("Disconnected")
        except Exception as error:
            logger.error(f"Unknown Error: {error}")
            await websocket.send_text(
                ChatWsResponse(status="ERROR", content=str(error)).model_dump_json()
            )
