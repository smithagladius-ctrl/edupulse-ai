import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, Tooltip, Legend,
    BarChart, Bar
} from 'recharts';
import {
    Brain,
    Activity,
    Clock,
    Info,
    Beaker,
    ShieldCheck,
    Users,
    MessageSquare,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    Scale,
    LayoutDashboard,
    Globe
} from 'lucide-react';

const CATEGORY_COLORS = {
    'Engagement Instability': '#22d3ee',
    'Circadian Imbalance': '#818cf8',
    'Academic Delay Stress': '#f472b6',
    'Emotional Sentiment': '#fbbf24',
    'Other': '#64748b'
};

function ResultsDashboard({ result }) {
    const [viewMode, setViewMode] = useState('individual');
    const [instData, setInstData] = useState(null);
    const [loadingInst, setLoadingInst] = useState(false);
    const [simImprovement, setSimImprovement] = useState(10);
    const [showSimulation, setShowSimulation] = useState(false);

    const fetchInstitutionalData = async () => {
        setLoadingInst(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
        try {
            const res = await fetch(`${API_URL}/institutional-metrics`);
            if (res.ok) {
                const data = await res.json();
                setInstData(data);
            }
        } catch (err) {
            console.error("Failed to fetch institutional metrics", err);
        } finally {
            setLoadingInst(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'institutional' && !instData) {
            fetchInstitutionalData();
        }
    }, [viewMode, instData]);

    if (!result) return null;

    const {
        burnout_tier = "Low",
        dropout_probability = 0,
        calibration_score = 100,
        confidence_text = "Analysis complete",
        cluster_identity = "Standard",
        risk_composition = {},
        temporal_history = { days: [], login_freq: [], attendance: [] },
        advisor_message = "",
        risk_momentum = "stable",
        recommended_action = ""
    } = result;

    const riskClass = burnout_tier.toLowerCase().includes('high') ? 'high-risk' :
        burnout_tier.toLowerCase().includes('medium') ? 'medium-risk' : 'low-risk';

    // Filter out 0% values and sort by value desc for better pie visualization
    const pieData = useMemo(() => {
        return Object.entries(risk_composition)
            .filter(([_, value]) => value > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({ name, value }));
    }, [risk_composition]);

    const areaData = useMemo(() => temporal_history?.days?.map((d, i) => ({
        day: d,
        login_freq: temporal_history.login_freq[i] || 0,
        attendance: temporal_history.attendance[i] || 0
    })) || [], [temporal_history]);

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    const renderMomentum = () => {
        if (risk_momentum === 'increasing') return <ArrowUpRight className="momentum-indicator momentum-increasing" />;
        if (risk_momentum === 'decreasing') return <ArrowDownRight className="momentum-indicator momentum-decreasing" />;
        return <Minus className="momentum-indicator momentum-stable" />;
    };

    return (
        <div className="results-dashboard-container">
            <div className="dashboard-controls-wrapper">
                <div className="dashboard-controls">
                    <button className={`view-toggle ${viewMode === 'individual' ? 'active' : ''}`} onClick={() => setViewMode('individual')}>
                        <LayoutDashboard size={14} /> Individual
                    </button>
                    <button className={`view-toggle ${viewMode === 'institutional' ? 'active' : ''}`} onClick={() => setViewMode('institutional')}>
                        <Globe size={14} /> Institutional
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'individual' ? (
                    <motion.div key="individual" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }} className="dashboard-view">
                        <div className="metrics-grid">
                            <motion.div className={`primary-result glass-panel ${riskClass}`} variants={itemVariants} initial="hidden" animate="visible">
                                <div className="risk-header">
                                    <h2 className="flex items-center gap-2 m-0 text-xl font-bold"><ShieldCheck className="text-cyan-400" size={24} /> Risk Profile</h2>
                                    <span className="risk-badge">{burnout_tier}</span>
                                </div>
                                <div className="confidence-tag mt-2">
                                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-tight opacity-60">
                                        <Activity size={12} /> AI CONFIDENCE: {calibration_score}% {renderMomentum()}
                                    </span>
                                </div>
                                <div className="identity-badge mt-2"><Brain size={12} /> {cluster_identity}</div>
                                <div className="hero-content py-8 text-center">
                                    <div className="hero-risk-val text-6xl font-black">{dropout_probability.toFixed(1)}%</div>
                                    <p className="meter-label text-secondary uppercase text-[10px] tracking-widest mt-2">Dropout Probability</p>
                                    <p className="text-[11px] opacity-60 italic mt-4 px-6">{confidence_text}</p>
                                </div>
                                <div className="escalation-light">
                                    <div className={`light green ${burnout_tier === 'Low' ? 'active' : ''}`} />
                                    <div className={`light amber ${burnout_tier === 'Medium' ? 'active' : ''}`} />
                                    <div className={`light red ${burnout_tier === 'High' ? 'active' : ''}`} />
                                    <span className="text-[10px] font-bold opacity-40 ml-2 uppercase tracking-tighter">Intervention Logic</span>
                                </div>
                            </motion.div>

                            <motion.div className="metric-card glass-panel" variants={itemVariants} initial="hidden" animate="visible">
                                <h3 className="text-sm uppercase tracking-wider font-bold mb-6 flex items-center gap-2"><Activity size={18} className="text-cyan-400" /> Attribution</h3>
                                <div className="chart-container" style={{ height: '220px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={5}
                                                dataKey="value"
                                                animationBegin={0}
                                                animationDuration={1500}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={CATEGORY_COLORS[entry.name] || '#94a3b8'}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                itemStyle={{ color: '#fff' }}
                                                contentStyle={{
                                                    background: '#1e293b',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    boxShadow: '0 10px 15px rgba(0,0,0,0.5)',
                                                    color: '#fff'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="donut-legend grid grid-cols-1 gap-3 mt-6">
                                    {pieData.map((item, i) => (
                                        <div key={item.name} className="legend-item flex items-center gap-3 text-[11px] font-medium text-white">
                                            <div
                                                className="legend-color w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#94a3b8' }}
                                            />
                                            <span className="opacity-70 text-white">{item.name}</span>
                                            <span className="ml-auto font-bold text-cyan-400">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        <div className="metrics-grid mt-6">
                            <motion.div className="metric-card glass-panel col-span-2" style={{ gridColumn: 'span 2' }} variants={itemVariants} initial="hidden" animate="visible">
                                <h3 className="text-sm uppercase tracking-wider font-bold mb-6 flex items-center gap-2"><Clock size={18} className="text-cyan-400" /> Behavior History (30 Days)</h3>
                                <div className="chart-container" style={{ height: '200px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={areaData}>
                                            <defs>
                                                <linearGradient id="colorLogin" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} /><stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="day" hide /><YAxis hide /><Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px' }} />
                                            <Area type="monotone" dataKey="login_freq" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorLogin)" name="Login" />
                                            <Area type="monotone" dataKey="attendance" stroke="#818cf8" strokeWidth={2} fill="transparent" name="Attendance" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div className="ai-explanation glass-panel mt-6" variants={itemVariants} initial="hidden" animate="visible">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="m-0 text-sm uppercase tracking-wider font-bold flex items-center gap-2"><MessageSquare size={18} className="text-cyan-400" /> Advisor Draft</h3>
                                <button className="copy-btn text-xs px-3 py-1 bg-white/5 rounded hover:bg-white/10">Copy</button>
                            </div>
                            <div className="advisor-section p-4 bg-black/20 rounded-xl border-l-4 border-cyan-400 italic">
                                "{advisor_message}"
                                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-cyan-400 opacity-80 not-italic uppercase tracking-widest">
                                    <Info size={12} /> ACTION: {recommended_action}
                                </div>
                            </div>
                            <button className="simulate-btn w-full flex items-center justify-center gap-2 mt-6 py-2 bg-white/5 rounded-lg border border-white/10 text-xs font-bold hover:bg-white/10 transition-all" onClick={() => setShowSimulation(!showSimulation)}>
                                <Beaker size={14} /> {showSimulation ? 'Close Stress Test' : 'Run Stress Test Analysis'}
                            </button>
                            <AnimatePresence>
                                {showSimulation && (
                                    <motion.div className="simulation-panel mt-4 p-6 bg-black/40 rounded-2xl border border-white/5" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-bold opacity-60 text-white uppercase tracking-widest">Sensitivity Slide</span>
                                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">At -{simImprovement}% Attendance</span>
                                        </div>
                                        <input type="range" min="0" max="40" step="5" value={simImprovement} onChange={(e) => setSimImprovement(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
                                        <div className="flex items-center justify-around mt-6">
                                            <div className="text-center"><div className="text-[10px] opacity-40 uppercase">Base</div><div className="text-xl font-bold">{dropout_probability.toFixed(1)}%</div></div>
                                            <div className="text-cyan-400">→</div>
                                            <div className="text-center"><div className="text-[10px] opacity-40 uppercase text-amber-500">Predicted</div><div className="text-xl font-bold text-amber-400">{(dropout_probability + (simImprovement * 0.8)).toFixed(1)}%</div></div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <div className="ethics-panel mt-8 p-6 flex gap-4 items-start border-t border-white/5">
                            <Scale className="text-slate-500" size={20} />
                            <div>
                                <h4 className="m-0 text-[10px] font-bold opacity-60 uppercase tracking-widest">Transparency Protocol</h4>
                                <p className="m-0 mt-2 text-[11px] opacity-40 leading-relaxed">This prediction uses behavior-only telemetry. SHAP logic provides full explainability for all institutional interventions.</p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="institutional" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }} className="dashboard-view">
                        {(!instData || loadingInst) ? (
                            <div className="loading-container glass-panel min-h-[400px] flex flex-col items-center justify-center">
                                <div className="spinner mb-4 animate-spin border-2 border-cyan-400 border-t-transparent rounded-full w-8 h-8"></div>
                                <h3 className="text-cyan-400 uppercase text-xs tracking-widest animate-pulse">Synchronizing Telemetry...</h3>
                            </div>
                        ) : (
                            <div className="metrics-grid">
                                <motion.div className="metric-card glass-panel col-span-2" style={{ gridColumn: 'span 2' }} variants={itemVariants} initial="hidden" animate="visible">
                                    <h3 className="flex items-center gap-2 text-sm uppercase font-bold mb-8"><Users size={20} className="text-cyan-400" /> Global Heatmap</h3>
                                    <div className="heatmap-grid grid grid-cols-5 gap-3">
                                        {(instData.heatmap || []).map((item, i) => {
                                            const intensity = Math.min(1, item.count / 20);
                                            let col = `rgba(16, 185, 129, ${0.1 + intensity * 0.9})`;
                                            if (item.risk_level === 'Medium') col = `rgba(245, 158, 11, ${0.1 + intensity * 0.9})`;
                                            if (item.risk_level === 'High') col = `rgba(239, 68, 68, ${0.1 + intensity * 0.9})`;
                                            return (
                                                <div key={i} className="heatmap-cell h-12 rounded-lg flex items-center justify-center text-xs font-bold border border-white/5 transition-transform hover:scale-105" style={{ backgroundColor: col, color: 'white' }} title={`${item.department}: ${item.count}`}>
                                                    {item.count}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/5 opacity-40 text-[9px] font-bold uppercase tracking-widest">
                                        <div className="flex gap-4">
                                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Low</span>
                                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Med</span>
                                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> High</span>
                                        </div>
                                        <span>CELL: STUDENT DENSITY</span>
                                    </div>
                                </motion.div>

                                <motion.div className="metric-card glass-panel" variants={itemVariants} initial="hidden" animate="visible">
                                    <h3 className="text-sm uppercase font-bold mb-8 flex items-center gap-2"><Activity size={20} className="text-cyan-400" /> Spectrum</h3>
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[{ name: 'Low', count: instData.distribution?.Low || 0, fill: '#10b981' }, { name: 'Med', count: instData.distribution?.Medium || 0, fill: '#f59e0b' }, { name: 'High', count: instData.distribution?.High || 0, fill: '#ef4444' }]}>
                                                <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} />
                                                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-8 space-y-3">
                                        <div className="flex justify-between items-center bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-rose-400 font-bold text-xs uppercase">
                                            <span>Critical Alerts</span><span>{instData.high_risk_alerts || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] opacity-40 font-bold uppercase px-1">
                                            <span>Total Profiled</span><span>{instData.total_active_students || 0}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ResultsDashboard;
