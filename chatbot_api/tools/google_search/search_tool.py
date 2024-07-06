from tools.google_search.web_content_crawler import WebContentCrawler
from tools.google_search.embedding_retriever import EmbeddingRetriever
from langchain_core.documents import Document
from typing import List


def search_google(query: str) -> str:
    web_content_crawler = WebContentCrawler(query)
    contents, serper_response = web_content_crawler.fetch()
    if len(serper_response["links"]) == 0 or len(contents) == 0:
        return "There is no content from this tools. Please use FAQs Search tool."
    # Create an EmbeddingRetriever instance and retrieve relevant documents
    retriever = EmbeddingRetriever()

    relevant_docs_list = retriever.retrieve_embeddings(
        contents, serper_response["links"], query
    )

    return format_contents(relevant_docs_list)


def format_contents(contents: List[Document]) -> str:
    formatted_string = "Information from Google Search"
    for i, content in enumerate(contents):
        formatted_string += (
            f"Paragraph from link {content.metadata['url']}: [{content.page_content}]"
        )
    formatted_string = formatted_string + ". End Information from Google Search"
    return formatted_string
