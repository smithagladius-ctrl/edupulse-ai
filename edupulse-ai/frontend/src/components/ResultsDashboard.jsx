import React from 'react';

function ResultsDashboard({ result }) {
    if (!result) {
        return (
            <div className="results-placeholder glass-panel">
                <div className="placeholder-icon">📊</div>
                <h3>Ready for Analysis</h3>
                <p>Submit a student profile to see the AI predictions and explanations here.</p>
            </div>
        );
    }

    const {
        burnout_tier: predicted_tier,
        dropout_probability: probability,
        explanation_text: ai_explanation,
        top_triggers: shap_values
    } = result;

    // Format probability to percentage (the API returns 0-100 absolute natively)
    const probPercent = probability.toFixed(1);

    // Determine risk color class
    const riskClass = predicted_tier.toLowerCase().replace(' ', '-');

    return (
        <div className="results-dashboard">
            <div className={`primary-result glass-panel ${riskClass}`}>
                <div className="risk-header">
                    <h2>Risk Assessment</h2>
                    <span className="risk-badge">{predicted_tier}</span>
                </div>

                <div className="probability-meter">
                    <div className="meter-visual">
                        <svg viewBox="0 0 100 50" className="gauge">
                            <path className="gauge-bg" d="M 10,50 A 40,40 0 0,1 90,50" />
                            <path
                                className={`gauge-fill ${riskClass}`}
                                d="M 10,50 A 40,40 0 0,1 90,50"
                                pathLength="100"
                                strokeDashoffset={100 - parseFloat(probPercent)}
                            />
                        </svg>
                        <div className="gauge-value">{probPercent}%</div>
                    </div>
                    <p className="meter-label">Probability of Dropout/Burnout</p>
                </div>
            </div>

            <div className="ai-explanation glass-panel">
                <h3>🧠 AI Analysis</h3>
                <p className="explanation-text">{ai_explanation}</p>
            </div>

            <div className="feature-importance glass-panel">
                <h3>Key Contributing Factors</h3>
                <p className="subtitle">How each metric influenced the prediction</p>
                <div className="shap-bars">
                    {Object.entries(shap_values || {})
                        .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a)) // Sort by absolute impact
                        .slice(0, 5) // Top 5 drivers
                        .map(([feature, impact]) => (
                            <div className="shap-bar-row" key={feature}>
                                <div className="shap-label">
                                    {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </div>
                                <div className="shap-bar-container">
                                    <div
                                        className={`shap-bar ${impact > 0 ? 'positive' : 'negative'}`}
                                        style={{ width: `${Math.min(Math.abs(impact) * 200, 100)}%` }}
                                    ></div>
                                    <span className="shap-value">{impact > 0 ? '+' : ''}{impact.toFixed(3)}</span>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

export default ResultsDashboard;
