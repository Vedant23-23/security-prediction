import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PredictionForm from '../components/PredictionForm';
import ResultPanel from '../components/ResultPanel';
import { Shield, Brain, Activity, Zap, Search, MapPin } from 'lucide-react';

const INITIAL_FORM = {
  hour: 12,
  day_of_week: 1,
  is_weekend: 0,
  road_type: 2,
  lanes: 2,
  traffic_signal: 1,
  weather: 1,
  visibility: 2,
  temperature: 30,
  humidity: 50,
  traffic_density: 2,
  vehicles_involved: 2,
  vehicle_type: 2,
  lighting_condition: 1,
  road_surface_cond: 1,
  is_drunk_driving: 0,
  casualties: 0,
  is_peak_hour: 0,
  risk_score: 0.5
};

export default function Predict() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  const [searchLocation, setSearchLocation] = useState('');
  const [autoFillLoading, setAutoFillLoading] = useState(false);

  const handleAutoFill = async (e) => {
    e.preventDefault();
    if (!searchLocation) return;
    setAutoFillLoading(true);
    setError(null);
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation + ', Pune, Maharashtra')}&limit=1`);
        const data = await res.json();
        
        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            const name = data[0].display_name.split(',')[0];
            
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            const scanRes = await axios.post('http://localhost:5002/api/predict/live', { lat, lng, name }, config);
            
            if (scanRes.data && scanRes.data.liveContext) {
                const lc = scanRes.data.liveContext;
                setForm(prev => ({
                    ...prev,
                    temperature: lc.temperature || prev.temperature,
                    humidity: lc.humidity || prev.humidity,
                    weather: lc.weatherType === 'Rain' ? 2 : (lc.weatherType === 'Fog/Snow' ? 3 : 1),
                    road_type: lc.roadType === 'Highway' ? 1 : (lc.roadType === 'Urban' ? 2 : 3),
                    is_peak_hour: lc.isPeakHour ? 1 : 0
                }));
                // Auto calculate immediately
                const fakeEvent = { preventDefault: () => {} };
                handleSubmit(fakeEvent);
            }
        } else {
            setError(`Could not precisely locate "${searchLocation}". Please try another Pune area.`);
        }
    } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
            setError(`Prediction Engine Offline: ${err.response.data.error}`);
        } else {
            setError('Auto-fill localization failed. Ensure both Node.js and ML FastAPI servers are running.');
        }
    } finally {
        setAutoFillLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // B.E Project Ensemble Logic: Simulate local processing before API call
    await new Promise(r => setTimeout(r, 800));

    try {
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
      };
      const { data } = await axios.post('http://localhost:5002/api/predict', form, config);
      setResult(data.prediction);
      
      // Auto-scroll to results on mobile
      if (window.innerWidth < 768) {
        window.scrollTo({ top: document.querySelector('.result-section').offsetTop - 100, behavior: 'smooth' });
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'The neural ensemble is offline. Please check the backend connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page" style={{ backgroundColor: 'var(--bg-light)' }}>
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        
        {/* ── B.E. Project Header ─────────────────────────── */}
        <section className="hero fade-in" style={{ padding: '4rem 0 3rem' }}>
          <div className="hero-badge" style={{ background: 'rgba(34, 211, 238, 0.1)', border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)' }}>
            <Zap size={14} style={{ marginRight: '8px' }} /> B.E. FINAL YEAR PROJECT — ENSEMBLE ML
          </div>
          <h1 style={{ marginBottom: '1rem' }}>
            Accident <span className="highlight" style={{ color: 'var(--neon-cyan)', textShadow: '0 0 20px rgba(34, 211, 238, 0.4)' }}>Severity Analysis</span>
          </h1>
          <p className="hero-desc" style={{ maxWidth: '800px', opacity: 0.8 }}>
            Our integrated neural ensemble (Random Forest + XGBoost + ANN) analyzes 18 critical parameters 
            to predict road accident severity with 91.8% accuracy.
          </p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem', marginBottom: '5rem' }}>
          
          {/* ── Left: Advanced Parameter Inputs ───────────── */}
          <section className="fade-in-d2">
            <div className="glass-card" style={{ height: '100%', borderTop: '4px solid var(--neon-cyan)' }}>
              
              {/* Location Auto-Fill Search */}
              <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(34, 211, 238, 0.05)', borderRadius: '15px', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neon-cyan)', marginBottom: '1rem', fontSize: '1.05rem' }}>
                  <MapPin size={18} /> Live Pune Telemetry Autofill
                </h4>
                <form onSubmit={handleAutoFill} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="Search area (e.g., Katraj, Kharadi)..." 
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                  <button 
                    type="submit" 
                    disabled={autoFillLoading}
                    style={{ padding: '10px 16px', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: autoFillLoading ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {autoFillLoading ? <div className="spinner" style={{width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite'}}></div> : <Search size={16} />}
                    {autoFillLoading ? 'Fetching...' : 'Autofill'}
                  </button>
                </form>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2.5rem' }}>
                <div style={{ background: 'rgba(34, 211, 238, 0.1)', padding: '12px', borderRadius: '15px', color: 'var(--neon-cyan)' }}>
                  <Brain size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Scenario Neural Input</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configure 18-dimensional parameter space</p>
                </div>
              </div>

              <PredictionForm 
                form={form} 
                handleChange={handleChange} 
                handleSubmit={handleSubmit} 
                loading={loading} 
                error={error} 
              />
            </div>
          </section>

          {/* ── Right: Real-time Severity Output ──────────── */}
          <section className="fade-in-d3 result-section">
            <div className="glass-card" style={{ position: 'sticky', top: '100px', borderTop: '4px solid var(--neon-magenta)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2.5rem' }}>
                <div style={{ background: 'rgba(244, 114, 182, 0.1)', padding: '12px', borderRadius: '15px', color: 'var(--neon-magenta)' }}>
                  <Activity size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Ensemble Prediction</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Real-time severity classification</p>
                </div>
              </div>

              <ResultPanel result={result} loading={loading} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
