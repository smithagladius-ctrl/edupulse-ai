from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import os
import pandas as pd
import numpy as np

# Import the explanation generator from train_model
from train_model import generate_explanation

app = FastAPI(title="EduPulse AI API", version="1.0", description="Early Detection of Student Burnout & Dropout Risk")

# Add CORS Middleware to allow requests from the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # React Dev Server and local IPs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
CLF_PATH = os.path.join(MODELS_DIR, "burnout_model.pkl")
REG_PATH = os.path.join(MODELS_DIR, "dropout_model.pkl")

# Global variables to hold models
clf_model = None
reg_model = None

# Feature names exactly as used during training
FEATURE_NAMES = [
    'lms_login_frequency', 'login_irregularity_score', 'assignment_delay_days',
    'attendance_percentage', 'attendance_trend_slope', 'late_night_activity_ratio',
    'sentiment_score', 'activity_entropy'
]

# Risk tier decoded mapping
RISK_DECODE_MAP = {0: "Low", 1: "Medium", 2: "High"}

class StudentInput(BaseModel):
    lms_login_frequency: float
    login_irregularity_score: float
    assignment_delay_days: float
    attendance_percentage: float
    attendance_trend_slope: float
    late_night_activity_ratio: float
    sentiment_score: float
    activity_entropy: float

@app.on_event("startup")
def load_models():
    """Load pre-trained models on startup."""
    global clf_model, reg_model
    try:
        if os.path.exists(CLF_PATH):
            with open(CLF_PATH, "rb") as f:
                clf_model = pickle.load(f)
            print("Burnout Classification Model loaded successfully.")
        else:
            print(f"Warning: Model not found at {CLF_PATH}")
            
        if os.path.exists(REG_PATH):
            with open(REG_PATH, "rb") as f:
                reg_model = pickle.load(f)
            print("Dropout Regression Model loaded successfully.")
        else:
             print(f"Warning: Model not found at {REG_PATH}")
    except Exception as e:
        print(f"Error loading models: {e}")

@app.post("/predict")
def predict_risk(student: StudentInput):
    """
    Predicts burnout risk tier, dropout probability, and generates an AI explanation.
    """
    if clf_model is None or reg_model is None:
        raise HTTPException(status_code=503, detail="Models are not loaded. Ensure models exist in backend/models/")
        
    # 1. Convert input to DataFrame (ensuring feature order)
    student_dict = student.dict()
    input_df = pd.DataFrame([[student_dict[f] for f in FEATURE_NAMES]], columns=FEATURE_NAMES)
    
    # 2. Predict Burnout Risk Tier (LightGBM)
    class_pred_encoded = clf_model.predict(input_df)[0]
    burnout_tier = RISK_DECODE_MAP.get(class_pred_encoded, "Unknown")
    
    # 3. Predict Dropout Probability (XGBoost)
    dropout_prob = reg_model.predict(input_df)[0]
    dropout_prob = float(np.clip(dropout_prob, 0, 100)) # Ensure 0-100 bounds
    
    # 4. Explainable AI: Generate SHAP Triggers
    triggers, explanation = generate_explanation(clf_model, input_df, FEATURE_NAMES)
    
    # 5. Rule-Based Intervention Logic
    if burnout_tier == "High":
        action = "Immediate advisor alert. Schedule wellness check."
    elif burnout_tier == "Medium":
        action = "Send automated support email with study resources."
    else:
        action = "Monitor. No immediate action required."
        
    # Return formatted response
    return {
        "burnout_tier": burnout_tier,
        "dropout_probability": round(dropout_prob, 2),
        "top_triggers": triggers,
        "explanation_text": explanation,
        "recommended_action": action
    }

@app.get("/")
def read_root():
    return {"message": "EduPulse AI API is running. Send POST requests to /predict."}

if __name__ == "__main__":
    import uvicorn
    # Make the script runnable locally for testing
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
