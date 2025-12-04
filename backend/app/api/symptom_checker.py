from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import httpx
import json
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import User

router = APIRouter()

class Symptom(BaseModel):
    name: str
    severity: int  # 1-10
    duration_days: int

class SymptomCheckRequest(BaseModel):
    symptoms: List[Symptom]
    age: Optional[int] = None
    gender: Optional[str] = None
    existing_conditions: Optional[List[str]] = []

class Condition(BaseModel):
    name: str
    probability: float
    description: str

class SymptomCheckResponse(BaseModel):
    conditions: List[Condition]
    urgency_level: str  # "emergency", "urgent", "moderate", "low"
    emergency: bool
    recommendation: str
    next_steps: List[str]

@router.post("/check-symptoms", response_model=SymptomCheckResponse)
async def check_symptoms(
    request: SymptomCheckRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze symptoms and provide differential diagnosis
    """
    
    # Emergency keywords detection
    emergency_keywords = [
        "chest pain", "can't breathe", "difficulty breathing", "severe bleeding",
        "loss of consciousness", "stroke", "heart attack", "suicide", "overdose",
        "severe head injury", "paralysis", "seizure", "can't speak"
    ]
    
    # Check for emergency symptoms
    emergency_detected = False
    for symptom in request.symptoms:
        if any(keyword in symptom.name.lower() for keyword in emergency_keywords):
            emergency_detected = True
            break
    
    # Build symptom description
    symptom_list = []
    for s in request.symptoms:
        symptom_list.append(
            f"- {s.name} (severity: {s.severity}/10, duration: {s.duration_days} days)"
        )
    
    symptoms_text = "\n".join(symptom_list)
    
    # Patient context
    context = []
    if request.age:
        context.append(f"Age: {request.age}")
    if request.gender:
        context.append(f"Gender: {request.gender}")
    if request.existing_conditions:
        context.append(f"Existing conditions: {', '.join(request.existing_conditions)}")
    
    context_text = "\n".join(context) if context else "No additional context provided"
    
    # Smart AI Prompt for medical analysis
    system_prompt = """You are an expert medical diagnostic assistant. Your role is to analyze symptoms and provide differential diagnosis.

CRITICAL RULES:
1. Always provide 3-5 possible conditions ranked by probability
2. Consider severity and duration of symptoms
3. Factor in patient age, gender, and existing conditions
4. NEVER provide definitive diagnosis - only possibilities
5. Always recommend professional medical evaluation
6. Detect emergency situations and prioritize urgent care

URGENCY LEVELS:
- EMERGENCY: Life-threatening (chest pain, stroke, severe bleeding, can't breathe)
- URGENT: See doctor within 24 hours (high fever, severe pain, concerning symptoms)
- MODERATE: Schedule appointment this week (persistent symptoms, mild-moderate severity)
- LOW: Monitor at home, improve with rest (mild symptoms, common conditions)

OUTPUT FORMAT (JSON):
{
    "conditions": [
        {
            "name": "condition name",
            "probability": 0.0-1.0,
            "description": "brief explanation why this is likely"
        }
    ],
    "urgency_level": "emergency|urgent|moderate|low",
    "emergency": true|false,
    "recommendation": "Clear recommendation in 1-2 sentences",
    "next_steps": ["step 1", "step 2", "step 3"]
}

Be empathetic, clear, and actionable. Prioritize patient safety."""

    user_prompt = f"""Analyze these symptoms:

SYMPTOMS:
{symptoms_text}

PATIENT CONTEXT:
{context_text}

Provide a differential diagnosis with possible conditions, urgency assessment, and recommendations.
Remember: Output ONLY valid JSON, no additional text."""

    try:
        # Call AI with structured prompt
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "MediAI-SymptomChecker"
                },
                json={
                    "model": settings.OPENROUTER_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.3,  # Lower temperature for more consistent medical analysis
                    "max_tokens": 2000
                }
            )
            
            response.raise_for_status()
            data = response.json()
            ai_response = data["choices"][0]["message"]["content"]
            
            # Parse JSON response
            # Remove markdown code blocks if present
            ai_response = ai_response.strip()
            if ai_response.startswith("```json"):
                ai_response = ai_response[7:]
            if ai_response.startswith("```"):
                ai_response = ai_response[3:]
            if ai_response.endswith("```"):
                ai_response = ai_response[:-3]
            ai_response = ai_response.strip()
            
            result = json.loads(ai_response)
            
            # Override with emergency detection if keywords found
            if emergency_detected:
                result["emergency"] = True
                result["urgency_level"] = "emergency"
                result["recommendation"] = "🚨 CALL 1122 IMMEDIATELY - This may be a medical emergency!"
                result["next_steps"] = [
                    "Call emergency services (1122) right now",
                    "Do not drive yourself - wait for ambulance",
                    "Stay calm and follow dispatcher instructions"
                ]
            
            return SymptomCheckResponse(**result)
            
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        print(f"AI Response: {ai_response}")
        raise HTTPException(
            status_code=500,
            detail="Failed to parse AI response. Please try again."
        )
    except httpx.HTTPStatusError as e:
        print(f"HTTP Error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"AI API error: {e.response.text}"
        )
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Symptom analysis failed: {str(e)}"
        )


@router.get("/common-symptoms")
def get_common_symptoms():
    """
    Return list of common symptoms for quick selection
    """
    return {
        "categories": {
            "General": [
                "Fever", "Fatigue", "Weakness", "Weight loss", "Night sweats",
                "Chills", "Loss of appetite"
            ],
            "Head & Neck": [
                "Headache", "Dizziness", "Sore throat", "Runny nose",
                "Nasal congestion", "Earache", "Eye pain", "Vision changes"
            ],
            "Respiratory": [
                "Cough", "Shortness of breath", "Wheezing", "Chest pain",
                "Difficulty breathing", "Chest tightness"
            ],
            "Digestive": [
                "Nausea", "Vomiting", "Diarrhea", "Constipation",
                "Abdominal pain", "Bloating", "Heartburn"
            ],
            "Musculoskeletal": [
                "Joint pain", "Muscle pain", "Back pain", "Neck pain",
                "Stiffness", "Swelling"
            ],
            "Skin": [
                "Rash", "Itching", "Hives", "Skin redness", "Bruising"
            ],
            "Neurological": [
                "Numbness", "Tingling", "Confusion", "Memory problems",
                "Tremors", "Seizures"
            ],
            "Other": [
                "Difficulty sleeping", "Anxiety", "Depression", "Palpitations",
                "Frequent urination", "Blood in urine"
            ]
        }
    }