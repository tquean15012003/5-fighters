import json
import logging
import threading


from typing_extensions import override
from openai import AsyncAssistantEventHandler, AzureOpenAI
from openai.types.beta.threads import Message, MessageDelta
from openai.types.beta.threads.runs import ToolCall, RunStep

from helpers.ToolCalling import FUNCTION_MAP

logger = logging.getLogger(__name__)


class AsyncEventHandler(AsyncAssistantEventHandler):
    def __init__(
        self,
        client: AzureOpenAI,
        thread_id: str,
        assistant_id: str,
        on_text_generated=None,
    ):
        super().__init__()
        self.client = client
        self.thread_id = thread_id
        self.assistant_id = assistant_id
        self.run_id = None
        self.function_call_utils: list[dict] = []
        self.on_text_generated = on_text_generated

    @override
    async def on_text_created(self, text) -> None:
        self.response_text = ""
        logger.info(f"on_text_created: {text}")

    @override
    async def on_text_delta(self, delta, snapshot):
        self.response_text += delta.value
        if self.on_text_generated:
            await self.on_text_generated(delta.value, "IN_PROGRESS")
        logger.info(f"on_text_delta: {delta.value}")

    @override
    async def on_end(self):
        logger.info("on_end: FINISH!")

    @override
    async def on_exception(self, exception: Exception) -> None:
        """Fired whenever an exception happens during streaming"""
        logger.error(f"on_exception: Unknown error {exception}")

    @override
    async def on_message_created(self, message: Message) -> None:
        logger.info(f"on_message_created: {message}")

    @override
    async def on_message_done(self, message: Message) -> None:
        logger.info(f"on_message_done: {message}")

    @override
    async def on_message_delta(self, delta: MessageDelta, snapshot: Message) -> None:
        # print(f"\nassistant on_message_delta > {delta}\n", end="", flush=True)
        pass

    async def on_tool_call_created(self, tool_call):
        logger.info(f"on_tool_call_created: {tool_call}")
        if tool_call.type == "function":
            self.function_call_utils.append(
                {
                    "function_name": tool_call.function.name,
                    "tool_id": tool_call.id,
                    "arguments": "",
                }
            )

        run = await self.client.beta.threads.runs.retrieve(
            thread_id=self.thread_id, run_id=self.run_id
        )

        while run.status in ["queued", "in_progress"]:
            run = await self.client.beta.threads.runs.retrieve(
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
    async def on_tool_call_done(self, tool_call: ToolCall) -> None:
        run = await self.client.beta.threads.runs.retrieve(
            thread_id=self.thread_id, run_id=self.run_id
        )

        logger.info(f"on_tool_call_done: {run.status}")

        if run.status == "completed":
            all_messages = await self.client.beta.threads.messages.list(
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
            self.function_call_utils = []
            async with self.client.beta.threads.runs.submit_tool_outputs_stream(
                thread_id=self.thread_id,
                run_id=self.run_id,
                tool_outputs=tool_outputs,
                event_handler=AsyncEventHandler(
                    client=self.client,
                    thread_id=self.thread_id,
                    assistant_id=self.assistant_id,
                    on_text_generated=self.on_text_generated,
                ),
            ) as stream:
                await stream.until_done()

    @override
    async def on_run_step_created(self, run_step: RunStep) -> None:
        logger.info(f"on_run_step_created id: {run_step.run_id}")
        self.run_id = run_step.run_id

    @override
    async def on_run_step_done(self, run_step: RunStep) -> None:
        logger.info(f"on_run_step_done id: {run_step.run_id}")

    async def on_tool_call_delta(self, delta, snapshot):
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
