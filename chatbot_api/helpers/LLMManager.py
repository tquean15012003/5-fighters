import os
import logging


from openai import OpenAI
from dotenv import load_dotenv
from typing import List, Literal
from typing_extensions import TypedDict
from openai.types.beta.thread import Thread

from helpers.ToolCalling import AVAILABLE_TOOLS
from helpers.CustomAssistantEventHandler import EventHandler

ALLOWED_RUNNING_MODE = ["test", "real"]
ALLOWED_MODELS = ["gpt-3.5-turbo", "gpt-4o"]

Role = Literal["user", "assistant"]


class TMessage(TypedDict):
    role: Role
    content: str


logger = logging.getLogger(__name__)


TSupportType = Literal["after_chat", "auto_chat"]


class LLM:
    def __init__(self, support_type: TSupportType):
        logger.info("assistant LLM initilize")
        self._check_env()
        self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        self.support_type: TSupportType = support_type
        self.assistant = self._load_assisstant()

    def create_thread(self, messages: List[TMessage]) -> Thread:
        thread = self.client.beta.threads.create(messages=messages)
        return thread

    def generate_response(self, user_inquiry: str, thread: Thread) -> str:
        if self.mode == "test":
            if self.support_type == "auto_chat":
                return "This is an Faked AI Message for testing"
            elif self.support_type == "after_chat":
                return """
                {
                    "summary": "This is the summary",
                    "tasks": ["Email the customer after finishing checking their account"]
                }
                """
            else:
                raise ValueError("Support Type is not supported")

        self.client.beta.threads.messages.create(
            role="user",
            content=user_inquiry,
            thread_id=thread.id,
        )

        with self.client.beta.threads.runs.stream(
            thread_id=thread.id,
            assistant_id=self.assistant.id,
            instructions=self.assistant.instructions,
            event_handler=EventHandler(
                client=self.client,
                thread_id=thread.id,
                assistant_id=self.assistant.id,
            ),
        ) as stream:
            stream.until_done()

        all_messages = self.client.beta.threads.messages.list(thread_id=thread.id)
        return all_messages.data[0].content[0].text.value

    def _load_assisstant(self):
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
                    "instructions": "You are tasked to answer the customer on the sale agent belf. Give the best answer based on the current interactiion. Use the suitable Google Search when you need information about competitor products, use FAQs search if you need information about 5Figthers, and use both if you need both.",
                    "tools": AVAILABLE_TOOLS,
                }
            )
        else:
            raise ValueError("Support Type is not supported")
        return self.client.beta.assistants.create(**assistant_params)

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

    def __del__(self):
        try:
            self.client.beta.assistants.delete(assistant_id=self.assistant.id)
        except Exception as err:
            logger.error("Failed to delete assistant!")


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
