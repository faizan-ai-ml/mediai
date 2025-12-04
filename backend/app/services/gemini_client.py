"""
Google Gemini Client - Free tier LLM integration

Free tier: 1,500 requests per day
Get API key: https://makersuite.google.com/app/apikey
"""

from typing import List, Dict
import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiClient:
    """Client for Google Gemini API"""
    
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        
    async def generate(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1500
    ) -> str:
        """Generate response using Gemini
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            temperature: Creativity (0.0-1.0)
            max_tokens: Max response length
            
        Returns:
            Generated text response
        """
        try:
            # Convert messages to Gemini format
            prompt = self._format_messages(messages)
            
            # Configure generation
            generation_config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
            
            # Generate response
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"Gemini error: {str(e)}")
            if "API_KEY" in str(e):
                raise Exception("Invalid Gemini API key. Get one at: https://makersuite.google.com/app/apikey")
            raise
    
    def _format_messages(self, messages: List[Dict[str, str]]) -> str:
        """Convert OpenAI-style messages to Gemini prompt"""
        prompt_parts = []
        
        for msg in messages:
            role = msg["role"]
            content = msg["content"]
            
            if role == "system":
                prompt_parts.append(f"Instructions: {content}\n")
            elif role == "user":
                prompt_parts.append(f"User: {content}\n")
            elif role == "assistant":
                prompt_parts.append(f"Assistant: {content}\n")
        
        return "\n".join(prompt_parts)