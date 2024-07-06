from tools.faqs_search.faqs_retrieval import FAQsRetrieval


def search_faqs(query: str) -> str:
    faq_retriever = FAQsRetrieval()
    return faq_retriever.retrieve_faqs_content(query=query)
