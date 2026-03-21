import re
from typing import Set


class SimpleTextEmbedder:
    """Lightweight token-based embedder for Wave 3A skeleton."""

    TOKEN_RE = re.compile(r"[A-Za-z0-9_\-]+")

    def embed(self, text: str) -> Set[str]:
        if not text:
            return set()
        return {t.lower() for t in self.TOKEN_RE.findall(text)}
