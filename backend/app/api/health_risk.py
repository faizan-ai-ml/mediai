from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import math
import httpx
import json
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import User

router = APIRouter()

class HealthData(BaseModel):
    # Basic Info
    age: int
    gender: str  # "male" or "female"
    height_cm: float
    weight_kg: float
    waist_cm: Optional[float] = None
    hip_cm: Optional[float] = None
    
    # Diabetes Risk Factors (FINDRISC)
    family_diabetes: bool = False  # Parent, sibling, or child with diabetes
    physical_activity: str = "moderate"  # "low", "moderate", "high"
    daily_vegetables: bool = True
    blood_pressure_medication: bool = False
    high_blood_glucose_history: bool = False
    
    # Heart Disease Risk Factors (Framingham)
    total_cholesterol: Optional[float] = None  # mg/dL
    hdl_cholesterol: Optional[float] = None  # mg/dL
    systolic_bp: Optional[int] = None  # mmHg
    currently_smoking: bool = False
    has_diabetes: bool = False
    on_bp_medication: bool = False

class RiskScore(BaseModel):
    score: float
    risk_level: str
    percentage: float
    explanation: str
    recommendations: list[str]

class HealthRiskResponse(BaseModel):
    bmi: dict
    diabetes_risk: RiskScore
    heart_disease_risk: Optional[RiskScore]
    cancer_screening: dict
    overall_health_score: int
    personalized_plan: str
    priority_actions: list[str]

def calculate_bmi(height_cm: float, weight_kg: float) -> dict:
    """Calculate BMI and classify according to WHO standards"""
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)
    
    # WHO BMI Classification
    if bmi < 18.5:
        category = "Underweight"
        risk = "Increased health risks"
        color = "#3b82f6"
    elif 18.5 <= bmi < 25:
        category = "Normal weight"
        risk = "Minimal health risk"
        color = "#10b981"
    elif 25 <= bmi < 30:
        category = "Overweight"
        risk = "Increased risk of cardiovascular disease, diabetes"
        color = "#f59e0b"
    elif 30 <= bmi < 35:
        category = "Obese (Class I)"
        risk = "Moderate health risk"
        color = "#ea580c"
    elif 35 <= bmi < 40:
        category = "Obese (Class II)"
        risk = "High health risk"
        color = "#dc2626"
    else:
        category = "Obese (Class III)"
        risk = "Very high health risk"
        color = "#991b1b"
    
    return {
        "value": round(bmi, 1),
        "category": category,
        "risk": risk,
        "color": color,
        "healthy_range": "18.5 - 24.9"
    }

def calculate_waist_to_hip_ratio(waist_cm: float, hip_cm: float, gender: str) -> dict:
    """Calculate waist-to-hip ratio for metabolic syndrome risk"""
    ratio = waist_cm / hip_cm
    
    # WHO Standards
    if gender == "male":
        if ratio < 0.90:
            risk = "Low risk"
            color = "#10b981"
        elif 0.90 <= ratio < 1.0:
            risk = "Moderate risk"
            color = "#f59e0b"
        else:
            risk = "High risk - metabolic syndrome"
            color = "#dc2626"
    else:  # female
        if ratio < 0.80:
            risk = "Low risk"
            color = "#10b981"
        elif 0.80 <= ratio < 0.85:
            risk = "Moderate risk"
            color = "#f59e0b"
        else:
            risk = "High risk - metabolic syndrome"
            color = "#dc2626"
    
    return {
        "value": round(ratio, 2),
        "risk": risk,
        "color": color
    }

def calculate_diabetes_risk_findrisc(data: HealthData) -> RiskScore:
    """
    FINDRISC - Finnish Diabetes Risk Score
    Validated international diabetes risk assessment tool
    """
    score = 0
    
    # Age
    if data.age < 45:
        score += 0
    elif 45 <= data.age < 54:
        score += 2
    elif 54 <= data.age < 64:
        score += 3
    else:  # >= 64
        score += 4
    
    # BMI
    bmi = data.weight_kg / ((data.height_cm / 100) ** 2)
    if bmi < 25:
        score += 0
    elif 25 <= bmi < 30:
        score += 1
    else:  # >= 30
        score += 3
    
    # Waist circumference (if available)
    if data.waist_cm:
        if data.gender == "male":
            if data.waist_cm < 94:
                score += 0
            elif 94 <= data.waist_cm < 102:
                score += 3
            else:
                score += 4
        else:  # female
            if data.waist_cm < 80:
                score += 0
            elif 80 <= data.waist_cm < 88:
                score += 3
            else:
                score += 4
    
    # Physical activity
    if data.physical_activity == "high":
        score += 0
    else:
        score += 2
    
    # Daily vegetables/fruits
    if data.daily_vegetables:
        score += 0
    else:
        score += 1
    
    # Blood pressure medication
    if data.blood_pressure_medication:
        score += 2
    
    # History of high blood glucose
    if data.high_blood_glucose_history:
        score += 5
    
    # Family history of diabetes
    if data.family_diabetes:
        score += 5
    
    # Calculate 10-year diabetes risk percentage
    # Based on FINDRISC validation studies
    if score < 7:
        risk_percentage = 1
        risk_level = "Low"
    elif 7 <= score < 12:
        risk_percentage = 4
        risk_level = "Slightly Elevated"
    elif 12 <= score < 15:
        risk_percentage = 17
        risk_level = "Moderate"
    elif 15 <= score < 20:
        risk_percentage = 33
        risk_level = "High"
    else:
        risk_percentage = 50
        risk_level = "Very High"
    
    recommendations = []
    if score >= 12:
        recommendations.append("Consult your doctor for diabetes screening (HbA1c or fasting glucose test)")
    if bmi >= 25:
        recommendations.append("Weight loss of 5-10% can reduce diabetes risk by 50%")
    if data.physical_activity == "low":
        recommendations.append("Increase physical activity to 30+ minutes daily")
    if not data.daily_vegetables:
        recommendations.append("Include vegetables and fruits in your daily diet")
    if data.waist_cm and ((data.gender == "male" and data.waist_cm >= 102) or 
                          (data.gender == "female" and data.waist_cm >= 88)):
        recommendations.append("Reduce waist circumference through diet and exercise")
    
    return RiskScore(
        score=score,
        risk_level=risk_level,
        percentage=risk_percentage,
        explanation=f"Your FINDRISC score is {score}/26. This indicates a {risk_percentage}% chance of developing type 2 diabetes within 10 years.",
        recommendations=recommendations if recommendations else ["Maintain healthy lifestyle habits"]
    )

def calculate_framingham_heart_risk(data: HealthData) -> Optional[RiskScore]:
    """
    Framingham Risk Score - 10-year cardiovascular disease risk
    Used by cardiologists worldwide since 1998
    """
    if not all([data.total_cholesterol, data.hdl_cholesterol, data.systolic_bp]):
        return None
    
    # Framingham coefficients differ by gender
    if data.gender == "male":
        # Male coefficients
        points = 0
        
        # Age
        if data.age < 35:
            points += -9
        elif 35 <= data.age < 40:
            points += -4
        elif 40 <= data.age < 45:
            points += 0
        elif 45 <= data.age < 50:
            points += 3
        elif 50 <= data.age < 55:
            points += 6
        elif 55 <= data.age < 60:
            points += 8
        elif 60 <= data.age < 65:
            points += 10
        elif 65 <= data.age < 70:
            points += 11
        else:
            points += 12
        
        # Total Cholesterol
        if data.total_cholesterol < 160:
            points += 0
        elif 160 <= data.total_cholesterol < 200:
            points += 4
        elif 200 <= data.total_cholesterol < 240:
            points += 7
        elif 240 <= data.total_cholesterol < 280:
            points += 9
        else:
            points += 11
        
        # HDL Cholesterol
        if data.hdl_cholesterol >= 60:
            points += -1
        elif 50 <= data.hdl_cholesterol < 60:
            points += 0
        elif 40 <= data.hdl_cholesterol < 50:
            points += 1
        else:
            points += 2
        
        # Blood Pressure
        if data.systolic_bp < 120:
            points += 0
        elif 120 <= data.systolic_bp < 130:
            points += 0 if not data.on_bp_medication else 1
        elif 130 <= data.systolic_bp < 140:
            points += 1 if not data.on_bp_medication else 2
        elif 140 <= data.systolic_bp < 160:
            points += 1 if not data.on_bp_medication else 2
        else:
            points += 2 if not data.on_bp_medication else 3
        
        # Smoking
        if data.currently_smoking:
            points += 4
        
        # Diabetes
        if data.has_diabetes:
            points += 2
        
        # Convert points to risk percentage (Framingham table)
        risk_map = {
            -3: 1, -2: 1, -1: 1, 0: 1, 1: 1, 2: 1, 3: 2, 4: 2,
            5: 3, 6: 4, 7: 5, 8: 6, 9: 8, 10: 10, 11: 12, 12: 16,
            13: 20, 14: 25, 15: 30, 16: 30
        }
        
        risk_percentage = risk_map.get(points, 30 if points > 16 else 1)
        
    else:  # female
        points = 0
        
        # Age
        if data.age < 35:
            points += -7
        elif 35 <= data.age < 40:
            points += -3
        elif 40 <= data.age < 45:
            points += 0
        elif 45 <= data.age < 50:
            points += 3
        elif 50 <= data.age < 55:
            points += 6
        elif 55 <= data.age < 60:
            points += 8
        elif 60 <= data.age < 65:
            points += 10
        elif 65 <= data.age < 70:
            points += 12
        else:
            points += 14
        
        # Total Cholesterol
        if data.total_cholesterol < 160:
            points += 0
        elif 160 <= data.total_cholesterol < 200:
            points += 4
        elif 200 <= data.total_cholesterol < 240:
            points += 8
        elif 240 <= data.total_cholesterol < 280:
            points += 11
        else:
            points += 13
        
        # HDL Cholesterol
        if data.hdl_cholesterol >= 60:
            points += -1
        elif 50 <= data.hdl_cholesterol < 60:
            points += 0
        elif 40 <= data.hdl_cholesterol < 50:
            points += 1
        else:
            points += 2
        
        # Blood Pressure
        if data.systolic_bp < 120:
            points += 0
        elif 120 <= data.systolic_bp < 130:
            points += 1 if not data.on_bp_medication else 3
        elif 130 <= data.systolic_bp < 140:
            points += 2 if not data.on_bp_medication else 4
        elif 140 <= data.systolic_bp < 160:
            points += 3 if not data.on_bp_medication else 5
        else:
            points += 4 if not data.on_bp_medication else 6
        
        # Smoking
        if data.currently_smoking:
            points += 3
        
        # Diabetes
        if data.has_diabetes:
            points += 3
        
        # Convert points to risk percentage (Framingham table)
        risk_map = {
            -2: 1, -1: 1, 0: 1, 1: 1, 2: 1, 3: 2, 4: 2, 5: 3,
            6: 4, 7: 5, 8: 6, 9: 8, 10: 11, 11: 14, 12: 17,
            13: 22, 14: 27, 15: 30, 16: 30
        }
        
        risk_percentage = risk_map.get(points, 30 if points > 16 else 1)
    
    # Risk level classification
    if risk_percentage < 10:
        risk_level = "Low"
    elif 10 <= risk_percentage < 20:
        risk_level = "Intermediate"
    else:
        risk_level = "High"
    
    recommendations = []
    if data.total_cholesterol >= 200:
        recommendations.append("Discuss cholesterol management with your doctor (target: <200 mg/dL)")
    if data.hdl_cholesterol < 40:
        recommendations.append("Increase HDL cholesterol through exercise and healthy fats")
    if data.systolic_bp >= 140:
        recommendations.append("Blood pressure control is critical - consult your doctor")
    if data.currently_smoking:
        recommendations.append("Smoking cessation can reduce your heart disease risk by 50%")
    if data.has_diabetes:
        recommendations.append("Tight diabetes control reduces cardiovascular complications")
    
    if risk_percentage >= 20:
        recommendations.append("HIGH RISK: Consult cardiologist for preventive medication (statins, aspirin)")
    elif risk_percentage >= 10:
        recommendations.append("Consider lifestyle modifications and regular cardiac checkups")
    
    return RiskScore(
        score=points,
        risk_level=risk_level,
        percentage=risk_percentage,
        explanation=f"Your Framingham score indicates a {risk_percentage}% risk of cardiovascular disease (heart attack or stroke) within 10 years.",
        recommendations=recommendations if recommendations else ["Continue heart-healthy lifestyle"]
    )

def get_cancer_screening_recommendations(age: int, gender: str) -> dict:
    """
    Cancer screening recommendations based on USPSTF guidelines
    United States Preventive Services Task Force - evidence-based
    """
    screenings = []
    
    # Colorectal Cancer (both genders)
    if 45 <= age <= 75:
        screenings.append({
            "cancer_type": "Colorectal Cancer",
            "recommendation": "Colonoscopy every 10 years OR FIT test annually",
            "urgency": "Recommended",
            "evidence": "Grade A - USPSTF"
        })
    elif age > 75:
        screenings.append({
            "cancer_type": "Colorectal Cancer",
            "recommendation": "Discuss with doctor (individualized decision)",
            "urgency": "Optional",
            "evidence": "Grade C - USPSTF"
        })
    
    # Breast Cancer (female)
    if gender == "female":
        if 40 <= age < 50:
            screenings.append({
                "cancer_type": "Breast Cancer",
                "recommendation": "Consider biennial mammography (discuss with doctor)",
                "urgency": "Optional",
                "evidence": "Grade C - USPSTF"
            })
        elif 50 <= age <= 74:
            screenings.append({
                "cancer_type": "Breast Cancer",
                "recommendation": "Mammography every 2 years",
                "urgency": "Recommended",
                "evidence": "Grade B - USPSTF"
            })
    
    # Cervical Cancer (female)
    if gender == "female" and 21 <= age <= 65:
        if age < 30:
            screenings.append({
                "cancer_type": "Cervical Cancer",
                "recommendation": "Pap smear every 3 years",
                "urgency": "Recommended",
                "evidence": "Grade A - USPSTF"
            })
        else:
            screenings.append({
                "cancer_type": "Cervical Cancer",
                "recommendation": "Pap smear + HPV test every 5 years OR Pap alone every 3 years",
                "urgency": "Recommended",
                "evidence": "Grade A - USPSTF"
            })
    
    # Lung Cancer (smokers)
    if 50 <= age <= 80:
        screenings.append({
            "cancer_type": "Lung Cancer",
            "recommendation": "Low-dose CT scan annually IF you smoke or quit within 15 years",
            "urgency": "Recommended for smokers",
            "evidence": "Grade B - USPSTF"
        })
    
    # Prostate Cancer (male)
    if gender == "male" and 55 <= age <= 69:
        screenings.append({
            "cancer_type": "Prostate Cancer",
            "recommendation": "Discuss PSA screening with doctor (individualized decision)",
            "urgency": "Optional",
            "evidence": "Grade C - USPSTF"
        })
    
    # Skin Cancer (all)
    screenings.append({
        "cancer_type": "Skin Cancer",
        "recommendation": "Annual skin examination by dermatologist (especially if fair-skinned)",
        "urgency": "Consider",
        "evidence": "Clinical recommendation"
    })
    
    return {
        "screenings": screenings,
        "total_recommended": len([s for s in screenings if s["urgency"] == "Recommended"])
    }

@router.post("/calculate-health-risks", response_model=HealthRiskResponse)
async def calculate_health_risks(
    data: HealthData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculate comprehensive health risks using validated medical formulas
    """
    
    try:
        # Calculate BMI (WHO Standard)
        bmi_data = calculate_bmi(data.height_cm, data.weight_kg)
        
        # Add waist-to-hip ratio if data available
        if data.waist_cm and data.hip_cm:
            bmi_data["waist_hip_ratio"] = calculate_waist_to_hip_ratio(
                data.waist_cm, data.hip_cm, data.gender
            )
        
        # Calculate Diabetes Risk (FINDRISC)
        diabetes_risk = calculate_diabetes_risk_findrisc(data)
        
        # Calculate Heart Disease Risk (Framingham)
        heart_risk = calculate_framingham_heart_risk(data)
        
        # Get Cancer Screening Recommendations (USPSTF)
        cancer_screening = get_cancer_screening_recommendations(data.age, data.gender)
        
        # Calculate Overall Health Score (0-100)
        health_score = 100
        
        # Deduct points for risk factors
        if bmi_data["value"] >= 30:
            health_score -= 15
        elif bmi_data["value"] >= 25:
            health_score -= 10
        
        if diabetes_risk.score >= 15:
            health_score -= 20
        elif diabetes_risk.score >= 12:
            health_score -= 15
        elif diabetes_risk.score >= 7:
            health_score -= 10
        
        if heart_risk and heart_risk.percentage >= 20:
            health_score -= 25
        elif heart_risk and heart_risk.percentage >= 10:
            health_score -= 15
        
        if data.currently_smoking:
            health_score -= 20
        
        if data.physical_activity == "low":
            health_score -= 10
        
        health_score = max(0, health_score)
        
        # Get AI-generated personalized plan
        context = f"""
Patient Profile:
- Age: {data.age}, Gender: {data.gender}
- BMI: {bmi_data['value']} ({bmi_data['category']})
- Diabetes Risk: {diabetes_risk.risk_level} ({diabetes_risk.percentage}% in 10 years)
- Heart Disease Risk: {heart_risk.risk_level if heart_risk else 'Not calculated'} ({heart_risk.percentage if heart_risk else 'N/A'}% in 10 years)
- Overall Health Score: {health_score}/100

Key Risk Factors:
- Smoking: {'Yes' if data.currently_smoking else 'No'}
- Physical Activity: {data.physical_activity}
- Family diabetes history: {'Yes' if data.family_diabetes else 'No'}
"""
        
        system_prompt = "You are a preventive medicine specialist. Create a personalized, actionable health improvement plan based on the patient's risk profile. Be specific, encouraging, and evidence-based. Keep it under 200 words."
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": settings.OPENROUTER_MODEL,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": context}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 300
                    }
                )
                response.raise_for_status()
                ai_data = response.json()
                personalized_plan = ai_data["choices"][0]["message"]["content"]
        except:
            personalized_plan = "Focus on maintaining a healthy lifestyle with regular exercise, balanced nutrition, and preventive screenings."
        
        # Priority actions
        priority_actions = []
        if diabetes_risk.score >= 12:
            priority_actions.append("🔴 GET DIABETES SCREENING: Your risk is elevated - test HbA1c or fasting glucose")
        if heart_risk and heart_risk.percentage >= 20:
            priority_actions.append("🔴 SEE CARDIOLOGIST: High cardiovascular risk - discuss preventive medications")
        if bmi_data["value"] >= 30:
            priority_actions.append("⚠️ WEIGHT MANAGEMENT: Obesity increases multiple disease risks")
        if data.currently_smoking:
            priority_actions.append("🚨 QUIT SMOKING: Single most important action to improve health")
        if cancer_screening["total_recommended"] > 0:
            priority_actions.append(f"📋 CANCER SCREENINGS: You're due for {cancer_screening['total_recommended']} recommended screening(s)")
        
        if not priority_actions:
            priority_actions.append("✅ MAINTAIN HEALTHY HABITS: Your risk profile is good - keep it up!")
        
        return HealthRiskResponse(
            bmi=bmi_data,
            diabetes_risk=diabetes_risk,
            heart_disease_risk=heart_risk,
            cancer_screening=cancer_screening,
            overall_health_score=health_score,
            personalized_plan=personalized_plan,
            priority_actions=priority_actions
        )
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Risk calculation failed: {str(e)}")