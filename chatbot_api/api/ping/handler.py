import logging

from api.ping.model import PingReponse

logger = logging.getLogger(__name__)


class PingHandler:
    def __init__(self):
        logger.info("PingHandler initialized")

    def handle_ping(self):
        return PingReponse(message="pong")
