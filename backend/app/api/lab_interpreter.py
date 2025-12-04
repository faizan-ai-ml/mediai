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

class LabValue(BaseModel):
    test_name: str
    value: float | str
    unit: Optional[str] = None

class LabInterpretRequest(BaseModel):
    lab_values: List[LabValue]
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None

class LabResult(BaseModel):
    test_name: str
    value: str
    unit: str
    status: str  # "normal", "high", "low", "critical"
    reference_range: str
    explanation: str
    clinical_significance: str
    recommendation: str

class LabInterpretResponse(BaseModel):
    results: List[LabResult]
    overall_assessment: str
    priority_concerns: List[str]
    recommended_actions: List[str]

@router.post("/interpret-labs", response_model=LabInterpretResponse)
async def interpret_lab_results(
    request: LabInterpretRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Interpret lab results and explain in plain English
    """
    
    if len(request.lab_values) == 0:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least one lab value"
        )
    
    # Build lab values text
    lab_values_text = []
    for lab in request.lab_values:
        lab_str = f"- {lab.test_name}: {lab.value}"
        if lab.unit:
            lab_str += f" {lab.unit}"
        lab_values_text.append(lab_str)
    
    labs_text = "\n".join(lab_values_text)
    
    # Patient context
    context = []
    if request.patient_age:
        context.append(f"Age: {request.patient_age}")
    if request.patient_gender:
        context.append(f"Gender: {request.patient_gender}")
    
    context_text = "\n".join(context) if context else "No patient context provided"
    
    # Enhanced system prompt for lab interpretation
    system_prompt = """You are an expert medical laboratory scientist and physician specializing in interpreting lab results.

CRITICAL RULES:
1. Explain EVERY lab value in simple, clear language
2. Classify each result: NORMAL, HIGH, LOW, or CRITICAL
3. Provide standard reference ranges
4. Explain clinical significance (what it means for health)
5. Give actionable recommendations
6. Prioritize critical/abnormal findings
7. Consider patient age and gender when relevant

COMMON LAB TESTS & REFERENCE RANGES:
- Glucose (fasting): 70-100 mg/dL
- HbA1c: <5.7% (normal), 5.7-6.4% (prediabetes), ≥6.5% (diabetes)
- Total Cholesterol: <200 mg/dL (desirable)
- LDL Cholesterol: <100 mg/dL (optimal)
- HDL Cholesterol: >60 mg/dL (good)
- Triglycerides: <150 mg/dL
- Hemoglobin: 13.5-17.5 g/dL (male), 12-15.5 g/dL (female)
- White Blood Cell Count: 4,000-11,000 cells/μL
- Platelets: 150,000-400,000/μL
- Creatinine: 0.7-1.3 mg/dL (male), 0.6-1.1 mg/dL (female)
- ALT: 7-56 U/L
- AST: 10-40 U/L
- TSH: 0.4-4.0 mU/L
- Vitamin D: 30-100 ng/mL

STATUS DEFINITIONS:
- NORMAL: Within reference range
- HIGH: Above normal, needs attention
- LOW: Below normal, needs attention
- CRITICAL: Dangerously high/low, urgent care needed

OUTPUT FORMAT (JSON):
{
    "results": [
        {
            "test_name": "name of test",
            "value": "value as string",
            "unit": "measurement unit",
            "status": "normal|high|low|critical",
            "reference_range": "normal range for this test",
            "explanation": "what this test measures in simple terms",
            "clinical_significance": "what this result means for health",
            "recommendation": "what to do about this result"
        }
    ],
    "overall_assessment": "summary of all results in 2-3 sentences",
    "priority_concerns": ["list of most important abnormal findings"],
    "recommended_actions": ["specific next steps to take"]
}

Be thorough, accurate, and helpful. Always recommend consulting a healthcare provider for abnormal results."""

    user_prompt = f"""Interpret these lab results:

LAB VALUES:
{labs_text}

PATIENT CONTEXT:
{context_text}

Provide detailed interpretation with status, reference ranges, explanations, and recommendations.
Output ONLY valid JSON, no additional text."""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "MediAI-LabInterpreter"
                },
                json={
                    "model": settings.OPENROUTER_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.2,
                    "max_tokens": 3000
                }
            )
            
            response.raise_for_status()
            data = response.json()
            ai_response = data["choices"][0]["message"]["content"]
            
            # Parse JSON response
            ai_response = ai_response.strip()
            if ai_response.startswith("```json"):
                ai_response = ai_response[7:]
            if ai_response.startswith("```"):
                ai_response = ai_response[3:]
            if ai_response.endswith("```"):
                ai_response = ai_response[:-3]
            ai_response = ai_response.strip()
            
            result = json.loads(ai_response)
            
            return LabInterpretResponse(**result)
            
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        print(f"AI Response: {ai_response}")
        raise HTTPException(
            status_code=500,
            detail="Failed to parse AI response. Please try again."
        )
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Lab interpretation failed: {str(e)}"
        )


@router.get("/common-lab-tests")
def get_common_lab_tests():
    """
    Return list of common lab tests for quick input
    """
    return {
        "categories": {
            "Diabetes": [
                {"name": "Glucose (Fasting)", "unit": "mg/dL"},
                {"name": "HbA1c", "unit": "%"},
                {"name": "Glucose (Random)", "unit": "mg/dL"}
            ],
            "Cholesterol Panel": [
                {"name": "Total Cholesterol", "unit": "mg/dL"},
                {"name": "LDL Cholesterol", "unit": "mg/dL"},
                {"name": "HDL Cholesterol", "unit": "mg/dL"},
                {"name": "Triglycerides", "unit": "mg/dL"}
            ],
            "Complete Blood Count": [
                {"name": "Hemoglobin", "unit": "g/dL"},
                {"name": "Hematocrit", "unit": "%"},
                {"name": "White Blood Cell Count", "unit": "cells/μL"},
                {"name": "Platelet Count", "unit": "/μL"},
                {"name": "Red Blood Cell Count", "unit": "million cells/μL"}
            ],
            "Liver Function": [
                {"name": "ALT", "unit": "U/L"},
                {"name": "AST", "unit": "U/L"},
                {"name": "Alkaline Phosphatase", "unit": "U/L"},
                {"name": "Bilirubin (Total)", "unit": "mg/dL"}
            ],
            "Kidney Function": [
                {"name": "Creatinine", "unit": "mg/dL"},
                {"name": "Blood Urea Nitrogen (BUN)", "unit": "mg/dL"},
                {"name": "eGFR", "unit": "mL/min/1.73m²"}
            ],
            "Thyroid": [
                {"name": "TSH", "unit": "mU/L"},
                {"name": "Free T4", "unit": "ng/dL"},
                {"name": "Free T3", "unit": "pg/mL"}
            ],
            "Vitamins & Minerals": [
                {"name": "Vitamin D", "unit": "ng/mL"},
                {"name": "Vitamin B12", "unit": "pg/mL"},
                {"name": "Iron", "unit": "μg/dL"},
                {"name": "Calcium", "unit": "mg/dL"}
            ],
            "Electrolytes": [
                {"name": "Sodium", "unit": "mEq/L"},
                {"name": "Potassium", "unit": "mEq/L"},
                {"name": "Chloride", "unit": "mEq/L"},
                {"name": "CO2", "unit": "mEq/L"}
            ]
        }
    }