import React, { useEffect, useState } from 'react';
import { getAudioLevel } from '../services/audioCapture';

export default function CameraPreview({ videoRef, hasCamera, isCameraEnabled = true }) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (hasCamera && isCameraEnabled) return;
    const id = setInterval(() => {
      setLevel(getAudioLevel());
    }, 100);
    return () => clearInterval(id);
  }, [hasCamera, isCameraEnabled]);

  return (
    <div className="camera-preview-wrapper" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '380px', borderRadius: '16px', overflow: 'hidden', background: '#090a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <video 
        ref={videoRef} 
        className="camera-video" 
        autoPlay 
        muted 
        playsInline 
        style={{ 
          display: (hasCamera && isCameraEnabled) ? 'block' : 'none',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)' // Mirrored preview
        }} 
      />
      
      {(!hasCamera || !isCameraEnabled) && (
        <div className="camera-off-fallback fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '16px' }}>
          <div className="audio-avatar pulse-glow" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>
            🎙️
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#94a3b8' }}>
            {!isCameraEnabled ? "Camera Off • Microphone Active" : "Camera Unavailable • Audio Mode"}
          </div>
          <div className="audio-visualizer" style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '32px' }}>
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div 
                key={i} 
                className="audio-bar" 
                style={{ 
                  width: '6px',
                  borderRadius: '3px',
                  background: 'var(--accent-gradient)',
                  height: `${Math.max(8, (level / 255) * 32 * (Math.random() * 0.6 + 0.4))}px`,
                  transition: 'height 0.1s ease'
                }} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
