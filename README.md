#  EduPulse AI  
### Early Detection of Student Burnout & Dropout Risk using Behavioural Analytics

EduPulse AI is a behavioural intelligence system designed to proactively detect student burnout and dropout risk using engagement patterns, cognitive indicators, and explainable AI.

Instead of reacting after academic performance drops, EduPulse predicts risk early — enabling timely intervention.

---

##  Problem Statement

Academic dropout is rarely sudden.

Before students disengage completely, subtle behavioural signals appear:
- Reduced LMS login consistency
- Declining attendance trends
- Increasing assignment delays
- Circadian imbalance (late-night activity)
- Emotional sentiment shifts

Most institutions detect risk only after grades collapse.

**EduPulse AI shifts this from reactive detection to proactive behavioural prediction.**

---

##  Solution Overview

EduPulse transforms raw academic telemetry into interpretable cognitive risk signals using:

- Behavioural Feature Engineering
- Dual ML Model Architecture
- SHAP Explainability
- Intervention Impact Simulation
- Interactive Dashboard

The system predicts:

- 🔹 Burnout Risk Tier (Low / Medium / High)
- 🔹 Dropout Probability (0–100%)
- 🔹 Primary Behavioural Drivers
- 🔹 Projected Risk Trajectory
- 🔹 Intervention Impact Simulation

---

##  Behavioural Features Used

### Engagement Metrics
- LMS Login Frequency
- Attendance Percentage
- Attendance Trend Slope

### Behavioural Stability Indicators
- Login Irregularity Score
- Activity Entropy
- Late Night Activity Ratio

### Academic Stress Signals
- Assignment Submission Delay
- Sentiment Score

Derived Indices:
- Behavioural Stability Index
- Engagement Vitality Index
- Burnout Trajectory Projection

---

## ⚙️ Model Architecture

EduPulse uses a dual-model behavioural prediction system:

###  Model 1: Burnout Tier Classification
- Algorithm: LightGBM Classifier
- Output: Low / Medium / High Risk
- Metric: Macro F1-Score

###  Model 2: Dropout Probability Regression
- Algorithm: XGBoost Regressor
- Output: Continuous Risk (0–100%)
- Metrics: RMSE, R² Score

###  Explainability Layer
- SHAP TreeExplainer
- Identifies top behavioural contributors
- Translates technical outputs into human-readable insights

---

## 📈 Results

| Metric | Value |
|--------|--------|
| Macro F1 Score | 1.00 |
| RMSE | 9.35% |
| R² Score | 0.8758 |

The model demonstrates strong separation between stable and at-risk behavioural profiles.

---

##  System Architecture

Frontend:
- React (Vite)
- Animated risk gauge
- Behavioural driver visualization
- Intervention simulation slider

Backend:
- FastAPI
- RESTful prediction endpoint
- SHAP explainability engine

Deployment:
- Frontend: Vercel
- Backend: Render

Architecture Flow:

Student Behaviour Input  
→ FastAPI Backend  
→ ML Models  
→ SHAP Explanation  
→ Intervention Engine  
→ Interactive Dashboard  

---

## 🧪 Intervention Impact Simulation

EduPulse allows simulation of behavioural improvement scenarios.

Example:

Baseline Risk: 7.3%  
+10% Attendance Improvement → 6.2%  
15% Relative Risk Reduction  

This enables data-driven advisor decisions.

---

## 🌍 Practical Impact

EduPulse AI enables:

- Early burnout detection
- Prioritized faculty outreach
- Behaviour-driven counselling alerts
- Institutional risk heatmaps (future scope)
- Proactive academic intervention

The system moves institutions from reactive monitoring to predictive behavioural intelligence.

---

## 🔮 Future Scope

- Real LMS data integration
- Temporal modelling (LSTM)
- Department-level risk heatmaps
- Burnout cluster detection
- AI-generated personalized intervention emails
- Bias & fairness calibration framework

---

## 🛠️ Local Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/edupulse-ai.git
cd edupulse-ai
