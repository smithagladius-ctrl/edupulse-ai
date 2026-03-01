import pandas as pd
import numpy as np
import pickle
import shap

def run_test():
    with open('backend/models/burnout_model.pkl', 'rb') as f:
        clf = pickle.load(f)
        
    df = pd.DataFrame([[2.0, 40.0, 10.0, 20.0, -0.5, 0.9, -0.8, 4.5]], columns=[
        'lms_login_frequency', 'login_irregularity_score', 'assignment_delay_days',
        'attendance_percentage', 'attendance_trend_slope', 'late_night_activity_ratio',
        'sentiment_score', 'activity_entropy'
    ])
    
    explainer = shap.TreeExplainer(clf)
    shap_values = explainer.shap_values(df)
    
    print("Type of shap_values:", type(shap_values))
    print("Shape of shap_values:", np.array(shap_values).shape)

if __name__ == '__main__':
    run_test()
