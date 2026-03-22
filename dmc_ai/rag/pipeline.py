import logging
import os
from typing import List, Dict, Any

from .embedder import SimpleTextEmbedder
from .indexer import InMemoryRagIndex, RagDocument
from .retriever import SimpleRagRetriever


DEFAULT_DOCS = [
    RagDocument(
        id='dm-combinatorics-1',
        subject='discrete-math',
        title='Permutations and combinations',
        content='Permutations are ordered selections. Combinations are unordered selections. Use factorial formulas nPr and nCr.',
        tags=['combinatorics', 'factorial', 'npr', 'ncr'],
    ),
    RagDocument(
        id='dm-logic-1',
        subject='discrete-math',
        title='Truth tables and equivalence',
        content='Truth tables evaluate formulas over all boolean assignments and help verify logical equivalence.',
        tags=['logic', 'truth-table', 'equivalence'],
    ),
    RagDocument(
        id='la-matrix-1',
        subject='linear-algebra',
        title='Matrix multiplication basics',
        content='Matrix multiplication AB is defined when columns of A equal rows of B. Dot products form each output cell.',
        tags=['linear-algebra', 'matrix', 'multiplication'],
    ),
    RagDocument(
        id='la-vector-1',
        subject='linear-algebra',
        title='Vector norm',
        content='Euclidean norm of vector v is sqrt(sum(v_i^2)). It measures vector length in 2D and higher dimensions.',
        tags=['linear-algebra', 'vector', 'norm'],
    ),
]


class RagPipeline:
    """Wave 3A baseline RAG pipeline with in-memory retrieval."""

    def __init__(self):
        self.index = InMemoryRagIndex()
        self.embedder = SimpleTextEmbedder()
        self.retriever = SimpleRagRetriever(self.index, self.embedder)
        self.logger = logging.getLogger('rag.pipeline')
        self.debug = os.getenv('RAG_DEBUG', 'false').lower() in {'1', 'true', 'yes', 'on'}
        self._bootstrapped = False

    def bootstrap(self) -> None:
        if self._bootstrapped:
            return
        self.index.add_documents(DEFAULT_DOCS)
        self._bootstrapped = True

    def _normalize(self, value: str) -> str:
        return (value or '').strip().lower()

    def _matches_scope(self, hit: Dict[str, Any], subject: str | None, module: str | None) -> bool:
        norm_subject = self._normalize(subject)
        norm_module = self._normalize(module)

        if norm_subject and self._normalize(str(hit.get('subject', ''))) != norm_subject:
            return False

        if not norm_module:
            return True

        haystack_parts = [
            str(hit.get('id', '')),
            str(hit.get('title', '')),
            str(hit.get('content', '')),
            ' '.join(hit.get('tags', []) or []),
        ]
        haystack = ' '.join(haystack_parts).lower()
        return norm_module.replace('-', ' ') in haystack or norm_module in haystack

    def retrieve(
        self,
        query: str,
        top_k: int = 3,
        subject: str | None = None,
        module: str | None = None,
    ) -> List[Dict[str, Any]]:
        self.bootstrap()
        base_hits = self.retriever.retrieve(query, top_k=max(top_k * 8, 16))
        if self.debug:
            base_ids = [h.get('id') for h in base_hits[:top_k]]
            self.logger.info(
                "RAG retrieve base: query=%r subject=%r module=%r top=%s ids=%s",
                query,
                subject,
                module,
                top_k,
                base_ids,
            )
        scoped_hits = [h for h in base_hits if self._matches_scope(h, subject, module)]
        final_hits = scoped_hits[:top_k]
        if self.debug:
            final_ids = [h.get('id') for h in final_hits]
            self.logger.info(
                "RAG retrieve scoped: query=%r subject=%r module=%r top=%s ids=%s",
                query,
                subject,
                module,
                top_k,
                final_ids,
            )
        return final_hits

    def build_context(
        self,
        query: str,
        top_k: int = 3,
        subject: str | None = None,
        module: str | None = None,
    ) -> str:
        hits = self.retrieve(query, top_k=top_k, subject=subject, module=module)
        if not hits:
            return ''

        lines = ['Use retrieved educational context when relevant:']
        for i, hit in enumerate(hits, start=1):
            lines.append(f"{i}. [{hit['subject']}] {hit['title']}: {hit['content']}")
        return '\n'.join(lines)

    def augment_messages(
        self,
        messages: List[Dict[str, Any]],
        subject: str | None = None,
        module: str | None = None,
    ) -> List[Dict[str, Any]]:
        if not messages:
            return messages

        last_user = next((m for m in reversed(messages) if m.get('role') == 'user'), None)
        query = (last_user or {}).get('content', '')
        context = self.build_context(query, subject=subject, module=module)
        if not context:
            return messages

        system_msg = {
            'role': 'system',
            'content': (
                'You are an educational math tutor for IT students. '
                'Explain step by step and keep notation clear.\n' + context
            ),
        }

        has_system = any(m.get('role') == 'system' for m in messages)
        if has_system:
            out = list(messages)
            for idx, msg in enumerate(out):
                if msg.get('role') == 'system':
                    out[idx] = {'role': 'system', 'content': f"{msg.get('content', '')}\n\n{context}"}
                    break
            return out

        return [system_msg, *messages]


_pipeline = None


def get_rag_pipeline() -> RagPipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = RagPipeline()
    return _pipeline
