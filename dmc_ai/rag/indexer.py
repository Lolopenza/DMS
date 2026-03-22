from dataclasses import dataclass, field
from typing import List, Dict, Any


@dataclass
class RagDocument:
    id: str
    subject: str
    title: str
    content: str
    tags: List[str] = field(default_factory=list)


class InMemoryRagIndex:
    """Simple in-memory index used as Wave 3A baseline."""

    def __init__(self):
        self._docs: List[RagDocument] = []

    def add_documents(self, docs: List[RagDocument]) -> None:
        self._docs.extend(docs)

    def all_documents(self) -> List[RagDocument]:
        return list(self._docs)

    def as_dicts(self) -> List[Dict[str, Any]]:
        return [
            {
                'id': d.id,
                'subject': d.subject,
                'title': d.title,
                'content': d.content,
                'tags': d.tags,
            }
            for d in self._docs
        ]
