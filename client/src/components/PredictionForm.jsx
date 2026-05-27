import React from 'react';
import { Cloud, Car, Map, Clock, Zap, Locate, AlertTriangle, Thermometer, ShieldCheck } from 'lucide-react';

export default function PredictionForm({ form, handleChange, handleSubmit, loading, error }) {
  
  const FormSegment = ({ title, icon: Icon, children }) => (
    <div style={{ marginBottom: '2.5rem', padding: '1.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', color: 'var(--neon-cyan)' }}>
        <Icon size={20} />
        <h4 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</h4>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.75rem' }}>
        {children}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="fade-in">
      {error && (
        <div style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', padding: '1.2rem', borderRadius: '15px', border: '1px solid rgba(248, 113, 113, 0.2)', marginBottom: '2rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* ── Segment 1: Temporal & Site Context ─────────── */}
      <FormSegment title="Temporal & Site Context" icon={Clock}>
        <div className="form-group">
          <label>Hour of Day (24h) ⏰</label>
          <input type="number" name="hour" value={form.hour} onChange={handleChange} min="0" max="23" placeholder="e.g. 14" />
        </div>
        <div className="form-group">
          <label>Day of Week 📅</label>
          <select name="day_of_week" value={form.day_of_week} onChange={handleChange}>
            <option value="1">Monday</option>
            <option value="2">Tuesday</option>
            <option value="3">Wednesday</option>
            <option value="4">Thursday</option>
            <option value="5">Friday</option>
            <option value="6">Saturday</option>
            <option value="7">Sunday</option>
          </select>
        </div>
        <div className="form-group">
          <label>Road Category 🛣️</label>
          <select name="road_type" value={form.road_type} onChange={handleChange}>
            <option value="1">Mumbai-Pune Expressway</option>
            <option value="2">National Highway (NH4)</option>
            <option value="3">Urban City Main (Internal)</option>
            <option value="4">Rural / Ghat Section</option>
          </select>
        </div>
        <div className="form-group">
          <label>Lanes Configuration 🏁</label>
          <select name="lanes" value={form.lanes} onChange={handleChange}>
            <option value="1">1 Lane (Single/Internal)</option>
            <option value="2">2 Lanes (Standard)</option>
            <option value="3">3+ Lanes (Expressway)</option>
          </select>
        </div>
      </FormSegment>

      {/* ── Segment 2: Environmental Factors ────────────── */}
      <FormSegment title="Environmental Factors" icon={Cloud}>
        <div className="form-group">
          <label>Weather Condition 🌧️</label>
          <select name="weather" value={form.weather} onChange={handleChange}>
            <option value="1">Clear / Sunny</option>
            <option value="2">Monsoon / Heavy Rain</option>
            <option value="3">Dense Fog / Mist (Ghats)</option>
            <option value="4">Cloudy / Dusty</option>
          </select>
        </div>
        <div className="form-group">
          <label>Light Conditions 💡</label>
          <select name="lighting_condition" value={form.lighting_condition} onChange={handleChange}>
            <option value="1">Daylight (Full Sun)</option>
            <option value="2">Night (Street Lights On)</option>
            <option value="3">Night (Dark/No Lighting)</option>
            <option value="4">Dusk / Dawn (Twilight)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Road Surface 🚧</label>
          <select name="road_surface_cond" value={form.road_surface_cond} onChange={handleChange}>
            <option value="1">Dry / Smooth</option>
            <option value="2">Wet / Slippery</option>
            <option value="3">Potholes / Damaged</option>
            <option value="4">Muddy / Oil Spill</option>
          </select>
        </div>
        <div className="form-group">
          <label>Surface Temperature (°C) 🌡️</label>
          <input type="number" name="temperature" value={form.temperature} onChange={handleChange} min="-5" max="50" />
        </div>
      </FormSegment>

      {/* ── Segment 3: Traffic & Vehicle Dynamics ───────── */}
      <FormSegment title="Traffic & Vehicle Dynamics" icon={Car}>
        <div className="form-group">
          <label>Traffic Density 🚗</label>
          <select name="traffic_density" value={form.traffic_density} onChange={handleChange}>
            <option value="1">Low (Free Flow)</option>
            <option value="2">Moderate (Average)</option>
            <option value="3">High (Congestion)</option>
            <option value="4">Extreme (Gridlock)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Primary Vehicle Type 🚛</label>
          <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange}>
            <option value="1">Heavy (Truck/Bus/Lorry)</option>
            <option value="2">Light (Car/SUV/Van)</option>
            <option value="3">Two-Wheeler (Bike/Scooter)</option>
            <option value="4">Commercial (Auto/Taxi)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Vehicles Involved 🏎️</label>
          <input type="number" name="vehicles_involved" value={form.vehicles_involved} onChange={handleChange} min="1" max="15" />
        </div>
        <div className="form-group">
          <label>Junction Control 🚦</label>
          <select name="traffic_signal" value={form.traffic_signal} onChange={handleChange}>
            <option value="1">Functional Signals/Auth</option>
            <option value="0">Uncontrolled / No Signal</option>
          </select>
        </div>
      </FormSegment>

      {/* ── Segment 4: Risk & Casualty Factors ───────────── */}
      <FormSegment title="Risk & Severity Profiling" icon={ShieldCheck}>
        <div className="form-group">
          <label>Estimated Casualties 🩸</label>
          <input type="number" name="casualties" value={form.casualties} onChange={handleChange} min="0" max="25" />
        </div>
        <div className="form-group">
          <label>Intoxication Factor 🍺</label>
          <select name="is_drunk_driving" value={form.is_drunk_driving} onChange={handleChange}>
            <option value="0">No (Sober Ops)</option>
            <option value="1">Detected (Drunk Driving)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Visibility Range 👁️</label>
          <select name="visibility" value={form.visibility} onChange={handleChange}>
            <option value="1">High (&gt;2km Clear)</option>
            <option value="2">Moderate (500m-2km)</option>
            <option value="3">Low (&lt;500m Critical)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Peak Hour Status ⚡</label>
          <select name="is_peak_hour" value={form.is_peak_hour} onChange={handleChange}>
            <option value="0">Off-Peak Normal</option>
            <option value="1">Active Peak Hour</option>
          </select>
        </div>
      </FormSegment>

      <div style={{ marginTop: '3.5rem' }}>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <div className="spinner" style={{ width: '22px', height: '22px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
              RUNNING NEURAL ENSEMBLE...
            </div>
          ) : (
            'CALCULATE SEVERITY INDEX v4.0'
          )}
        </button>
      </div>
    </form>
  );
}
