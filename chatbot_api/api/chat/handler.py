import json
import logging


from fastapi import WebSocket
from openai import AsyncOpenAI
from typing import List, Optional


from helpers.AsyncLLMManager import AsyncLLM
from helpers.LLMManager import LLM, TMessage
from helpers.AsyncHandler import AsyncEventHandler
from api.chat.model import ChatSummaryResponse, ChatWsResponse, MessageStatus

logger = logging.getLogger(__name__)


class ChatHandler:
    def __init__(self):
        logger.info("ChatHandler initialized")

    def handle_summarize(self, messages: List[TMessage]):
        llm = LLM(support_type="after_chat")
        thread = llm.create_thread([])
        summary_response = llm.generate_response(
            user_inquiry=self._format_message(messages), thread=thread
        )
        return ChatSummaryResponse(**json.loads(summary_response))

    async def handle_chat(
        self, messages: List[TMessage], websocket: Optional[WebSocket] = None
    ):
        if not websocket:
            llm = LLM(support_type="auto_chat")
            thread = llm.create_thread(messages[:-1])
            chat_response = llm.generate_response(
                user_inquiry=messages[-1]["content"], thread=thread
            )

            return chat_response

        async def send_message(message: str, status: MessageStatus):
            await websocket.send_text(
                ChatWsResponse(content=message, status=status).model_dump_json()
            )

        await send_message("", "START")
        async_client = AsyncOpenAI()
        async_llm = AsyncLLM(client=async_client, support_type="auto_chat")
        assistant = await async_llm.load_assisstant()
        thread = await async_llm.create_thread(messages[:-1])

        async_event_handler = AsyncEventHandler(
            client=async_client,
            thread_id=thread.id,
            assistant_id=assistant.id,
            on_text_generated=send_message,
        )

        await async_llm.generate_response(
            user_inquiry=messages[-1]["content"],
            thread=thread,
            assistant=assistant,
            event_hanlder=async_event_handler,
        )

        await send_message("", "COMPLETE")

    def _format_message(self, messages: List[TMessage]):
        res = ""
        for message in messages:
            res += f'{message["role"]}:{message["content"]}\n'
        return res
