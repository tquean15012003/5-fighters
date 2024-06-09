import os
import logging


from openai import OpenAI
from dotenv import load_dotenv
from typing import List, Literal
from typing_extensions import TypedDict
from openai.types.beta.thread import Thread

from helpers.ToolCalling import AVAILABLE_TOOLS
from helpers.CustomAssistantEventHandler import EventHandler

Role = Literal["user", "assistant"]


class TMessage(TypedDict):
    role: Role
    content: str


logger = logging.getLogger(__name__)


TSupportType = Literal["after_chat", "auto_chat"]


class LLM:
    def __init__(self, support_type: TSupportType):
        logger.info("assistant LLM initilize")
        self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        self.assistant = self._load_assisstant(support_type)

    def create_thread(self, messages: List[TMessage]) -> Thread:
        thread = self.client.beta.threads.create(messages=messages)
        return thread

    def generate_response(self, user_inquiry: str, thread: Thread) -> str:
        self.client.beta.threads.messages.create(
            role="user",
            content=user_inquiry,
            thread_id=thread.id,
        )

        with self.client.beta.threads.runs.stream(
            thread_id=thread.id,
            assistant_id=self.assistant.id,
            event_handler=EventHandler(
                client=self.client,
                thread_id=thread.id,
                assistant_id=self.assistant.id,
            ),
        ) as stream:
            stream.until_done()

        all_messages = self.client.beta.threads.messages.list(thread_id=thread.id)
        return all_messages.data[0].content[0].text.value

    def _load_assisstant(self, type: TSupportType):
        assistant_params = {"model": os.getenv("OPENAI_MODEL")}
        if type == "after_chat":
            assistant_params.update(
                {
                    "name": "Summary helper",
                    "instructions": "Summarize the chat content and generate the todo list based on its summary",
                }
            )

        elif type == "auto_chat":
            assistant_params(
                {
                    "name": "Auto-chat helper",
                    "instructions": "Based on the chat content, generate the answer for customer's question",
                    "tools": AVAILABLE_TOOLS,
                }
            )
        else:
            raise ValueError("Type is not supported")
        return self.client.beta.assistants.create(**assistant_params)

    def __del__(self):
        self.client.beta.assistants.delete(assistant_id=self.assistant.id)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, force=True)
    logger = logging.getLogger(__name__)

    load_dotenv()

    newLLM = LLM(support_type="auto_chat")
    newThread = newLLM.create_thread([])
    response = newLLM.generate_response(
        "Customer: I'm having trouble accessing my account. Every time I try to log in, it says my password is incorrect, but I'm sure I'm entering the correct password. Can you help me reset my password or find out what's going wrong?",
        newThread,
    )
    logger.info(f"{response} test response")
