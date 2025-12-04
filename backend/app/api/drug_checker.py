from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import httpx
import json
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import User

router = APIRouter()

class Medication(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None

class DrugCheckRequest(BaseModel):
    medications: List[Medication]
    include_food_interactions: bool = True
    include_alcohol_interactions: bool = True

class Interaction(BaseModel):
    drug1: str
    drug2: str
    severity: str
    description: str
    recommendation: str

class DrugCheckResponse(BaseModel):
    interactions: List[Interaction]
    overall_risk: str
    food_warnings: Optional[List[str]] = []
    alcohol_warning: Optional[str] = None
    general_advice: str

@router.post("/check-interactions", response_model=DrugCheckResponse)
async def check_drug_interactions(
    request: DrugCheckRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if len(request.medications) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least 2 medications to check interactions"
        )
    
    med_list = []
    for med in request.medications:
        med_str = med.name
        if med.dosage:
            med_str += f" ({med.dosage})"
        if med.frequency:
            med_str += f" - {med.frequency}"
        med_list.append(med_str)
    
    medications_text = "\n".join([f"- {med}" for med in med_list])
    
    system_prompt = """You are an expert clinical pharmacist specializing in drug interactions.

CRITICAL RULES:
1. Identify ALL potential drug-drug interactions
2. Classify severity: CONTRAINDICATED, MAJOR, MODERATE, MINOR
3. Provide clear explanations
4. Suggest alternatives when dangerous

OUTPUT FORMAT (JSON):
{
    "interactions": [
        {
            "drug1": "medication name",
            "drug2": "medication name",
            "severity": "minor|moderate|major|contraindicated",
            "description": "clear explanation",
            "recommendation": "what to do"
        }
    ],
    "overall_risk": "safe|monitor|caution|dangerous",
    "food_warnings": ["foods to avoid"],
    "alcohol_warning": "alcohol warning if applicable",
    "general_advice": "overall guidance"
}"""

    user_prompt = f"""Analyze these medications for interactions:

MEDICATIONS:
{medications_text}

Include food interactions: {request.include_food_interactions}
Include alcohol interactions: {request.include_alcohol_interactions}

Output ONLY valid JSON."""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "MediAI-DrugChecker"
                },
                json={
                    "model": settings.OPENROUTER_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.2,
                    "max_tokens": 2500
                }
            )
            
            response.raise_for_status()
            data = response.json()
            ai_response = data["choices"][0]["message"]["content"]
            
            ai_response = ai_response.strip()
            if ai_response.startswith("```json"):
                ai_response = ai_response[7:]
            if ai_response.startswith("```"):
                ai_response = ai_response[3:]
            if ai_response.endswith("```"):
                ai_response = ai_response[:-3]
            ai_response = ai_response.strip()
            
            result = json.loads(ai_response)
            return DrugCheckResponse(**result)
            
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Drug check failed: {str(e)}")


@router.get("/common-medications")
def get_common_medications():
    return {
        "categories": {
            "Pain Relief": [
                "Acetaminophen (Tylenol)",
                "Ibuprofen (Advil, Motrin)",
                "Aspirin",
                "Naproxen (Aleve)"
            ],
            "Blood Pressure": [
                "Lisinopril",
                "Amlodipine",
                "Losartan",
                "Metoprolol"
            ],
            "Cholesterol": [
                "Atorvastatin (Lipitor)",
                "Simvastatin"
            ],
            "Diabetes": [
                "Metformin",
                "Insulin"
            ],
            "Antibiotics": [
                "Amoxicillin",
                "Azithromycin (Z-Pack)"
            ],
            "Mental Health": [
                "Sertraline (Zoloft)",
                "Escitalopram (Lexapro)",
                "Alprazolam (Xanax)"
            ],
            "Anticoagulants": [
                "Warfarin (Coumadin)",
                "Apixaban (Eliquis)"
            ]
        }
    }