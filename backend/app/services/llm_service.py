"""
LLM Service - Abstraction layer for multiple LLM providers

Supports:
- Ollama (local, free)
- Google Gemini (free tier: 1,500 req/day)
- OpenRouter (paid, fallback)
"""

from typing import List, Dict, Optional
import logging
from app.core.config import settings
from app.services.ollama_client import OllamaClient
from app.services.gemini_client import GeminiClient
import httpx

logger = logging.getLogger(__name__)


class LLMService:
    """Main LLM service with fallback support"""
    
    def __init__(self):
        self.ollama = OllamaClient()
        self.gemini = GeminiClient()
        self.primary_provider = settings.PRIMARY_LLM_PROVIDER
        
    async def generate_response(
        self, 
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1500
    ) -> Dict[str, any]:
        """Generate AI response with automatic fallback
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            temperature: Creativity (0.0-1.0)
            max_tokens: Max response length
            
        Returns:
            Dict with 'content', 'provider', 'success'
        """
        
        # Try providers in order based on primary setting
        providers = self._get_provider_order()
        
        for provider_name in providers:
            try:
                logger.info(f"Attempting LLM provider: {provider_name}")
                
                if provider_name == "ollama":
                    response = await self.ollama.generate(messages, temperature, max_tokens)
                elif provider_name == "gemini":
                    response = await self.gemini.generate(messages, temperature, max_tokens)
                elif provider_name == "openrouter":
                    response = await self._openrouter_generate(messages, temperature, max_tokens)
                else:
                    continue
                
                logger.info(f"✅ Success with {provider_name}")
                return {
                    "content": response,
                    "provider": provider_name,
                    "success": True
                }
                
            except Exception as e:
                logger.warning(f"❌ {provider_name} failed: {str(e)}")
                continue
        
        # All providers failed
        logger.error("All LLM providers failed!")
        raise Exception("Unable to generate AI response. All providers failed.")
    
    def _get_provider_order(self) -> List[str]:
        """Get provider order based on primary setting"""
        if self.primary_provider == "ollama":
            return ["ollama", "gemini", "openrouter"]
        elif self.primary_provider == "gemini":
            return ["gemini", "ollama", "openrouter"]
        else:  # openrouter
            return ["openrouter", "gemini", "ollama"]
    
    async def _openrouter_generate(
        self,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int
    ) -> str:
        """OpenRouter API call (existing implementation)"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "MediAI"
                },
                json={
                    "model": settings.OPENROUTER_MODEL,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }
            )
            
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
