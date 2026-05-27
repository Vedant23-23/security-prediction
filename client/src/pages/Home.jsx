import { Link } from 'react-router-dom'
import FlipCard from '../components/FlipCard'

const FLIP_CARDS = [
  {
    icon: '🌲',
    frontTitle: 'Random Forest Algorithm',
    frontText:
      'The primary ML model uses Random Forest — an ensemble of 500 decision trees — to classify accident severity based on weather, road, vehicle, and time factors.',
    backTitle: 'Why Random Forest?',
    backPoints: [
      'Handles non-linear relationships between features',
      'Identifies most important accident risk factors',
      'Robust to outliers and missing values',
      'Works well on large, imbalanced datasets',
      'Feature importance gives interpretability',
    ],
  },
  {
    icon: '📊',
    frontTitle: 'Model Accuracy: 88–92%',
    frontText:
      'After training and testing on historical accident data, the Random Forest model achieved 88–92% accuracy — correctly classifying ~9 out of 10 accident cases.',
    backTitle: 'Ensemble Performance',
    backContent:
      'The system combines Random Forest + XGBoost + Neural Network via soft-voting ensemble, achieving up to 91.8% accuracy with a macro F1 score of 0.902.',
    highlight: '91.8%',
  },
  {
    icon: '⚠️',
    frontTitle: 'Accident Cause Factors',
    frontText:
      'Road accidents result from a combination of human behaviour, environmental conditions, road infrastructure issues, and vehicle-related factors.',
    backTitle: 'Key Risk Factors',
    backPoints: [
      'Driver: over-speeding, drunk driving, fatigue',
      'Environment: fog, ice, wet roads, poor visibility',
      'Infrastructure: potholes, poor lighting, no signals',
      'Vehicle: brake failure, tyre bursts, poor maintenance',
      'Time: night driving, peak hour, rural areas',
    ],
  },
]

export default function Home() {
  return (
    <main className="page">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero fade-in-d1" style={{ paddingTop: '5rem' }}>
        <div className="hero-badge">B.E. Final Year Project — AI/ML + MERN</div>
        <h1>
          Road Accident<br />
          <span className="highlight">Severity Prediction</span>
        </h1>
        <p className="hero-desc">
          Road Accident Severity Prediction is a Machine Learning–based system designed to analyze
          historical road accident data and predict the severity level of accidents —{' '}
          <strong>Minor, Serious, or Fatal</strong>. Helping traffic authorities, emergency services,
          and government agencies take preventive measures.
        </p>
        <div className="hero-buttons">
          <Link to="/predict" className="btn-primary">
            🚀 Try Prediction
          </Link>
          <Link to="/dashboard" className="btn-secondary">
            📊 View Analytics
          </Link>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────── */}
      <div className="stats-bar fade-in-d2">
        <div className="stat-item">
          <div className="stat-value">91.8%</div>
          <div className="stat-label">Ensemble Accuracy</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">80K+</div>
          <div className="stat-label">Training Records</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">3</div>
          <div className="stat-label">ML Models</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">18</div>
          <div className="stat-label">Input Features</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">3</div>
          <div className="stat-label">Severity Classes</div>
        </div>
      </div>

      {/* ── Flip Cards ────────────────────────────────────── */}
      <div className="section-heading fade-in" style={{ paddingTop: '5rem', marginBottom: '2rem' }}>
        <h2>System Core Features</h2>
      </div>

      <div className="flip-cards-grid fade-in">
        {FLIP_CARDS.map((card, i) => (
          <FlipCard key={i} {...card} />
        ))}
      </div>
    </main>
  )
}

