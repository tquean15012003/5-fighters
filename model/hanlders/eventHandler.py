import os
import json
import logging
import threading


from openai import OpenAI
from dotenv import load_dotenv  # type: ignore
from typing_extensions import override
from typing import List, Literal, TypedDict
from openai.types.beta.thread import Thread
from openai import AssistantEventHandler, OpenAI
from openai.types.beta.threads import Message, MessageDelta
from openai.types.beta.threads.runs import ToolCall, RunStep

from functionHandler import AVAILABLE_TOOLS, FUNCTION_MAP

Role = Literal["user", "assistant"]


class TMessage(TypedDict):
    role: Role
    content: str


logging.basicConfig(level=logging.INFO, force=True)
logger = logging.getLogger(__name__)


TSupportType = Literal["after_chat", "auto_chat"]


class LLM:

    def __init__(self, support_type: TSupportType):
        logger.info("assistant LLM initilize")
        self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        self.assistant = self._load_assisstant(support_type)

    def create_thread(self, messages: List[TMessage]):
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
        if type == "after_chat":
            return self.client.beta.assistants.create(
                name="Summary helper",
                instructions="Summarize the chat content and generate the todo list based on its summary",
                model="gpt-4-1106-preview",
            )
        elif type == "auto_chat":
            return self.client.beta.assistants.create(
                name="Auto-chat helper",
                instructions="Based on the chat content, generate the answer for customer's question",
                model="gpt-4-1106-preview",
                tools=AVAILABLE_TOOLS,
            )
        else:
            raise ValueError("Type is not supported")


class EventHandler(AssistantEventHandler):
    def __init__(
        self,
        client: OpenAI,
        thread_id: str,
        assistant_id: str,
    ):
        super().__init__()
        self.client = client
        self.thread_id = thread_id
        self.assistant_id = assistant_id
        self.run_id = None
        self.function_call_utils: list[dict] = []

    @override
    def on_text_created(self, text) -> None:
        self.response_text = ""
        logger.info(f"on_text_created: {text}")

    @override
    def on_text_delta(self, delta, snapshot):
        self.response_text += delta.value
        logger.info(f"on_text_delta: {delta.value}")

    @override
    def on_end(self):
        logger.info("on_end: FINISH!")

    @override
    def on_exception(self, exception: Exception) -> None:
        """Fired whenever an exception happens during streaming"""
        logger.error(f"on_exception: Unknown error {exception}")

    @override
    def on_message_created(self, message: Message) -> None:
        logger.info(f"on_message_created: {message}")

    @override
    def on_message_done(self, message: Message) -> None:
        logger.info(f"on_message_done: {message}")

    @override
    def on_message_delta(self, delta: MessageDelta, snapshot: Message) -> None:
        # print(f"\nassistant on_message_delta > {delta}\n", end="", flush=True)
        pass

    def on_tool_call_created(self, tool_call):
        logger.info(f"on_tool_call_created: {tool_call}")
        if tool_call.type == "function":
            self.function_call_utils.append(
                {
                    "function_name": tool_call.function.name,
                    "tool_id": tool_call.id,
                    "arguments": "",
                }
            )

        run = self.client.beta.threads.runs.retrieve(
            thread_id=self.thread_id, run_id=self.run_id
        )

        while run.status in ["queued", "in_progress"]:
            run = self.client.beta.threads.runs.retrieve(
                thread_id=self.thread_id, run_id=self.run_id
            )
            logger.info(f"on_tool_call_created: {run.status}")

    def execute_tool_function_in_thread(self, tool, results: list[dict]):
        logger.info(f"Executing in {threading.get_native_id()}")
        function_name = tool["function_name"]
        arguments = json.loads(tool["arguments"])
        output = FUNCTION_MAP[function_name](**arguments)
        results.append(
            {
                "tool_call_id": tool["tool_id"],
                "output": output,
            }
        )

    @override
    def on_tool_call_done(self, tool_call: ToolCall) -> None:
        run = self.client.beta.threads.runs.retrieve(
            thread_id=self.thread_id, run_id=self.run_id
        )

        logger.info(f"on_tool_call_done: {run.status}")

        if run.status == "completed":
            all_messages = self.client.beta.threads.messages.list(
                thread_id=self.thread_id
            )
            return all_messages.data[0].content[0].text.value

        elif run.status == "requires_action":
            tool_calls = run.required_action.submit_tool_outputs.tool_calls
            if len(tool_calls) > len(self.function_call_utils):
                logger.info(
                    "There are more tools coming. Waiting for new tools infomation."
                )
                return
            logger.info("on_tool_call_done: Execute tool functions")
            tool_outputs = []
            threads: list[threading.Thread] = []
            results = []
            for tool in self.function_call_utils:
                thread = threading.Thread(
                    target=self.execute_tool_function_in_thread, args=(tool, results)
                )
                threads.append(thread)
                thread.start()
            for thread in threads:
                thread.join()
            tool_outputs.extend(results)

            with self.client.beta.threads.runs.submit_tool_outputs_stream(
                thread_id=self.thread_id,
                run_id=self.run_id,
                tool_outputs=tool_outputs,
                event_handler=EventHandler(
                    client=self.client,
                    thread_id=self.thread_id,
                    assistant_id=self.assistant_id,
                ),
            ) as stream:
                stream.until_done()

    @override
    def on_run_step_created(self, run_step: RunStep) -> None:
        logger.info(f"on_run_step_created id: {run_step.run_id}")
        self.run_id = run_step.run_id

    @override
    def on_run_step_done(self, run_step: RunStep) -> None:
        logger.info(f"on_run_step_done id: {run_step.run_id}")

    def on_tool_call_delta(self, delta, snapshot):
        if delta.type == "function":
            # the arguments stream thorugh here and then you get the requires action event
            logger.info(
                f"on_tool_call_delta: Function arguments {delta.function.arguments}"
            )
            self.function_call_utils[-1]["arguments"] += delta.function.arguments
        elif delta.type == "code_interpreter":
            logger.info("on_tool_call_delta: code_interpreter")
            if delta.code_interpreter.input:
                logger.info(
                    f"on_tool_call_delta: code_interpreter input: {delta.code_interpreter.input}"
                )
            if delta.code_interpreter.outputs:
                logger.info(f"on_tool_call_delta: output:")
                for output in delta.code_interpreter.outputs:
                    if output.type == "logs":
                        logger.info(f"on_tool_call_delta: {output.logs}")
        else:
            logger.warn(f"{delta.type} tool has not been implemented")


if __name__ == "__main__":
    load_dotenv()

    newLLM = LLM(support_type="auto_chat")
    newThread = newLLM.create_thread([])
    response = newLLM.generate_response(
        "Customer: I'm having trouble accessing my account. Every time I try to log in, it says my password is incorrect, but I'm sure I'm entering the correct password. Can you help me reset my password or find out what's going wrong?",
        newThread,
    )
    print(response, "testing response")
