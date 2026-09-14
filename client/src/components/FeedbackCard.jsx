import React from 'react';

export default function FeedbackCard({ issue, index }) {
  return (
    <div className="feedback-card glass">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="badge" style={{ background: 'var(--warning)', color: '#000' }}>
          #{index}
        </div>
        <h3 style={{ margin: 0 }}>{issue.title}</h3>
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>{issue.why}</p>
      
      <div style={{ background: 'var(--bg-deep)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
        <strong>How to fix:</strong> {issue.fix}
      </div>

      {(issue.before || issue.after) && (
        <div className="diff-box">
          {issue.before && <div className="diff-old">- {issue.before}</div>}
          {issue.after && <div className="diff-new">+ {issue.after}</div>}
        </div>
      )}
    </div>
  );
}
