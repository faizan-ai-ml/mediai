"""
Ollama Client - Free local LLM integration

Runs LLMs locally on your machine (FREE!)
Supports: Llama 3.2, Mistral, and other Ollama models
"""

from typing import List, Dict
import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class OllamaClient:
    """Client for Ollama local LLM"""
    
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        
    async def generate(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1500
    ) -> str:
        """Generate response using Ollama
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            temperature: Creativity (0.0-1.0)
            max_tokens: Max response length
            
        Returns:
            Generated text response
        """
        try:
            # Convert messages to Ollama format
            prompt = self._format_messages(messages)
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": temperature,
                            "num_predict": max_tokens
                        }
                    }
                )
                
                response.raise_for_status()
                data = response.json()
                return data["response"]
                
        except httpx.ConnectError:
            logger.error("Cannot connect to Ollama. Is it running?")
            raise Exception("Ollama not available. Install from: https://ollama.ai")
        except Exception as e:
            logger.error(f"Ollama error: {str(e)}")
            raise
    
    def _format_messages(self, messages: List[Dict[str, str]]) -> str:
        """Convert OpenAI-style messages to Ollama prompt"""
        prompt_parts = []
        
        for msg in messages:
            role = msg["role"]
            content = msg["content"]
            
            if role == "system":
                prompt_parts.append(f"System: {content}\n")
            elif role == "user":
                prompt_parts.append(f"User: {content}\n")
            elif role == "assistant":
                prompt_parts.append(f"Assistant: {content}\n")
        
        prompt_parts.append("Assistant:")
        return "\n".join(prompt_parts)
    
    async def is_available(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except:
            return False
