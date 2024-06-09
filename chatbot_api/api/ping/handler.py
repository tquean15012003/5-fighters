import logging

from api.ping.model import PingResponse

logger = logging.getLogger(__name__)


class PingHandler:
    def __init__(self):
        logger.info("PingHandler initialized")

    def handle_ping(self):
        return PingResponse(message="pong")
