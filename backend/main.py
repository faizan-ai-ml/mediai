from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.api import chat, health, auth, symptom_checker, drug_checker, lab_interpreter, health_risk
from app.core.config import settings
from app.core.database import init_db
import os

# Initialize database tables (only in development)
if os.getenv("ENVIRONMENT") != "production":
    init_db()

app = FastAPI(
    title="MediAI Backend",
    description="Medical AI Assistant API with Authentication",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(symptom_checker.router, prefix="/api", tags=["symptoms"])
app.include_router(drug_checker.router, prefix="/api", tags=["drugs"])
app.include_router(lab_interpreter.router, prefix="/api", tags=["labs"])
app.include_router(health_risk.router, prefix="/api", tags=["health-risk"])

@app.get("/")
def root():
    return {
        "message": "🏥 MediAI Backend API v2.0",
        "version": "2.0.0",
        "features": ["AI Chat", "User Authentication", "Symptom Checker", "Drug Interaction Checker"],
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    print("🚀 Starting MediAI Backend v2.0...")
    print(f"📍 Server: http://{settings.HOST}:{settings.PORT}")
    print(f"📖 API Docs: http://{settings.HOST}:{settings.PORT}/docs")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )