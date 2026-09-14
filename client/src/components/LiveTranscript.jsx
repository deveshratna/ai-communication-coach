import React, { useEffect, useRef } from 'react';

export default function LiveTranscript({ entries = [], interimText = '' }) {
  const containerRef = useRef(null);
  
  const visibleEntries = entries.slice(-3);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [entries, interimText]);

  if (visibleEntries.length === 0 && !interimText.trim()) return null;

  return (
    <div className="transcript-overlay" ref={containerRef} style={{
      position: 'absolute',
      bottom: '16px',
      left: '16px',
      right: '16px',
      background: 'rgba(10, 11, 18, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '14px',
      padding: '14px 18px',
      maxHeight: '140px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      zIndex: 10
    }}>
      {visibleEntries.map((entry, i) => (
        <div 
          key={entry.timestamp + i} 
          className={`transcript-line ${entry.speaker}`}
          style={{ 
            fontSize: '0.92rem', 
            color: entry.speaker === 'coach' ? '#c084fc' : '#f1f5f9',
            fontWeight: entry.speaker === 'coach' ? 600 : 400
          }}
        >
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: entry.speaker === 'coach' ? '#c084fc' : '#22d3ee', marginRight: '8px', fontWeight: 600 }}>
            {entry.speaker === 'coach' ? 'Coach' : 'You'}:
          </span>
          {entry.text}
        </div>
      ))}

      {/* Streaming interim live words */}
      {interimText.trim() && (
        <div className="transcript-line interim" style={{ fontSize: '0.92rem', color: '#94a3b8', fontStyle: 'italic' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#22d3ee', marginRight: '8px', fontWeight: 600 }}>
            Speaking:
          </span>
          {interimText.trim()}...
        </div>
      )}
    </div>
  );
}
