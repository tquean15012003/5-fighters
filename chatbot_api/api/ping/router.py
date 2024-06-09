import logging

from fastapi import APIRouter

from api.ping.handler import PingHandler


logger = logging.getLogger(__name__)


class PingRouter:
    def __init__(self):
        self.router = APIRouter()
        self.router.add_api_route("", self.call_ping, methods=["GET"])
        self.handler = PingHandler()

    def call_ping(self):
        logger.info("call_ping called")
        return self.handler.handle_ping()
