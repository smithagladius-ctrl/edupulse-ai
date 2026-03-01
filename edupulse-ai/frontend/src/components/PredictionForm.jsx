import React, { useState } from 'react';
import {
  User,
  BarChart3,
  Binary,
  Clock,
  GraduationCap,
  MessageSquare,
  Zap,
  ArrowRight
} from 'lucide-react';

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
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderInput = (label, name, min, max, icon, step = '1') => (
    <div className="input-group">
      <div className="input-header">
        <label htmlFor={name} className="flex items-center gap-2">
          {icon}
          {label}
        </label>
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
      <h2 className="flex items-center gap-2 mb-4">
        <User className="text-cyan-400" />
        Student Behavioral Profile
      </h2>
      <p className="form-subtitle">Calibrate behavioral telemetry to interpret cognitive risk levels.</p>

      <div className="form-grid">
        {renderInput('Engagement: Login Freq.', 'lms_login_frequency', 0, 50, <Zap size={14} />)}
        {renderInput('Engagement: Attendance %', 'attendance_percentage', 0, 100, <GraduationCap size={14} />)}

        {renderInput('Behavior: Login Instability', 'login_irregularity_score', 0, 1, <Binary size={14} />, '0.01')}
        {renderInput('Behavior: Circadian Imbalance', 'late_night_activity_ratio', 0, 1, <Clock size={14} />, '0.01')}

        {renderInput('Performance: Submission Delay', 'assignment_delay_days', 0, 30, <BarChart3 size={14} />)}
        {renderInput('Performance: Attendance Flux', 'attendance_trend_slope', -1, 1, <TrendingUp size={14} />, '0.1')}

        {renderInput('Affect: Sentiment Index', 'sentiment_score', -1, 1, <MessageSquare size={14} />, '0.1')}
        {renderInput('Complexity: Activity Entropy', 'activity_entropy', 0, 2, <Brain size={14} />, '0.01')}
      </div>

      <button className={`submit-btn ${isLoading ? 'loading' : ''}`} type="submit" disabled={isLoading}>
        <div className="btn-content">
          {isLoading ? (
            <>
              <div className="spinner"></div>
              <span>Analyzing Behavioral Patterns...</span>
            </>
          ) : (
            <>
              <span>Predict Risk Profile</span>
              <ArrowRight className="arrow" size={20} />
            </>
          )}
        </div>
      </button>
    </form>
  );
}

const TrendingUp = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);

const Brain = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z"></path></svg>
);

export default PredictionForm;
