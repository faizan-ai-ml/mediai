from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.config import settings
from app. core.database import get_db
from app. core.auth import get_current_user
from app.models.models import User, Conversation, Message
from app.services.llm_service import LLMService

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None

class ChatResponse(BaseModel):
    response: str
    timestamp: str
    conversation_id: str
    provider: str  # Which LLM was used

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Chat with AI - saves conversation history and uses LLM service
    """
    try:
        if not request.message. strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Get or create conversation
        if request.conversation_id:
            conversation = db.query(Conversation).filter(
                Conversation. id == request.conversation_id,
                Conversation.user_id == current_user.id
            ).first()
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")
        else:
            # Create new conversation
            conversation = Conversation(
                user_id=current_user.id,
                title=request.message[:50]  # Use first 50 chars as title
            )
            db. add(conversation)
            db.commit()
            db.refresh(conversation)
        
        # Save user message
        user_message = Message(
            conversation_id=conversation.id,
            role="user",
            content=request.message
        )
        db.add(user_message)
        db.commit()
        
        # 🔥 NEW: Load conversation history (last 10 messages for context)
        previous_messages = db.query(Message).filter(
            Message.conversation_id == conversation.id
        ).order_by(Message. created_at.desc()).limit(10).all()
        
        # Reverse to get chronological order
        previous_messages = list(reversed(previous_messages))
        
        # Build message history for AI
        system_prompt = """You are MediAI, a helpful medical AI assistant. 

Guidelines:
1. Provide accurate health information and guidance
2. Always include appropriate medical disclaimers
3. Never diagnose conditions - suggest consulting healthcare professionals
4. For emergencies, direct to emergency services immediately
5. Use clear, simple language
6. Ask clarifying questions when needed
7.  Be empathetic and supportive

IMPORTANT: You are not a replacement for professional medical advice."""

        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        for msg in previous_messages[:-1]:  # Exclude the last message (current one)
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Add current message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        # 🔥 NEW: Use LLM Service with fallback
        llm_service = LLMService()
        result = await llm_service.generate_response(
            messages=messages,
            temperature=0.7,
            max_tokens=1500
        )
        
        ai_response = result["content"]
        provider_used = result["provider"]
        
        # Save AI response
        assistant_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=ai_response
        )
        db.add(assistant_message)
        db.commit()
        
        return ChatResponse(
            response=ai_response,
            timestamp=datetime.utcnow().isoformat(),
            conversation_id=conversation. id,
            provider=provider_used  # Show which LLM was used
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router. get("/conversations")
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all conversations for current user
    """
    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).all()
    
    return [
        {
            "id": conv.id,
            "title": conv.title,
            "created_at": conv.created_at.isoformat(),
            "updated_at": conv.updated_at.isoformat(),
            "message_count": len(conv.messages)
        }
        for conv in conversations
    ]

@router.get("/conversations/{conversation_id}")
def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all messages in a conversation
    """
    conversation = db.query(Conversation). filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at). all()
    
    return {
        "conversation": {
            "id": conversation. id,
            "title": conversation.title,
            "created_at": conversation.created_at. isoformat()
        },
        "messages": [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat()
            }
            for msg in messages
        ]
    }