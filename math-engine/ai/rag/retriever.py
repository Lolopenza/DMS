from typing import List, Dict, Any

from .embedder import SimpleTextEmbedder
from .indexer import InMemoryRagIndex, RagDocument


def _jaccard(a: set, b: set) -> float:
    if not a and not b:
        return 0.0
    union = a | b
    if not union:
        return 0.0
    return len(a & b) / len(union)


class SimpleRagRetriever:
    """Token-overlap retriever for Wave 3A skeleton."""

    def __init__(self, index: InMemoryRagIndex, embedder: SimpleTextEmbedder):
        self.index = index
        self.embedder = embedder

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_vec = self.embedder.embed(query)
        scored: List[tuple[float, RagDocument]] = []

        for doc in self.index.all_documents():
            doc_vec = self.embedder.embed(f"{doc.title} {doc.content} {' '.join(doc.tags)}")
            score = _jaccard(query_vec, doc_vec)
            if score > 0:
                scored.append((score, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        top = scored[:top_k]

        return [
            {
                'score': round(score, 4),
                'id': doc.id,
                'subject': doc.subject,
                'title': doc.title,
                'content': doc.content,
                'tags': doc.tags,
            }
            for score, doc in top
        ]
