import React, { useState, useEffect } from 'react';
import { downloadPDFReport } from '../services/pdfExporter';

export default function SessionHistory({ onBack }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cadence_session_history') || '[]');
      setSessions(stored);
    } catch (e) {
      setSessions([]);
    }
  }, []);

  const handleDelete = (id) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('cadence_session_history', JSON.stringify(updated));
  };

  return (
    <div className="dashboard fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button className="btn-secondary" onClick={onBack} style={{ padding: '8px 16px' }}>← Back</button>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#f8fafc' }}>
          Training History
        </h2>
      </div>

      {sessions.length === 0 ? (
        <div className="empty-state glass" style={{ padding: '48px', textAlign: 'center', borderRadius: '20px', color: '#94a3b8' }}>
          No recorded sessions yet. Complete your first training in Cadence Studio!
        </div>
      ) : (
        <div className="session-history" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sessions.map((session, i) => {
            const dateStr = session.timestamp ? new Date(session.timestamp).toLocaleDateString() : 'Recent';
            const score = session.overallScore || session.analysis?.overall_score || 0;
            return (
              <div 
                key={session.id || i} 
                className="history-card glass slide-up" 
                style={{ 
                  animationDelay: `${i * 0.05}s`,
                  padding: '20px 24px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#f8fafc' }}>
                      {(session.mode || 'general').toUpperCase()}
                    </h3>
                    <span className="badge" style={{ background: 'rgba(139,92,246,0.15)', color: '#c084fc' }}>{dateStr}</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
                    "{session.analysis?.coach_message?.substring(0, 75) || "Completed communication diagnostic."}..."
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: score >= 80 ? '#4ade80' : '#c084fc' }}>
                      {score}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>SCORE</div>
                  </div>

                  <button 
                    className="btn-secondary" 
                    onClick={() => downloadPDFReport(session.analysis)}
                    style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                  >
                    📄 PDF Report
                  </button>

                  <button 
                    className="btn-icon danger" 
                    onClick={() => handleDelete(session.id)}
                    title="Delete Session"
                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
