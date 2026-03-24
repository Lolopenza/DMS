"""
AI Chatbot Service
Handles all AI chatbot interactions via Google Gemini API
"""
import os
from typing import Dict, List, Optional

import requests
from google import genai
from google.genai import types
from google.genai import errors as genai_errors
from dotenv import load_dotenv
from dmc_ai.rag.pipeline import get_rag_pipeline

_ai_dir = os.path.dirname(os.path.abspath(__file__))
_repo_root = os.path.dirname(_ai_dir)
load_dotenv(os.path.join(_repo_root, '.env'))


class ChatbotService:
    """Service for handling AI chatbot requests via Google Gemini API."""

    def __init__(self):
        self.api_key = os.environ.get("GOOGLE_AI_API_KEY", "")
        self.model_name = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
        self.groq_api_key = os.environ.get("GROQ_API_KEY", "")
        self.groq_model = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.client = None
        self.rag_pipeline = get_rag_pipeline()

        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)

    def _format_messages_for_groq(self, messages: List[Dict]) -> List[Dict[str, str]]:
        """Convert mixed messages to Groq chat-completions format."""
        out: List[Dict[str, str]] = []
        for msg in messages:
            role = msg.get('role', 'user')
            content = (msg.get('content') or '').strip()
            if not content:
                continue
            if role not in {'system', 'user', 'assistant'}:
                role = 'user'
            out.append({'role': role, 'content': content})
        return out

    def _chat_with_groq(self, messages: List[Dict]) -> Dict[str, str]:
        if not self.groq_api_key:
            return {'error': 'Groq fallback is not configured. Please set GROQ_API_KEY in your .env file.'}

        payload = {
            'model': self.groq_model,
            'messages': self._format_messages_for_groq(messages),
            'temperature': 0.7,
            'max_tokens': 2048,
        }

        if not payload['messages']:
            return {'error': 'No valid messages to send to Groq.'}

        try:
            response = requests.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.groq_api_key}',
                    'Content-Type': 'application/json',
                },
                json=payload,
                timeout=30,
            )

            if response.status_code == 429:
                return {'error': 'Groq rate limit exceeded. Please wait a minute.', 'status': 429}
            if response.status_code in {401, 403}:
                return {
                    'error': 'Groq API key invalid or restricted. Please verify GROQ_API_KEY.',
                    'status': response.status_code,
                }

            response.raise_for_status()
            data = response.json()
            choices = data.get('choices') or []
            if not choices:
                return {'error': 'Empty response from Groq. Please try again.', 'status': 502}
            message = choices[0].get('message') or {}
            reply = (message.get('content') or '').strip()
            if not reply:
                return {'error': 'Empty response from Groq. Please try again.', 'status': 502}
            return {'reply': reply}
        except requests.exceptions.Timeout:
            return {'error': 'Groq request timed out. Please try again.', 'status': 504}
        except requests.exceptions.ConnectionError:
            return {'error': 'Could not connect to Groq API.', 'status': 502}
        except requests.exceptions.HTTPError as e:
            status = e.response.status_code if e.response is not None else 502
            return {'error': f'Groq HTTP error: {e}', 'status': status}
        except Exception as e:
            return {'error': f'Groq Error: {e}', 'status': 500}

    def format_messages_for_gemini(self, messages: List[Dict]) -> List[Dict]:
        """
        Convert OpenAI-style messages to Gemini history format.

        OpenAI style:
            {"role": "user"|"assistant"|"system", "content": "...", "image": ...}
        Gemini style:
            {"role": "user"|"model", "parts": [...]}.
        """
        gemini_history = []
        for msg in messages:
            role = msg.get('role', 'user')
            gemini_role = 'model' if role == 'assistant' else 'user'

            text_content = msg.get('content') or ''
            if role == 'system' and text_content:
                text_content = f"[System]\n{text_content}"

            parts: List[object] = []
            if text_content:
                parts.append({'text': text_content})

            image = msg.get('image')
            if image is not None:
                # Keep compatibility with existing callers that may pass raw bytes,
                # Gemini-compatible image dicts, or URL/data strings.
                parts.append(image)

            if parts:
                gemini_history.append({"role": gemini_role, "parts": parts})

        return gemini_history

    def _extract_text(self, response) -> str:
        """Best-effort text extraction from Gemini response."""
        text = getattr(response, 'text', None)
        if text:
            return str(text).strip()

        candidates = getattr(response, 'candidates', None) or []
        chunks: List[str] = []
        for candidate in candidates:
            content = getattr(candidate, 'content', None)
            parts = getattr(content, 'parts', None) if content else None
            if not parts:
                continue
            for part in parts:
                part_text = getattr(part, 'text', None)
                if part_text:
                    chunks.append(str(part_text))

        return '\n'.join(chunks).strip()

    def chat(self, messages: List[Dict], subject: Optional[str] = None, module: Optional[str] = None) -> Dict[str, str]:
        """
        Send messages to Gemini and return model reply.

        Args:
            messages: List of message dicts with role/content. May include image.
            subject: Optional subject scope for retrieval, e.g. 'discrete-math'.
            module: Optional module scope for retrieval, e.g. 'combinatorics'.

        Returns:
            Dict with 'reply' or 'error'.
        """
        if not messages or not isinstance(messages, list):
            return {'error': 'Missing or invalid messages'}

        augmented_messages = self.rag_pipeline.augment_messages(messages, subject=subject, module=module)

        if not self.api_key or not self.client:
            return self._chat_with_groq(augmented_messages)

        try:
            formatted = self.format_messages_for_gemini(augmented_messages)
            if not formatted:
                return {'error': 'No valid messages to send to Gemini.'}

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=formatted,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    top_p=0.95,
                    max_output_tokens=2048,
                ),
            )

            reply = self._extract_text(response)
            if not reply:
                return {'error': 'Empty response from Gemini. Please try again.'}

            return {'reply': reply}

        except genai_errors.ClientError as e:
            code = getattr(e, 'code', None) or 0
            if code == 429:
                return self._chat_with_groq(augmented_messages)
            if code == 403:
                return self._chat_with_groq(augmented_messages)
            if code == 404:
                return self._chat_with_groq(augmented_messages)
            lower_msg = str(e).lower()
            if 'safety' in lower_msg or 'blocked' in lower_msg:
                return {
                    'error': 'Response blocked by Gemini safety filters. Please rephrase your request.',
                    'status': 422,
                }
            return {'error': f'Gemini Error: {e}', 'status': code if code else 500}
        except genai_errors.ServerError:
            return self._chat_with_groq(augmented_messages)
        except Exception as e:
            error_msg = str(e)
            lower_msg = error_msg.lower()
            if 'rate limit' in lower_msg or 'resource_exhausted' in lower_msg:
                return self._chat_with_groq(augmented_messages)
            if 'safety' in lower_msg or 'blocked' in lower_msg:
                return {
                    'error': 'Response blocked by Gemini safety filters. Please rephrase your request.',
                    'status': 422,
                }
            return {'error': f'Gemini Error: {error_msg}', 'status': 500}


_chatbot_service = None


def get_chatbot_service() -> ChatbotService:
    """Get singleton chatbot service instance"""
    global _chatbot_service
    if _chatbot_service is None:
        _chatbot_service = ChatbotService()
    return _chatbot_service
