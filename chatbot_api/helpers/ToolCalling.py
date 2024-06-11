import logging
from tools.google_search.search_tool import search_google

logging.basicConfig(level=logging.INFO, force=True)
logger = logging.getLogger(__name__)

AVAILABLE_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_google",
            "description": "Get information from google",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Query want to search on Google",
                    },
                },
                "required": ["query"],
            },
        },
    },
]


FUNCTION_MAP = {
    "search_google": search_google,
}
