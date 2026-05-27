import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, AlertTriangle, Activity, AlertOctagon, Car, Search, MapPin } from 'lucide-react';

import SpeedometerGauge from './SpeedometerGauge';
import axios from 'axios';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom red icon for search results
const redIconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
const RedSearchIcon = L.icon({
  iconUrl: redIconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const PUNE_HOTSPOTS = [
  { id: 1, name: 'Hinjewadi Phase 1 Junction', lat: 18.5913, lng: 73.7389, severity: 'Fatal', risk: 'Very High Risk', trafficStatus: 'Severe Congestion', restriction: 'Level 4 (Heavy Vehicles Banned)' },
  { id: 2, name: 'Swargate Chowk', lat: 18.5018, lng: 73.8636, severity: 'Major', risk: 'High Traffic Density Risk', trafficStatus: 'Moderate Congestion', restriction: 'Level 2 (Speed Limit 20km/h)' },
  { id: 3, name: 'Chandni Chowk', lat: 18.5042, lng: 73.7686, severity: 'Fatal', risk: 'Highway Speed Risk', trafficStatus: 'Flowing', restriction: 'Level 1 (No Speeding)' },
  { id: 4, name: 'Khadki Cantt', lat: 18.5602, lng: 73.8500, severity: 'Minor', risk: 'Low Visibility Zone', trafficStatus: 'Light Traffic', restriction: 'Level 0 (Normal)' },
  { id: 5, name: 'Wagholi Highway', lat: 18.5808, lng: 73.9787, severity: 'Major', risk: 'Heavy Vehicles Risk', trafficStatus: 'Heavy Congestion', restriction: 'Level 3 (Lane closures)' },
  { id: 6, name: 'Kothrud Depot', lat: 18.5089, lng: 73.8066, severity: 'Minor', risk: 'Pedestrian Crossing Risk', trafficStatus: 'Moderate', restriction: 'Level 1' },
  { id: 7, name: 'Viman Nagar Junction', lat: 18.5663, lng: 73.9143, severity: 'Major', risk: 'Urban Density Risk', trafficStatus: 'Severe', restriction: 'Level 2' },
  { id: 8, name: 'Navale Bridge, Katraj', lat: 18.4418, lng: 73.8329, severity: 'Fatal', risk: 'Blackspot Gradient Risk', trafficStatus: 'Standstill', restriction: 'Level 5 (Emergency Only)' }
];

const getColor = (severity) => {
  switch (severity) {
    case 'Fatal': return '#e11d48'; // red
    case 'Major': return '#ea580c'; // orange
    default: return '#16a34a'; // green
  }
};

const mapStyles = {
  street: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attr: '&copy; CartoDB Dark Matter'
  },
  satellite: {
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attr: '&copy; Google Maps'
  }
};

export default function RiskMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const streetLayerRef = useRef(null);
  const satelliteLayerRef = useRef(null);
  const searchMarkerRef = useRef(null);

  const [isSatellite, setIsSatellite] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([18.5204, 73.8567], 11);
    mapInstanceRef.current = map;

    const streetLayer = L.tileLayer(mapStyles.street.url, { attribution: mapStyles.street.attr });
    const satelliteLayer = L.tileLayer(mapStyles.satellite.url, { attribution: mapStyles.satellite.attr });

    streetLayerRef.current = streetLayer;
    satelliteLayerRef.current = satelliteLayer;

    // Default is satellite
    satelliteLayer.addTo(map);

    // Initial Hotspots
    PUNE_HOTSPOTS.forEach(spot => {
      const radius = spot.severity === 'Fatal' ? 14 : 9;
      const color = getColor(spot.severity);

      const circle = L.circleMarker([spot.lat, spot.lng], {
        radius, fillColor: color, color: color, weight: 1, fillOpacity: 0.7
      }).addTo(map);

      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; padding: 4px; width: 180px; background: 'transparent';">
          <h4 style="margin-bottom: 4px; color: #fff; font-size: 14px;">${spot.name}</h4>
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">Historical: <strong style="color: ${color}">${spot.severity}</strong></p>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #0f172a; font-weight: bold;"><em>Click for live satellite scan</em></p>
        </div>
      `;
      circle.bindPopup(popupContent);

      circle.on('click', () => {
        // Mock the search result format to pass into our Live API scanning pipeline
        const mockResult = {
          lat: spot.lat,
          lon: spot.lng,
          display_name: spot.name + ', Pune, Maharashtra',
          place_id: spot.id
        };
        handleSelectSearchResult(mockResult);
        circle.closePopup();
      });

    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Layer Toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !streetLayerRef.current || !satelliteLayerRef.current) return;

    if (isSatellite) {
      map.removeLayer(streetLayerRef.current);
      satelliteLayerRef.current.addTo(map);
      map.eachLayer((layer) => {
        if (layer instanceof L.CircleMarker) layer.setStyle({ color: '#ffffff', weight: 2 });
      });
    } else {
      map.removeLayer(satelliteLayerRef.current);
      streetLayerRef.current.addTo(map);
      map.eachLayer((layer) => {
        if (layer instanceof L.CircleMarker) layer.setStyle({ color: layer.options.fillColor, weight: 1 });
      });
    }
  }, [isSatellite]);

  // Handle FlyTo
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedSpot) {
      map.flyTo([selectedSpot.lat, selectedSpot.lng], 18, { animate: true, duration: 1.5 });
    } else {
      map.flyTo([18.5204, 73.8567], 11, { animate: true, duration: 1 });
    }
  }, [selectedSpot]);

  // Handle Universal Search using Nominatim OpenStreetMap bounds
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Free geocoding service, limiting to Pune region context
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Pune, Maharashtra')}&limit=5`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Advanced Satellite Scanning State (Simulated Professional Feedback)
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [liveContextData, setLiveContextData] = useState(null);

  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch(e) { console.warn("Audio error", e) }
  };

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    setSearchResults([]);
    setSearchQuery('');
    
    // Trigger "Satellite Scanning" UI sequence
    setIsScanning(true);
    setScanProgress(0);
    
    let progress = 0;
    const interval = setInterval(async () => {
      progress += 20;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        try {
          const res = await axios.post('http://localhost:5002/api/predict/live', {
            lat: lat,
            lng: lon,
            name: result.display_name.split(',')[0]
          });
          
          if (res.data.success) {
            const data = res.data;
            const liveSpot = {
              id: `live-${result.place_id}`,
              name: result.display_name.split(',')[0], 
              lat: lat,
              lng: lon,
              severity: data.mapData.severity,
              risk: data.mapData.riskZoneType,
              trafficStatus: data.mapData.trafficStatus,
              restriction: data.mapData.restriction,
              riskPercentage: data.mapData.riskPercentage
            };
            setLiveContextData(data.liveContext);
            handleSpotClick(liveSpot, true);
            playBeep();
          }
        } catch (err) {
          console.error("Live scan failed:", err);
          // Fallback if API is unreachable
          playBeep();
        } finally {
          setIsScanning(false);
        }
      }
    }, 400); // Slower animation to simulate API wait time
  };

  const handleSpotClick = (spot, fromSearch = false) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    
    if (fromSearch) {
      if (searchMarkerRef.current) map.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = L.marker([spot.lat, spot.lng], { icon: RedSearchIcon }).addTo(map);
      setIsSearchMode(true);
    } else {
      setIsSearchMode(false);
      if (searchMarkerRef.current) {
        map.removeLayer(searchMarkerRef.current);
        searchMarkerRef.current = null;
      }
    }

    setSelectedSpot(spot);
    setIsSatellite(true);
  };

  const handleReset = () => {
    const map = mapInstanceRef.current;
    setSelectedSpot(null);
    setLiveContextData(null);
    setIsSatellite(false);
    setIsSearchMode(false);
    if (searchMarkerRef.current && map) {
        map.removeLayer(searchMarkerRef.current);
        searchMarkerRef.current = null;
    }
  };

  let activePercentage = selectedSpot?.riskPercentage || 50;

  return (
    <>
      <div style={{ position: 'relative', height: '500px', width: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-xl)' }} className="fade-in">
      
      {/* Universal Search Bar Overlay */}
      <style>{`
        /* ── Glass Controls ─────────────────────────── */
        .map-controls {
          position: absolute; top: 20px; left: 20px; z-index: 1000;
          width: 380px; padding: 25px;
          background: var(--glass-panel);
          backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }
        .map-controls h3 { color: white; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
        .map-controls p { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 2rem; }

        /* ── Live Scanner Animation ─────────────────── */
        .scan-pulse {
            position: absolute; width: 300px; height: 300px;
            border: 2px solid var(--neon-cyan);
            border-radius: 50%; opacity: 0;
            pointer-events: none; transform: translate(-50%, -50%);
            animation: ringScan 2.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) infinite;
            box-shadow: inset 0 0 40px rgba(34, 211, 238, 0.2), 0 0 40px rgba(34, 211, 238, 0.2);
        }
        @keyframes ringScan {
            0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0.9; }
            100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
        }

        .scan-radar {
            position: absolute; width: 400px; height: 400px;
            background: conic-gradient(from 0deg, transparent, rgba(34, 211, 238, 0.15) 30%, transparent 60%);
            border-radius: 50%; transform: translate(-50%, -50%);
            animation: rotateScan 4s linear infinite;
            pointer-events: none;
        }
        @keyframes rotateScan {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* ── Leaflet Theme Overrides ────────────────── */
        .leaflet-container { background: var(--bg-dark); }
        .leaflet-popup-content-wrapper { background: var(--bg-darker); color: white; border: 1px solid var(--glass-border); }
        .leaflet-popup-tip { background: var(--bg-darker); }
      `}</style>
      <div style={{
          position: 'absolute', top: '24px', left: '24px', zIndex: 1000, 
          width: '380px'
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', background: 'var(--glass-panel)', backdropFilter: 'blur(10px)', border: '1px solid var(--neon-cyan)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-neon)' }}>
          <div style={{ paddingLeft: '16px', display: 'flex', alignItems: 'center', color: 'var(--neon-cyan)' }}>
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search Pune Area (e.g., Baner, Katraj)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '16px 14px', background: 'transparent', border: 'none', outline: 'none', fontSize: '15px', color: 'white' }}
          />
          <button type="submit" disabled={isSearching} style={{ background: 'var(--gradient-cyan)', color: 'white', border: 'none', padding: '0 24px', cursor: 'pointer', fontWeight: '700' }}>
            {isSearching ? '...' : 'SCAN'}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div style={{ marginTop: '8px', background: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xl)', maxHeight: '250px', overflowY: 'auto' }}>
            {searchResults.map((result) => (
              <div 
                key={result.place_id} 
                onClick={() => handleSelectSearchResult(result)}
                style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '14px', color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '10px' }}
                className="search-item-hover"
              >
                <MapPin size={18} color="var(--primary-color)" style={{flexShrink: 0, marginTop: '2px'}} />
                <span>{result.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Satellite Scanning Animation Overlay */}
      {isScanning && (
        <div style={{
            position: 'absolute', inset: 0, zIndex: 1100,
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: 'white'
        }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '20px' }}>
                <div style={{ 
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '2px solid var(--primary-color)', animation: 'ping 1.5s infinite opacity'
                }}></div>
                <div style={{ 
                    position: 'absolute', inset: '10px', borderRadius: '50%',
                    border: '4px solid var(--accent-color)', borderTopColor: 'transparent',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <div style={{ 
                    position: 'absolute', inset: 0, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', fontWeight: '900', color: 'var(--primary-color)' 
                }}>{scanProgress}%</div>
            </div>
            <h3 style={{ color: 'white', letterSpacing: '4px' }}>SATELLITE SCANNING AREA...</h3>
            <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '8px' }}>PUNE TRAFFIC AI GRID v4.2</p>
        </div>
      )}

      {/* Mode Toggle Overlay */}
      <div style={{ 
        position: 'absolute', top: '24px', right: '24px', zIndex: 1000, 
        background: 'white', padding: '6px', borderRadius: '100px', boxShadow: 'var(--shadow-lg)',
        display: 'flex', gap: '4px'
      }}>
        <button 
          onClick={() => setIsSatellite(false)}
          style={{
            background: !isSatellite ? 'var(--primary-color)' : 'transparent',
            color: !isSatellite ? 'white' : 'var(--text-muted)',
            border: 'none', padding: '8px 16px', borderRadius: '100px', cursor: 'pointer',
            fontSize: '12px', fontWeight: '700', transition: 'var(--transition)'
          }}
        >MAP</button>
        <button 
          onClick={() => setIsSatellite(true)}
          style={{
            background: isSatellite ? 'var(--primary-color)' : 'transparent',
            color: isSatellite ? 'white' : 'var(--text-muted)',
            border: 'none', padding: '8px 16px', borderRadius: '100px', cursor: 'pointer',
            fontSize: '12px', fontWeight: '700', transition: 'var(--transition)'
          }}
        >SATELLITE</button>
      </div>

      {/* Map Rendering Container */}
      <div 
        ref={mapContainerRef} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      />
    </div>

    {/* Advanced Professional Overlay for Data BELOW MAP */}
    {selectedSpot && (
      <div className="fade-in" style={{
        marginTop: '24px',
        background: 'var(--glass-panel)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)',
        border: '1px solid var(--neon-cyan)', borderRadius: 'var(--radius-xl)',
        width: '100%', padding: '24px', color: 'white',
        boxShadow: 'var(--shadow-neon-lg)'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
              <div style={{ fontSize: '11px', color: 'var(--neon-cyan)', fontWeight: '800', letterSpacing: '2px', marginBottom: '4px' }}>LIVE STATION CONTEXT</div>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'white' }}>{selectedSpot.name}</h3>
          </div>
          {isSearchMode && <span style={{background: 'var(--neon-cyan)', color: '#020617', fontSize: '10px', padding: '4px 8px', borderRadius: '4px', fontWeight: '800'}}>REESTABLISH FEED</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
           <div style={{ background: 'rgba(34, 211, 238, 0.05)', border: '1px solid rgba(34, 211, 238, 0.2)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <SpeedometerGauge riskPercentage={activePercentage} />
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--neon-cyan)', marginTop: '8px' }}>LIVE RISK INDEX</div>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>TRAFFIC FLOW</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'white' }}>{selectedSpot.trafficStatus}</div>
              </div>
              <div style={{ background: 'rgba(248, 113, 113, 0.05)', border: '1px solid rgba(248, 113, 113, 0.2)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>RESTRICTION</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#f87171' }}>{selectedSpot.restriction}</div>
              </div>
           </div>
        </div>
        
        {/* Real Live API Data Feedback Box */}
        {liveContextData && (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                 <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700' }}>WEATHER</div>
                 <div style={{ fontSize: '12px', color: 'var(--neon-cyan)', fontWeight: '800' }}>{liveContextData.weatherType} {liveContextData.temperature}°C</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                 <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700' }}>TOPOLOGY</div>
                 <div style={{ fontSize: '12px', color: 'var(--neon-cyan)', fontWeight: '800' }}>{liveContextData.roadType}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                 <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700' }}>PEAK HOUR</div>
                 <div style={{ fontSize: '12px', color: liveContextData.isPeakHour ? '#f87171' : 'var(--neon-emerald)', fontWeight: '800' }}>{liveContextData.isPeakHour ? 'ACTIVE' : 'NO'}</div>
              </div>
           </div>
        )}

        <div style={{ background: 'rgba(34, 211, 238, 0.05)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--neon-cyan)' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>ANALYTIC INSIGHT</div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Detected risk factor: <strong style={{color: 'var(--neon-cyan)'}}>{selectedSpot.risk}</strong> based on live Pune telemetry.</p>
        </div>

        <button onClick={handleReset} style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: 'white', fontWeight: '700', cursor: 'pointer', transition: 'var(--transition)' }} className="search-item-hover">
           DISMISS SATELLITE FEED
        </button>
      </div>
    )}
  </>
  );
}
