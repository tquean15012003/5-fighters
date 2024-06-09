import logging

from typing import List

from helpers.LLMManager import LLM, TMessage

logger = logging.getLogger(__name__)


class ChatHandler:
    def __init__(self):
        logger.info("PingHandler initialized")

    def handle_summarize(self, messages: List[TMessage]):
        newLLM = LLM(support_type="after_chat")
        newThread = newLLM.create_thread([])
        summary_response = newLLM.generate_response(
            user_inquiry=self._format_message(messages), thread=newThread
        )

        return summary_response

    def handle_chat(self, messages: List[TMessage]):
        newLLM = LLM(support_type="auto_chat")
        newThread = newLLM.create_thread(messages[:-1])
        chat_response = newLLM.generate_response(
            user_inquiry=messages[-1]["content"], thread=newThread
        )

        return chat_response

    def _format_message(self, messages: List[TMessage]):
        res = ""
        for message in messages:
            res += f'{message["role"]}:{message["content"]}\n'
        return res
