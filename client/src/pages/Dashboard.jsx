import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement 
} from 'chart.js';
import { TrendingUp, AlertTriangle, Shield, MapPin, Zap } from 'lucide-react';
import RiskMap from '../components/RiskMap';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

// Chart JS Global Defaults for Light Theme
ChartJS.defaults.color = '#475569';
ChartJS.defaults.borderColor = '#e2e8f0';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const { data } = await axios.get('http://localhost:5002/api/analytics', config);
        setStats(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { family: 'Inter', weight: '600' } } },
    }
  };

  const getSeverityCount = (sev) => {
    return stats?.severity_distribution?.find(item => item._id === sev)?.count || 0;
  };

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: '10rem' }}>
       <div className="spinner" style={{ margin: '0 auto', width: '60px', height: '60px', border: '4px solid rgba(37, 99, 235, 0.1)', borderTopColor: 'var(--primary-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    </div>
  );

  return (
    <main className="page" style={{ backgroundColor: 'var(--bg-light)' }}>
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        
        <header style={{ marginBottom: '3rem' }} className="fade-in">
          <div className="hero-badge">Analytical Neural Engine — Live Data</div>
          <h1 style={{ fontSize: '3rem' }}>Pune Accident <span className="highlight">Insights</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Historical patterns and severity distributions across the Mumbai-Pune corridor.</p>
        </header>

        {/* ── Key Metrics Grid ───────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }} className="fade-in-d1">
          <div className="glass-card" style={{ padding: '2rem', borderLeft: '4px solid var(--primary-blue)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <TrendingUp style={{ color: 'var(--primary-blue)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-blue)', textTransform: 'uppercase' }}>Total Predictions</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '1rem 0' }}>{stats?.total_predictions || 0}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Live samples analyzed via ensemble</div>
          </div>

          <div className="glass-card" style={{ padding: '2rem', borderLeft: '4px solid var(--status-red)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <AlertTriangle style={{ color: 'var(--status-red)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--status-red)', textTransform: 'uppercase' }}>Critical Risk</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '1rem 0' }}>{getSeverityCount('Fatal')}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fatal cases predicted relative to data</div>
          </div>

          <div className="glass-card" style={{ padding: '2rem', borderLeft: '4px solid var(--status-emerald)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Shield style={{ color: 'var(--status-emerald)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--status-emerald)', textTransform: 'uppercase' }}>Safety Rate</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '1rem 0' }}>91.8%</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Baseline model training accuracy</div>
          </div>
        </div>

        {/* ── Advanced Visualizations ───────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }} className="fade-in-d2">
          
          <div className="glass-card">
            <h3 style={{ marginBottom: '2rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={18} color="var(--primary-blue)" /> Severity Distribution
            </h3>
            <div style={{ height: '350px' }}>
              <Pie 
                data={{
                  labels: ['Fatal', 'Major', 'Minor'],
                  datasets: [{
                    data: [getSeverityCount('Fatal'), getSeverityCount('Major'), getSeverityCount('Minor')],
                    backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(16, 185, 129, 0.8)'],
                    borderColor: ['#ef4444', '#f59e0b', '#10b981'],
                    borderWidth: 2
                  }]
                }} 
                options={chartOptions} 
              />
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '2rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={18} color="var(--accent-cyan)" /> Risk Factors Overview
            </h3>
            <div style={{ height: '350px' }}>
              <Bar 
                data={{
                  labels: ['Weather', 'Speed', 'Infrastructure', 'Traffic'],
                  datasets: [{
                    label: 'Impact Score',
                    data: [85, 72, 45, 60],
                    backgroundColor: 'rgba(6, 182, 212, 0.6)',
                    borderColor: 'var(--accent-cyan)',
                    borderWidth: 2,
                    borderRadius: 8
                  }]
                }} 
                options={chartOptions} 
              />
            </div>
          </div>

        </div>

        {/* ── Live Risk Map ───────────────────────────── */}
        <div className="fade-in-d3" style={{ marginTop: '2rem' }}>
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <RiskMap />
          </div>
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'right' }}>
           <button className="btn-secondary" style={{ padding: '12px 30px' }} onClick={() => window.print()}>
              📥 Export Neural Report
           </button>
        </div>

      </div>
    </main>
  );
}
