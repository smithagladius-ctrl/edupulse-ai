import os
import numpy as np
import pandas as pd

def generate_student_data(n=5000):
    """
    Generates synthetic behavioral data for n students.
    Creates clear distinct profiles for thriving, struggling, and burning out students
    to give the models a strong signal.
    """
    np.random.seed(42)
    # 3 clusters: 0 = Thriving (50%), 1 = Struggling (30%), 2 = Burning Out (20%)
    profiles = np.random.choice([0, 1, 2], size=n, p=[0.5, 0.3, 0.2])
    
    data = []
    for p in profiles:
        if p == 0: # Thriving
            login_freq = np.random.normal(25, 5)
            irregularity = np.random.normal(12, 3)
            delay = np.random.exponential(0.5)
            attendance = np.random.beta(8, 2) * 100
            trend = np.random.normal(0, 0.05)
            late_night = np.random.beta(1, 9)
            sentiment = np.random.normal(0.6, 0.2)
            entropy = np.random.uniform(1.5, 2.5)
            risk, prob = "Low", np.random.uniform(0, 15)
        elif p == 1: # Struggling
            login_freq = np.random.normal(15, 6)
            irregularity = np.random.normal(24, 6)
            delay = np.random.exponential(2.5)
            attendance = np.random.beta(5, 4) * 100
            trend = np.random.normal(-0.1, 0.1)
            late_night = np.random.beta(3, 7)
            sentiment = np.random.normal(0.1, 0.3)
            entropy = np.random.uniform(2.5, 3.5)
            risk, prob = "Medium", np.random.uniform(15, 50)
        else: # Burning Out
            login_freq = np.random.normal(8, 4)
            irregularity = np.random.normal(48, 12) # Highly erratic
            delay = np.random.exponential(6.0)
            attendance = np.random.beta(2, 6) * 100
            trend = np.random.normal(-0.3, 0.1) # Sharp drop
            late_night = np.random.beta(6, 4) # Very high late-night activity
            sentiment = np.random.normal(-0.5, 0.3) # Negative sentiment
            entropy = np.random.uniform(3.5, 4.5)
            risk, prob = "High", np.random.uniform(50, 99)
            
        data.append({
            'lms_login_frequency': max(0, login_freq),
            'login_irregularity_score': max(0, irregularity),
            'assignment_delay_days': max(0, delay),
            'attendance_percentage': np.clip(attendance, 0, 100),
            'attendance_trend_slope': trend,
            'late_night_activity_ratio': np.clip(late_night, 0, 1),
            'sentiment_score': np.clip(sentiment, -1, 1),
            'activity_entropy': entropy,
            'burnout_risk': risk,
            'dropout_probability': np.clip(prob, 0, 100)
        })
    return pd.DataFrame(data)

if __name__ == "__main__":
    print("Generating synthetic student data...")
    df = generate_student_data(5000)
    
    # Get the directory of the current script (data dir)
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(curr_dir, "synthetic_student_behavior.csv")
    
    # Ensure data directory exists
    os.makedirs(curr_dir, exist_ok=True)
    
    df.to_csv(output_path, index=False)
    print(f"Data successfully generated and saved to {output_path}")
    
    print("\nSample Data:")
    print(df.head())
    
    print("\nClass Distribution:")
    print(df['burnout_risk'].value_counts())
