"""Knowledge store — in-memory repository with interface ready for vector DB replacement."""
import json
import os
from typing import List, Optional, Dict
from pathlib import Path


class KnowledgeDocument:
    """A single knowledge document with metadata and text chunks."""
    def __init__(self, data: dict):
        self.document_id = data["document_id"]
        self.title = data["title"]
        self.source = data["source"]
        self.year = data["year"]
        self.authors = data.get("authors", "")
        self.topic = data["topic"]
        self.environmental_variables = data["environmental_variables"]
        self.evidence_type = data["evidence_type"]
        self.category = data["category"]
        self.text_chunks = data.get("text_chunks", [])

    def to_dict(self) -> dict:
        return {
            "document_id": self.document_id,
            "title": self.title,
            "source": self.source,
            "year": self.year,
            "authors": self.authors,
            "topic": self.topic,
            "environmental_variables": self.environmental_variables,
            "evidence_type": self.evidence_type,
            "category": self.category,
            "text_chunks": self.text_chunks,
        }


class KnowledgeStore:
    """
    In-memory knowledge store. Designed with a clean interface so it can be
    replaced by a vector database (pgvector, ChromaDB, etc.) without changing
    calling code.
    """

    def __init__(self):
        self._documents: Dict[str, KnowledgeDocument] = {}
        self._loaded = False

    def load(self, data_path: Optional[str] = None):
        """Load knowledge base from JSON file."""
        if data_path is None:
            # Resolve relative to this file
            base = Path(__file__).resolve().parent.parent.parent
            data_path = str(base / "data" / "knowledge_base.json")

        if not os.path.exists(data_path):
            print(f"Warning: Knowledge base not found at {data_path}")
            self._loaded = True
            return

        with open(data_path, "r", encoding="utf-8") as f:
            raw = json.load(f)

        for item in raw:
            doc = KnowledgeDocument(item)
            self._documents[doc.document_id] = doc

        self._loaded = True
        print(f"Loaded {len(self._documents)} knowledge documents")

    def get_by_id(self, document_id: str) -> Optional[KnowledgeDocument]:
        return self._documents.get(document_id)

    def get_all(self) -> List[KnowledgeDocument]:
        return list(self._documents.values())

    def search(
        self,
        variables: Optional[List[str]] = None,
        category: Optional[str] = None,
        topic: Optional[str] = None,
        evidence_type: Optional[str] = None,
        year_min: Optional[int] = None,
        keywords: Optional[List[str]] = None,
    ) -> List[KnowledgeDocument]:
        """Search documents by environmental variables, category, and keywords."""
        results = list(self._documents.values())

        if category:
            results = [d for d in results if d.category == category]

        if evidence_type:
            results = [d for d in results if d.evidence_type == evidence_type]

        if year_min:
            results = [d for d in results if d.year >= year_min]

        if topic:
            topic_lower = topic.lower()
            results = [d for d in results if topic_lower in d.topic.lower()]

        if variables:
            # Score by variable overlap
            def var_score(doc: KnowledgeDocument) -> int:
                doc_vars_lower = [v.lower().replace(" ", "_") for v in doc.environmental_variables]
                return sum(1 for v in variables if v.lower().replace(" ", "_") in doc_vars_lower
                           or any(v.lower() in dv for dv in doc_vars_lower))
            results = [d for d in results if var_score(d) > 0]
            results.sort(key=lambda d: var_score(d), reverse=True)

        if keywords:
            def keyword_score(doc: KnowledgeDocument) -> int:
                text = (doc.title + " " + doc.topic + " " + " ".join(doc.text_chunks)).lower()
                return sum(1 for kw in keywords if kw.lower() in text)
            results = [d for d in results if keyword_score(d) > 0]
            results.sort(key=lambda d: keyword_score(d), reverse=True)

        return results


# Singleton instance
knowledge_store = KnowledgeStore()
