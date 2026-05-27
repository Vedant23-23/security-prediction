import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const SeverityBadge = ({ severity }) => {
  const getSeverityStyle = () => {
    switch (severity?.toLowerCase()) {
      case 'fatal': 
        return { 
          class: 'fatal', 
          icon: <AlertCircle size={16} />, 
          text: 'F-1: FATAL HIGH RISK' 
        };
      case 'major':
      case 'serious':
        return { 
          class: 'major', 
          icon: <AlertTriangle size={16} />, 
          text: 'S-2: MAJOR INCIDENT' 
        };
      case 'minor':
      case 'slight':
        return { 
          class: 'minor', 
          icon: <ShieldCheck size={16} />, 
          text: 'M-3: MINOR IMPACT' 
        };
      default:
        return { 
          class: '', 
          icon: null, 
          text: 'N/A: UNCERTAIN RISK' 
        };
    }
  };

  const style = getSeverityStyle();

  return (
    <div className={`severity-badge ${style.class}`}>
      {style.icon}
      <span>{style.text}</span>
    </div>
  );
};

export default SeverityBadge;
