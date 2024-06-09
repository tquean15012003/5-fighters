import logging

logging.basicConfig(level=logging.INFO, force=True)
logger = logging.getLogger(__name__)

AVAILABLE_TOOLS = [
    {"type": "code_interpreter"},
    {
        "type": "function",
        "function": {
            "name": "getCurrentWeather",
            "description": "Get the weather in location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state e.g. San Francisco, CA",
                    },
                },
                "required": ["location"],
            },
        },
    },
]


def getCurrentWeather(location: str):
    logger.info(f"__getCurrentWeather called with parameters: location: {location}")
    return "The weather is 75 degrees"


FUNCTION_MAP = {
    "getCurrentWeather": getCurrentWeather,
}
