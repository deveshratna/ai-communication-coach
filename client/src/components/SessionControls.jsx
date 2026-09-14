import React from 'react';

export default function SessionControls({ onEnd, hasMic, hasCamera, onToggleMic, onToggleCamera }) {
  return (
    <div className="session-controls glass-subtle slide-up" style={{ animationDelay: '0.2s' }}>
      <button 
        className={`btn-icon ${!hasMic ? 'danger' : ''}`} 
        onClick={onToggleMic}
        title="Toggle Microphone"
      >
        🎤
      </button>
      <button 
        className={`btn-icon ${!hasCamera ? 'danger' : ''}`} 
        onClick={onToggleCamera}
        title="Toggle Camera"
      >
        📷
      </button>
      <button 
        className="btn-primary" 
        style={{ background: 'var(--danger)', boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)' }}
        onClick={onEnd}
      >
        Stop Session
      </button>
    </div>
  );
}
