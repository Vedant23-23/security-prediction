import React from 'react';
import SpeedometerGauge from './SpeedometerGauge';
import { AlertCircle, ShieldCheck, Zap, Info, Activity } from 'lucide-react';

const SeverityBadge = ({ severity }) => {
  const styles = {
    Fatal: { color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)', icon: <AlertCircle size={14} /> },
    Major: { color: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)', icon: <Info size={14} /> },
    Minor: { color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)', icon: <ShieldCheck size={14} /> },
  };

  const style = styles[severity] || styles.Minor;

  return (
    <div style={{ 
      display: 'inline-flex', alignItems: 'center', gap: '8px', 
      padding: '8px 16px', borderRadius: '100px', 
      color: style.color, background: style.bg,
      border: `1px solid ${style.color}40`,
      fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em'
    }}>
      {style.icon} {severity}
    </div>
  );
};

export default function ResultPanel({ result, loading }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div className="spinner" style={{ margin: '0 auto 2rem', width: '50px', height: '50px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--neon-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Ensemble Processing</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Analyzing 18-dimensional state vector...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '20px' }}>
        <Activity size={48} style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem', opacity: 0.3 }} />
        <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Awaiting Parameters</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Configure the scenario to initiate neural prediction.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <SpeedometerGauge riskPercentage={Math.round(result.confidence * 100)} />
        <div style={{ marginTop: '1.5rem' }}>
          <SeverityBadge severity={result.severity} />
        </div>
      </div>

      <div style={{ background: 'rgba(37, 99, 235, 0.05)', padding: '1.5rem', borderRadius: '15px', border: '1px solid rgba(37, 99, 235, 0.1)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: 'var(--primary-blue)' }}>
          <ShieldCheck size={18} />
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Safety Suggestions</h4>
        </div>
        <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6 }}>{result.safety_suggestion}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: 'rgba(34, 211, 238, 0.05)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(34, 211, 238, 0.1)' }}>
          <div style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px' }}>Confidence</div>
          <div style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 800 }}>{(result.confidence * 100).toFixed(1)}%</div>
        </div>
        <div style={{ background: 'rgba(244, 114, 182, 0.05)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(244, 114, 182, 0.1)' }}>
          <div style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px' }}>Model Source</div>
          <div style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700 }}>Ensemble V2.4</div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
         <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
            * This prediction is cross-validated against 500 Random Forest trees and XGBoost gradients.
         </p>
      </div>
    </div>
  );
}
