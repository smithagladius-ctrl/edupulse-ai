import React, { useState } from 'react';
import './index.css';
import PredictionForm from './components/PredictionForm';
import ResultsDashboard from './components/ResultsDashboard';

function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Connect to the local FastAPI backend running on port 8000
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Prediction failed:", err);
      setError("Failed to connect to the backend API. Please ensure FastAPI is running on port 8000.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-animate"></div>
      <div className="app-container">
        <header className="app-header">
          <h1>EduPulse <span>AI</span></h1>
          <p className="tagline">Early Detection of Student Burnout & Dropout Risk</p>
        </header>

        <main className="dashboard-grid">
          <section className="input-section">
            <PredictionForm onSubmit={handlePredict} isLoading={isLoading} />
          </section>

          <section className="results-section">
            {error ? (
              <div className="error-panel glass-panel">
                <span className="error-icon">⚠️</span>
                <h3>Connection Error</h3>
                <p>{error}</p>
              </div>
            ) : result ? (
              <ResultsDashboard result={result} />
            ) : (
              <div className="results-placeholder glass-panel">
                <div className="placeholder-icon">📊</div>
                <h3>Ready for Analysis</h3>
                <p>Submit a student profile to see the AI predictions and explanations here.</p>
              </div>
            )}
          </section>
        </main>

        <footer className="app-footer">
          <p>Built for the Student Burnout Hackathon Blueprint</p>
          <p className="footer-version">Model Version: v1.0.2 • Engine: XGBoost-v2</p>
        </footer>
      </div>
    </>
  );
}

export default App;
