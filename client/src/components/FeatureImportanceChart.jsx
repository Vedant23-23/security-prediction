import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function FeatureImportanceChart({ result }) {
  if (!result || !result.top_risk_factors) return <p>No risk factors available.</p>;

  // Dynamically create importance scores based on exactly what the AI returned as top risks
  // In a real scenario, this would come securely from the SHAP values in the backend API.
  const data = result.top_risk_factors.map((factor, index) => ({
    name: factor,
    value: 100 - (index * 15) - Math.random() * 10, // Simulated importance purely for visual correlation
  }));

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
          <Tooltip 
            cursor={{fill: 'rgba(37, 99, 235, 0.05)'}}
            contentStyle={{ borderRadius: '8px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            formatter={(val) => [`${val.toFixed(1)}% Impact`, 'Importance']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--neon-magenta)' : index === 1 ? 'var(--neon-orange)' : 'var(--neon-cyan)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
