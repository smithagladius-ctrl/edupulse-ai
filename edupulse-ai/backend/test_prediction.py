import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

payload = {
    "lms_login_frequency": 10,
    "login_irregularity_score": 0.5,
    "assignment_delay_days": 2,
    "attendance_percentage": 85,
    "attendance_trend_slope": 0,
    "late_night_activity_ratio": 0.2,
    "sentiment_score": 0.5,
    "activity_entropy": 0.8
}

with TestClient(app) as client:
    response = client.post("/predict", json=payload)
    print(response.status_code)
    print(json.dumps(response.json(), indent=2))
