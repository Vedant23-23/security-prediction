import React, { useEffect, useState } from 'react';

const SpeedometerGauge = ({ riskPercentage }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  // Smooth animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(riskPercentage);
    }, 300); // Deploy animation after modal opens
    return () => clearTimeout(timer);
  }, [riskPercentage]);

  // SVG dimensions
  const radius = 60;
  const strokeWidth = 12;
  const center = 75; // Container is 150x100
  // Arc spans 180 degrees (from 180 to 0 coordinate wise)
  const circumference = Math.PI * radius; // Half circle

  // Map 0-100 percentage to 0..circumference specifically for dashoffset
  const fillPct = (100 - animatedValue) / 100; // Inverse for SVG dashoffset
  const dashoffset = fillPct * circumference;

  // Determine color dynamically
  const getColor = (val) => {
    if (val >= 80) return '#e11d48'; // Red (Fatal)
    if (val >= 60) return '#ea580c'; // Orange (Major)
    if (val >= 35) return '#eab308'; // Yellow (Moderate)
    return '#16a34a'; // Green (Minor)
  };
  const activeColor = getColor(animatedValue);

  // Needle angle calculation (Map 0-100 to 0-180 degrees)
  // 0% => -90deg, 100% => +90deg
  const needleAngle = (animatedValue / 100) * 180 - 90;

  return (
    <div style={{ textAlign: 'center', margin: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '150px', height: '85px' }}>
        <svg width="150" height="90" viewBox="0 0 150 90">
          
          {/* Background Arc */}
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Glowing Foreground Arc */}
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            fill="none"
            stroke={activeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{ 
              transition: 'stroke-dashoffset 1s ease-out, stroke 1s ease-out',
              filter: `drop-shadow(0px 0px 4px ${activeColor})`
            }}
          />

          {/* Needle Base */}
          <circle cx={center} cy={center} r="6" fill="#f8fafc" />

          {/* Animated Needle */}
          <g style={{ 
            transform: `rotate(${needleAngle}deg)`, 
            transformOrigin: `${center}px ${center}px`,
            transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)' 
          }}>
            <path d={`M ${center - 3} ${center} L ${center} ${center - radius + 15} L ${center + 3} ${center} Z`} fill="#f8fafc" />
          </g>
        </svg>

        {/* Live Text Overlay */}
        <div style={{ 
          position: 'absolute', bottom: '-8px', width: '100%', textAlign: 'center', 
          fontSize: '22px', fontWeight: 'bold', color: activeColor,
          textShadow: `0 0 8px ${activeColor}40`
        }}>
          {Math.round(animatedValue)}<span style={{ fontSize: '12px', color: '#94a3b8' }}>%</span>
        </div>
      </div>
    </div>
  );
};

export default SpeedometerGauge;
