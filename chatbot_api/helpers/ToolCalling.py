import logging

from tools.faqs_search.faqs_tool import search_faqs
from tools.google_search.search_tool import search_google

logging.basicConfig(level=logging.INFO, force=True)
logger = logging.getLogger(__name__)

AVAILABLE_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_google",
            "description": "Use to get information about 5Fighters competitors' products on google.",
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
    {
        "type": "function",
        "function": {
            "name": "search_faqs",
            "description": "Use to retrieve all information about 5Fighters.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Query want to search on FAQs",
                    },
                },
                "required": ["query"],
            },
        },
    },
]


FUNCTION_MAP = {"search_google": search_google, "search_faqs": search_faqs}
