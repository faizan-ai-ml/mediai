from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.api import chat, health, auth
from app.core.config import settings
from app.core.database import init_db

# Initialize database tables
# Initialize database tables (only in development)
import os
if os.getenv("ENVIRONMENT") != "production":
    init_db()


# Create FastAPI app
app = FastAPI(
    title="MediAI Backend",
    description="Medical AI Assistant API with Authentication",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api", tags=["chat"])

@app.get("/")
def root():
    return {
        "message": "🏥 MediAI Backend API v2.0",
        "version": "2.0.0",
        "features": ["AI Chat", "User Authentication", "Chat History"],
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    print("🚀 Starting MediAI Backend v2.0...")
    print(f"📍 Server: http://{settings.HOST}:{settings.PORT}")
    print(f"📖 API Docs: http://{settings.HOST}:{settings.PORT}/docs")
    print("✅ Database tables initialized!")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )