from tools.google_search.web_content_searcher import WebContentSearcher
from typing import List

def search_google(query: str) -> str:
    web_content_searcher = WebContentSearcher(query)
    contents, _ = web_content_searcher.fetch()
    return format_contents(contents)

def format_contents(contents: List[str]) -> str:
    formatted_string = "Information from Google Search"
    for i, content in enumerate(contents):
        formatted_string += f"Paragraph {i}: [{content}]"
    formatted_string = formatted_string + ". End Information from Google Search"
    return formatted_string
