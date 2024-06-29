import os
import asyncio
import logging


from openai import AsyncAssistantEventHandler, AsyncOpenAI
from typing import List, Literal
from typing_extensions import TypedDict
from openai.types.beta.thread import Thread
from openai.types.beta.assistant import Assistant

from helpers.ToolCalling import AVAILABLE_TOOLS
from helpers.LLMConstants import DUMMY_STREAMING_ANSWER

ALLOWED_RUNNING_MODE = ["test", "real"]
ALLOWED_MODELS = ["gpt-3.5-turbo", "gpt-4o"]

Role = Literal["user", "assistant"]


class TMessage(TypedDict):
    role: Role
    content: str


logger = logging.getLogger(__name__)


TSupportType = Literal["after_chat", "auto_chat"]


class AsyncLLM:
    def __init__(self, client: AsyncOpenAI, support_type: TSupportType):
        logger.info("LLM initilize")
        self._check_env()
        self.client = client
        self.support_type: TSupportType = support_type

    async def create_thread(self, messages: List[TMessage]) -> Thread:
        thread = await self.client.beta.threads.create(messages=messages)
        return thread

    async def generate_response(
        self,
        user_inquiry: str,
        assistant: Assistant,
        thread: Thread,
        event_hanlder: AsyncAssistantEventHandler,
    ) -> str:

        if self.mode == "test":
            if self.support_type == "auto_chat":
                if event_hanlder.on_text_generated:
                    for word in DUMMY_STREAMING_ANSWER:
                        await event_hanlder.on_text_generated(word, "IN_PROGRESS")
                        await asyncio.sleep(0.05)
                    return
            else:
                raise ValueError("Support Type is not supported")

        await self.client.beta.threads.messages.create(
            role="user",
            content=user_inquiry,
            thread_id=thread.id,
        )

        async with self.client.beta.threads.runs.stream(
            thread_id=thread.id,
            assistant_id=assistant.id,
            event_handler=event_hanlder,
        ) as stream:
            await stream.until_done()

    async def load_assisstant(self):
        assistant_params = {"model": self.model}
        if self.support_type == "after_chat":
            assistant_params.update(
                {
                    "name": "After Chat Assistant",
                    "instructions": """You will receive a chat between the customer and the sale agent. You are tasked to summary the and give the agent follow-up tasks in short phrases such as callback. Tasks can be empty if there is no follow-up action required.
Response: summary: the chat summary, tasks: a list of task
Response in JSON format
summary: str
tasks: [str]""",
                    "response_format": {"type": "json_object"},
                }
            )
        elif self.support_type == "auto_chat":
            assistant_params.update(
                {
                    "name": "Auto Chat Assistant",
                    "instructions": "You are tasked to answer the customer on the sale agent belf. Give the best answer based on the current interactiion. Use the suitable tools when necessary.",
                    "tools": AVAILABLE_TOOLS,
                }
            )
        else:
            raise ValueError("Support Type is not supported")
        assistant = await self.client.beta.assistants.create(**assistant_params)
        return assistant

    def _check_env(self):
        # Check model name
        model = os.getenv("OPENAI_MODEL").lower().strip()
        if model not in ALLOWED_MODELS:
            raise ValueError(
                f"Model is not allowed. Please set OPENAI_MODEL in .env to {' or '.join(ALLOWED_MODELS)}"
            )
        self.model = model

        # Check running mode
        mode = os.getenv("RUNNING_MODE").lower().strip()
        if mode not in ALLOWED_RUNNING_MODE:
            raise ValueError(
                f"Running mode is not allowed. Please set RUNNING_NODE in .env to {' or '.join(ALLOWED_RUNNING_MODE)}"
            )

        self.mode = mode
