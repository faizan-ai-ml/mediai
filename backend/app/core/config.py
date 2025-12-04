from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Server
    ENVIRONMENT: str = "development"
    HOST: str = "0. 0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    
    # LLM Provider Selection
    PRIMARY_LLM_PROVIDER: str = "ollama"  # Options: ollama, gemini, openrouter
    
    # Ollama Configuration (Local - FREE)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    
    # Google Gemini Configuration (Free tier: 1,500 req/day)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-pro"
    
    # OpenRouter (Fallback - Paid)
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "deepseek/deepseek-chat"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()