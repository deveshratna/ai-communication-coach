import React from 'react';

export default function ScoreBar({ label, score }) {
  let color = 'var(--success)';
  if (score < 40) color = 'var(--danger)';
  else if (score < 70) color = 'var(--warning)';

  return (
    <div className="score-bar-container">
      <div className="score-bar-header">
        <span>{label}</span>
        <span style={{ fontWeight: 600, color }}>{score}/100</span>
      </div>
      <div className="score-bar-track">
        <div 
          className="score-bar-fill" 
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
