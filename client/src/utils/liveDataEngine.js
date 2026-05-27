// This utility deterministically simulates live satellite metrics based on geolocation.
// To avoid paid enterprise APIs, it hashes the lat/lng into realistic data patterns.

export const generateLiveSatelliteData = (lat, lng, name) => {
  // Simple deterministic hash based on coordinates
  let rawHash = Math.abs(Math.sin((parseFloat(lat) + parseFloat(lng)) * 10000)) * 100;
  
  // Base Risk Calculation (0-100)
  // Let certain keywords increase risk
  const nameLower = name.toLowerCase();
  if (nameLower.includes('junction') || nameLower.includes('chowk') || nameLower.includes('bridge')) {
    rawHash = Math.max(65, rawHash + 25);
  }
  if (nameLower.includes('highway') || nameLower.includes('road')) {
    rawHash = Math.max(50, rawHash + 15);
  }
  
  // Cap at 98%
  let riskPercentage = Math.min(98, Math.max(2, Math.floor(rawHash)));

  // Determine Severity String and Colors based on Risk
  let severity = 'Minor';
  let restriction = 'Level 0 (Normal)';
  let trafficStatus = 'Light Traffic';
  let riskZoneType = 'Low Risk Zone';

  if (riskPercentage >= 80) {
    severity = 'Fatal';
    restriction = 'Level 5 (Emergency Only)';
    trafficStatus = 'Standstill / Severe Congestion';
    riskZoneType = 'Blackspot / Critical Gradient';
  } else if (riskPercentage >= 60) {
    severity = 'Major';
    restriction = 'Level 3 (Lane Closures & Checks)';
    trafficStatus = 'Heavy Congestion';
    riskZoneType = 'High Traffic Density Risk';
  } else if (riskPercentage >= 35) {
    severity = 'Moderate';
    restriction = 'Level 1 (Speed Limits Checked)';
    trafficStatus = 'Moderate Traffic Flow';
    riskZoneType = 'Active Urban Density';
  } else {
    severity = 'Minor';
    restriction = 'Level 0 (Normal Operations)';
    trafficStatus = 'Smooth Flowing';
    riskZoneType = 'Low Visibility/Standard Risk';
  }

  return {
    riskPercentage,     // Int 0-100
    severity,           // String
    restriction,        // String
    trafficStatus,      // String
    riskZoneType        // String
  };
};
