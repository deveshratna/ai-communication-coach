import React from 'react';

export default function Landing({ onStart }) {
  return (
    <div className="landing-container fade-in" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      
      {/* Hero Section */}
      <div className="hero-section" style={{ maxWidth: '820px', margin: '40px 0' }}>
        <div className="badge pulse-glow" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '8px 20px', borderRadius: '24px', fontSize: '0.88rem', marginBottom: '28px', fontWeight: 600, letterSpacing: '0.5px' }}>
          <span>🔥</span> HIGH-STAKES PRESENCE & COMMUNICATION STUDIO
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3.8rem', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-1px', color: '#f8fafc', marginBottom: '24px' }}>
          Become Impossible to <span className="text-gradient" style={{ background: 'linear-gradient(135deg, #22d3ee 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ignore.</span>
        </h1>

        <p style={{ fontSize: '1.25rem', color: '#94a3b8', lineHeight: 1.65, marginBottom: '40px', fontWeight: 400, maxWidth: '720px', margin: '0 auto 40px' }}>
          Speak with absolute authority. Structure thoughts instantly under pressure. Command any room without missing a beat.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={onStart} style={{ padding: '16px 42px', fontSize: '1.12rem', borderRadius: '14px', fontWeight: 600 }}>
            Enter Studio & Select Agent →
          </button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', width: '100%', marginTop: '40px' }}>
        <div className="glass" style={{ padding: '32px 24px', borderRadius: '20px', textAlign: 'left' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🎯</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#f8fafc', marginBottom: '8px' }}>Speech-Grounded AI</h3>
          <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.5 }}>
            No fabricated metrics. Every filler word count, score, and recommendation is strictly grounded in your actual captured transcript.
          </p>
        </div>

        <div className="glass" style={{ padding: '32px 24px', borderRadius: '20px', textAlign: 'left' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🤖</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#f8fafc', marginBottom: '8px' }}>9 Specialized Agents</h3>
          <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Dedicated prompt architectures, metric schemas, and interactive behaviors for Storytelling, Interview Prep, Wit, Public Speaking, and Technical Explanations.
          </p>
        </div>

        <div className="glass" style={{ padding: '32px 24px', borderRadius: '20px', textAlign: 'left' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📷</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#f8fafc', marginBottom: '8px' }}>Live Camera Studio</h3>
          <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Mirrored real-time video feed and live transcript streaming so you can monitor your posture, eye contact, and sentence flow.
          </p>
        </div>
      </div>

    </div>
  );
}
