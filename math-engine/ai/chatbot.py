"""
AI Chatbot Service
Handles all AI chatbot interactions via OpenRouter API
"""
import os
from openai import OpenAI
from typing import List, Dict, Optional
from dotenv import load_dotenv
from ai.rag.pipeline import get_rag_pipeline

_ai_dir = os.path.dirname(os.path.abspath(__file__))
_math_engine_root = os.path.dirname(_ai_dir)
_repo_root = os.path.dirname(_math_engine_root)
load_dotenv(os.path.join(_repo_root, '.env'))
load_dotenv(os.path.join(_math_engine_root, '.env'), override=True)


class ChatbotService:
    """Service for handling AI chatbot requests"""
    
    def __init__(self):
        self.api_key = os.environ.get("OPENROUTER_API_KEY", "")
        self.model = os.environ.get("OPENROUTER_MODEL", "google/gemma-3-12b-it:free")
        self.client = None
        self.rag_pipeline = get_rag_pipeline()
        
        if self.api_key:
            self.client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=self.api_key,
            )
    
    def format_messages(self, messages: List[Dict]) -> List[Dict]:
        """
        Format messages for vision-capable models
        Converts messages with images to the correct format
        """
        formatted_messages = []
        for msg in messages:
            if msg.get('role') == 'user' and msg.get('image'):
                # Message with image - use vision format
                content = [
                    {"type": "text", "text": msg.get('content', 'What is in this image?')},
                    {"type": "image_url", "image_url": {"url": msg['image']}}
                ]
                formatted_messages.append({"role": "user", "content": content})
            else:
                # Text-only message
                formatted_messages.append({"role": msg['role'], "content": msg['content']})
        
        return formatted_messages
    
    def chat(self, messages: List[Dict], subject: Optional[str] = None, module: Optional[str] = None) -> Dict[str, str]:
        """
        Send messages to AI and get response
        
        Args:
            messages: List of message dicts with 'role' and 'content'
                    Can include 'image' field for vision support
            subject: Optional subject scope for retrieval, e.g. 'discrete-math'
            module: Optional module scope for retrieval, e.g. 'combinatorics'
        
        Returns:
            Dict with 'reply' or 'error'
        """
        if not self.client:
            return {'error': 'OpenRouter API key is not set. Please set OPENROUTER_API_KEY in your .env file.'}
        
        if not messages or not isinstance(messages, list):
            return {'error': 'Missing or invalid messages'}
        
        try:
            augmented_messages = self.rag_pipeline.augment_messages(messages, subject=subject, module=module)
            formatted_messages = self.format_messages(augmented_messages)
            
            completion = self.client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": "http://localhost:5000",
                    "X-Title": "Discrete Math Calculator",
                },
                extra_body={},
                model=self.model,
                messages=formatted_messages
            )

            reply_raw = completion.choices[0].message.content if completion.choices else None
            reply = (reply_raw or '').strip()
            if not reply:
                return {
                    'error': 'Empty response from AI provider. Please try again in a few seconds.'
                }
            return {'reply': reply}
            
        except Exception as e:
            error_msg = str(e)
            if '429' in error_msg or 'rate limit' in error_msg.lower() or 'too many requests' in error_msg.lower():
                return {
                    'error': 'Rate limit exceeded (429). Please wait 10-30 seconds and try again.'
                }
            # Check for authentication errors
            if '401' in error_msg or 'User not found' in error_msg:
                return {
                    'error': 'Invalid API key. Please check your OPENROUTER_API_KEY in .env file. Get a new key at https://openrouter.ai/keys'
                }
            # Check for insufficient credits
            if '402' in error_msg or 'insufficient' in error_msg.lower():
                return {
                    'error': 'Insufficient credits. Please add credits to your OpenRouter account at https://openrouter.ai/credits'
                }
            return {'error': f'API Error: {error_msg}'}


# Singleton instance
_chatbot_service = None

def get_chatbot_service() -> ChatbotService:
    """Get singleton chatbot service instance"""
    global _chatbot_service
    if _chatbot_service is None:
        _chatbot_service = ChatbotService()
    return _chatbot_service
