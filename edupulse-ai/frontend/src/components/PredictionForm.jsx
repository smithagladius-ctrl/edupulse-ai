import React, { useState } from 'react';

function PredictionForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    lms_login_frequency: 10,
    login_irregularity_score: 0.5,
    assignment_delay_days: 2,
    attendance_percentage: 85,
    attendance_trend_slope: 0,
    late_night_activity_ratio: 0.2,
    sentiment_score: 0.5,
    activity_entropy: 0.8
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      // Convert string input back to number
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Helper to standardise input rendering
  const renderInput = (label, name, min, max, step = '1') => (
    <div className="input-group">
      <div className="input-header">
        <label htmlFor={name}>{label}</label>
        <span className="value-display">{formData[name]}</span>
      </div>
      <input
        type="range"
        id={name}
        name={name}
        min={min}
        max={max}
        step={step}
        value={formData[name]}
        onChange={handleChange}
        disabled={isLoading}
      />
    </div>
  );

  return (
    <form className="prediction-form glass-panel" onSubmit={handleSubmit}>
      <h2>Student Metrics</h2>
      <p className="form-subtitle">Adjust the metrics below to simulate a student profile and predict burnout risk.</p>
      
      <div className="form-grid">
        {renderInput('Engagement: LMS Login Freq.', 'lms_login_frequency', 0, 50)}
        {renderInput('Engagement: Att. %', 'attendance_percentage', 0, 100)}
        
        {renderInput('Behavior: Login Irregularity', 'login_irregularity_score', 0, 1, '0.01')}
        {renderInput('Behavior: Late Night Activity Ratio', 'late_night_activity_ratio', 0, 1, '0.01')}
        
        {renderInput('Performance: Assignment Delay (Days)', 'assignment_delay_days', 0, 30)}
        {renderInput('Performance: Attendance Trend', 'attendance_trend_slope', -1, 1, '0.1')}
        
        {renderInput('Sentiment Score (-1 to 1)', 'sentiment_score', -1, 1, '0.1')}
        {renderInput('Activity Entropy', 'activity_entropy', 0, 2, '0.01')}
      </div>

      <button className={`submit-btn ${isLoading ? 'loading' : ''}`} type="submit" disabled={isLoading}>
        {isLoading ? 'Analyzing...' : 'Predict Risk'}
        {!isLoading && <span className="arrow">→</span>}
      </button>
    </form>
  );
}

export default PredictionForm;
