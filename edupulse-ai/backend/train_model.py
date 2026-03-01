import os
import pickle
import pandas as pd
import numpy as np
import shap
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, mean_squared_error, r2_score
import lightgbm as lgb
import xgboost as xgb

def train_and_evaluate():
    # 1. Setup paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, "data", "synthetic_student_behavior.csv")
    models_dir = os.path.join(base_dir, "backend", "models")
    os.makedirs(models_dir, exist_ok=True)
    
    # 2. Load dataset
    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)
    
    features = [
        'lms_login_frequency', 'login_irregularity_score', 'assignment_delay_days',
        'attendance_percentage', 'attendance_trend_slope', 'late_night_activity_ratio',
        'sentiment_score', 'activity_entropy'
    ]
    
    X = df[features]
    y_class = df['burnout_risk']
    y_reg = df['dropout_probability']
    
    # Encode Target 1 (Classification: Low=0, Medium=1, High=2)
    risk_mapping = {'Low': 0, 'Medium': 1, 'High': 2}
    y_class_encoded = y_class.map(risk_mapping)
    
    # 3. Train/Test Split (stratified for classification)
    X_train, X_test, yc_train, yc_test, yr_train, yr_test = train_test_split(
        X, y_class_encoded, y_reg, test_size=0.2, random_state=42, stratify=y_class_encoded
    )
    
    # -----------------------------------------------------
    # Model A: Classification (LightGBM)
    # -----------------------------------------------------
    print("\nTraining LightGBM Classifier for Burnout Risk...")
    clf = lgb.LGBMClassifier(
        objective='multiclass',
        num_class=3,
        random_state=42,
        n_estimators=100,
        class_weight='balanced'
    )
    clf.fit(X_train, yc_train)
    
    # Evaluate Classifier
    yc_pred = clf.predict(X_test)
    f1 = f1_score(yc_test, yc_pred, average='macro')
    print(f"Burnout Risk Classification - Macro F1-Score: {f1:.4f}")
    
    # Save Model A
    clf_path = os.path.join(models_dir, "burnout_model.pkl")
    with open(clf_path, 'wb') as f:
        pickle.dump(clf, f)
    
    # -----------------------------------------------------
    # Model B: Regression (XGBoost)
    # -----------------------------------------------------
    print("\nTraining XGBoost Regressor for Dropout Probability...")
    reg = xgb.XGBRegressor(
        objective='reg:squarederror',
        random_state=42,
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1
    )
    reg.fit(X_train, yr_train)
    
    # Evaluate Regressor
    yr_pred = reg.predict(X_test)
    yr_pred = np.clip(yr_pred, 0, 100) # Probabilities shouldn't exceed 100 or drop below 0
    rmse = np.sqrt(mean_squared_error(yr_test, yr_pred))
    r2 = r2_score(yr_test, yr_pred)
    print(f"Dropout Probability Regression - RMSE: {rmse:.2f}%")
    print(f"Dropout Probability Regression - R2 Score: {r2:.4f}")
    
    # Save Model B
    reg_path = os.path.join(models_dir, "dropout_model.pkl")
    with open(reg_path, 'wb') as f:
        pickle.dump(reg, f)
        
    print(f"\nModels successfully saved to: {models_dir}")

# -----------------------------------------------------
# PHASE 3: SHAP Integration (Preparation)
# -----------------------------------------------------
def generate_explanation(model, X_input, feature_names):
    """
    Generates human-readable explanations using TreeSHAP.
    To be used by the FastAPI backend.
    """
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_input)
    
    if isinstance(shap_values, list): # Multiclass LightGBM
        target_shap = np.array(shap_values[2]).flatten()
    elif hasattr(shap_values, 'values'):
        # In newer SHAP versions, shap_values may be an Explanation object
        if len(shap_values.values.shape) == 3:
            target_shap = np.array(shap_values.values[0, :, 2]).flatten()
        else:
            target_shap = np.array(shap_values.values).flatten()
    else:
        if len(np.array(shap_values).shape) == 3:
            target_shap = np.array(shap_values)[0, :, 2]
        else:
            target_shap = np.array(shap_values).flatten()
            
    target_shap = np.array(target_shap).flatten()
        
    # 1. SHAP dictionary for frontend chart rendering
    shap_dict = {feature_names[i]: float(target_shap[i]) for i in range(len(feature_names))}
        
    # 2. Text generation (Top 2 drivers)
    top_indices = np.argsort(target_shap)[-2:][::-1]
    reasons = []
    
    for idx in top_indices:
        idx = int(idx)
        feat = feature_names[idx]
        val = X_input.iloc[0, idx]
        
        # Only include if the SHAP value actually pushes risk up significantly
        if target_shap[idx] > 0.05: 
            if feat == 'late_night_activity_ratio':
                reasons.append(f"high late-night activity ratio ({val:.0%})")
            elif feat == 'attendance_trend_slope':
                reasons.append("sharp decline in recent attendance")
            elif feat == 'assignment_delay_days':
                reasons.append(f"consistent assignment delays (avg {val:.1f} days)")
            elif feat == 'login_irregularity_score':
                reasons.append("highly irregular login patterns")
            elif feat == 'sentiment_score':
                reasons.append("negative sentiment in recent communications")
            elif feat == 'activity_entropy':
                reasons.append("a highly chaotic predictable routine")
            else:
                reasons.append(f"abnormal {feat.replace('_', ' ')}")
                
    if not reasons:
         explanation = "No significant high-risk behavioral triggers detected."
    else:
         explanation = "Risk is elevated primarily due to " + " and ".join(reasons) + "."
         
    return shap_dict, explanation


if __name__ == "__main__":
    train_and_evaluate()
