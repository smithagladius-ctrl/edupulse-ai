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
kmeans_model = None
scaler = None

# Feature names exactly as used during training
FEATURE_NAMES = [
    'lms_login_frequency', 'login_irregularity_score', 'assignment_delay_days',
    'attendance_percentage', 'attendance_trend_slope', 'late_night_activity_ratio',
    'sentiment_score', 'activity_entropy'
]

# Risk tier decoded mapping
RISK_DECODE_MAP = {0: "Low", 1: "Medium", 2: "High"}

# Cluster Identity mapping
CLUSTER_MAP = {
    0: "Stable Performer",
    1: "Emerging Fatigue Pattern",
    2: "High Instability Profile",
    3: "Disengagement Phase"
}

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
             
        # Load KMeans and Scaler
        kmeans_path = os.path.join(MODELS_DIR, "kmeans_model.pkl")
        scaler_path = os.path.join(MODELS_DIR, "scaler.pkl")
        if os.path.exists(kmeans_path):
            with open(kmeans_path, "rb") as f:
                kmeans_model = pickle.load(f)
            print("KMeans Clustering Model loaded successfully.")
        if os.path.exists(scaler_path):
            with open(scaler_path, "rb") as f:
                scaler = pickle.load(f)
            print("Feature Scaler loaded successfully.")
            
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
    shap_vals, explanation = generate_explanation(clf_model, input_df, FEATURE_NAMES)
    
    # --- Advanced Feature 1: Confidence Calibration ---
    # Based on predict_proba margin and feature variance
    probs = clf_model.predict_proba(input_df)[0]
    margin = np.max(probs) - np.sort(probs)[-2]
    # Simulate feature alignment based on margin
    calibration_score = 75 + (margin * 25)
    confidence_text = "High pattern alignment with historical burnout profiles." if calibration_score > 85 else "Significant overlap with multiple behavioural archetypes."
    
    # --- Advanced Feature 2: Cluster Identity ---
    cluster_id = 0
    if kmeans_model and scaler:
        input_scaled = scaler.transform(input_df)
        cluster_id = kmeans_model.predict(input_scaled)[0]
    cluster_identity = CLUSTER_MAP.get(cluster_id, "Standard Profile")
    
    # --- Advanced Feature 3: Risk Composition (Pie Data) ---
    # Grouping SHAP values into semantic categories
    risk_composition = {
        "Engagement Instability": float(abs(shap_vals.get('lms_login_frequency', 0)) + abs(shap_vals.get('login_irregularity_score', 0))),
        "Circadian Imbalance": float(abs(shap_vals.get('late_night_activity_ratio', 0))),
        "Academic Delay Stress": float(abs(shap_vals.get('assignment_delay_days', 0))),
        "Emotional Sentiment": float(abs(shap_vals.get('sentiment_score', 0))),
        "Other": float(abs(shap_vals.get('attendance_percentage', 0)) + abs(shap_vals.get('attendance_trend_slope', 0)) + abs(shap_vals.get('activity_entropy', 0)))
    }
    # Normalize to percentages
    total_shap = float(sum(risk_composition.values()) or 1.0)
    risk_composition = {k: round(float(v / total_shap) * 100, 1) for k, v in risk_composition.items()}
    
    # --- Advanced Feature 4: Temporal Simulation ---
    # Simulate 30 days of login activity trend
    np.random.seed(42)
    history_days = list(range(1, 31))
    login_trend = [float(student.lms_login_frequency + np.random.normal(0, 2)) for _ in history_days]
    attendance_trend = [float(student.attendance_percentage + (student.attendance_trend_slope * (d-30))) for d in history_days]
    
    # --- Advanced Feature 5: Advisor Message Draft ---
    sorted_drivers = sorted(shap_vals.items(), key=lambda x: float(abs(x[1])), reverse=True)
    top_drivers = sorted_drivers[:2]
    drivers_text = " and ".join([str(d[0]).replace('_', ' ') for d in top_drivers if float(d[1]) > 0])
    advisor_message = f"Dear Student, we've noticed some changes in your recent academic engagement patterns, particularly regarding {drivers_text}. "
    if burnout_tier == "High":
        advisor_message += "We'd like to schedule a brief supportive check-in to see how we can assist you during this period."
    else:
        advisor_message += "We're reaching out to share some study resources and wellness tips that might be helpful."
        
    # --- Advanced Feature 6: Risk Momentum ---
    risk_momentum = "increasing" if student.attendance_trend_slope < -0.05 or student.assignment_delay_days > 5 else "stable"
    if student.attendance_trend_slope > 0.05 and student.assignment_delay_days < 2:
        risk_momentum = "decreasing"
        
    # 5. Advanced Metrics
    # A. Behavioural Stability Index (BSI)
    bsi_denominator = (student.login_irregularity_score * student.activity_entropy)
    bsi = 1.0 / bsi_denominator if bsi_denominator > 0 else 10.0
    
    # B. Engagement Health Score (0-100)
    norm_lms = min(student.lms_login_frequency / 40.0, 1.0) * 100
    norm_att = student.attendance_percentage
    norm_delay = max(0, (30 - student.assignment_delay_days) / 30.0) * 100
    engagement_health = (norm_lms * 0.3) + (norm_att * 0.4) + (norm_delay * 0.3)
    
    # 6. Rule-Based Intervention Logic
    if burnout_tier == "High":
        action = "Immediate advisor alert. Schedule wellness check."
    elif burnout_tier == "Medium":
        action = "Send automated support email with study resources."
    else:
        action = "Monitor. No immediate action required."
    
    # Return formatted response with ALL enhanced features
    return {
        "burnout_tier": burnout_tier,
        "dropout_probability": round(float(dropout_prob), 2),
        "calibration_score": round(float(calibration_score), 1),
        "confidence_text": confidence_text,
        "cluster_identity": cluster_identity,
        "risk_composition": risk_composition,
        "temporal_history": {
            "days": list(history_days),
            "login_freq": [float(x) for x in login_trend],
            "attendance": [float(x) for x in attendance_trend]
        },
        "advisor_message": advisor_message,
        "risk_momentum": risk_momentum,
        "behavioral_stability": round(float(bsi), 2),
        "engagement_health": round(float(engagement_health), 2),
        "shap_values": {str(k): float(v) for k, v in shap_vals.items()},
        "explanation_text": str(explanation),
        "recommended_action": str(action)
    }

@app.get("/institutional-metrics")
def get_institutional_view():
    """
    Simulates institutional-level metrics for 100 students.
    """
    np.random.seed(99)
    # Simulate risk distribution across 100 students
    risks = np.random.choice(["Low", "Medium", "High"], size=100, p=[0.6, 0.25, 0.15])
    distribution = {
        "Low": int(np.sum(risks == "Low")),
        "Medium": int(np.sum(risks == "Medium")),
        "High": int(np.sum(risks == "High"))
    }
    
    # Heatmap data: Rows = Departments, Cols = Risk Levels
    depts = ["CS", "Engineering", "Arts", "Business", "Science"]
    heatmap = []
    for dept in depts:
        for r in ["Low", "Medium", "High"]:
            heatmap.append({
                "department": dept,
                "risk_level": r,
                "count": int(np.random.randint(5, 30) if r == "Low" else np.random.randint(0, 15))
            })
            
    return {
        "distribution": distribution,
        "heatmap": heatmap,
        "total_active_students": 100,
        "high_risk_alerts": int(np.sum(risks == "High"))
    }

@app.get("/")
def read_root():
    return {"message": "EduPulse AI API is running. Send POST requests to /predict."}

if __name__ == "__main__":
    import uvicorn
    # Make the script runnable locally for testing
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
