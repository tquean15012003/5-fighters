import logging
from typing import List, Optional, Tuple

from langchain.vectorstores import Chroma
from langchain_core.documents import Document
from langchain.embeddings import OpenAIEmbeddings

from helpers.FsHelpers import load_json_file


logger = logging.getLogger(__name__)


class FAQsRetrieval:
    TOP_K = 10  # Number of top K documents to retrieve

    def __init__(self):
        embedding_function = OpenAIEmbeddings()
        self.db = Chroma(
            embedding_function=embedding_function, persist_directory="./docs/chroma_db"
        )
        no_documents = len(self.db.get()["documents"])

        if no_documents == 0:
            self.__load_documents_from_json()

        logger.info("FAQsRetrieval initialized")

    def __load_documents_from_json(self):
        logger.info("Loading data from JSON file!")
        data = load_json_file("./docs/5 Fighter Docs.json")

        logger.info(f"Document: {data}")
        texts = []
        metadatas = []
        for item in data:
            texts.append(item["question"])
            metadatas.append({"question": item["question"], "answer": item["answer"]})
        self.db.add_texts(texts=texts, metadatas=metadatas)

    def retrieve_faqs_content(self, query: str, k: Optional[int] = None) -> str:
        k = k if k != None else self.TOP_K
        logger.info(f"retrive_documents_in_text_format: query: {query}")
        documents_and_scores = self.retrieve_documents_with_scores(query=query, k=k)
        result_str = ""
        for document, scores in documents_and_scores:
            result_str += f"""Question: {document.metadata['question']}
Answer: {document.metadata['answer']}\n\n"""
        logger.info(f"retrive_documents_in_text_format: result: {result_str}")
        return result_str

    def retrieve_documents_with_scores(
        self, query, k=3
    ) -> List[Tuple[Document, float]]:
        return self.db.similarity_search_with_score(query, k=k)
