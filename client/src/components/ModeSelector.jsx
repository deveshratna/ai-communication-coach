import React from 'react';

export const MODES = [
  {
    id: 'conversation',
    title: 'General Communication',
    icon: '🎙️',
    description: 'Speak with clarity, structure, and precision in everyday interactions.',
    metrics: ['Clarity', 'Structure', 'Fillers', 'Confidence']
  },
  {
    id: 'storytelling',
    title: 'Storytelling Lab',
    icon: '📖',
    description: 'Master hooks, stakes, tension, emotional variation, and memorable endings.',
    metrics: ['Hook', 'Stakes', 'Tension', 'Resolution']
  },
  {
    id: 'wit',
    title: 'Wit & Playful Framing',
    icon: '⚡',
    description: 'Train clever comparisons, unexpected reframing, timing, and verbal sharpness.',
    metrics: ['Timing', 'Framing', 'Analogy', 'Sharpness']
  },
  {
    id: 'interview',
    title: 'Interview Prep',
    icon: '💼',
    description: 'Ace behavioral, technical, and executive questions with dynamic interviewer follow-ups.',
    metrics: ['STAR Structure', 'Ownership', 'Directness']
  },
  {
    id: 'public_speaking',
    title: 'Public Speaking',
    icon: '🎙️',
    description: 'Present to simulated audiences with vocal variation, strong hooks, and emphasis.',
    metrics: ['Vocal Variation', 'Engagement', 'Transitions']
  },
  {
    id: 'technical',
    title: 'Technical Explanation',
    icon: '🧠',
    description: 'Explain complex technical concepts simply using analogies and audience adaptation.',
    metrics: ['Simplicity', 'Analogy', 'Audience Adaptation']
  },
  {
    id: 'impromptu',
    title: 'Impromptu Challenge',
    icon: '⚡',
    description: 'Think on your feet with spontaneous topics under time pressure.',
    metrics: ['Thinking Speed', 'Structure', 'Fluency']
  },
  {
    id: 'deep_analysis',
    title: 'Deep Diagnostic',
    icon: '🔍',
    description: 'Comprehensive evaluation across language, delivery, structure, and presence.',
    metrics: ['Multi-Dimensional Analysis']
  },
  {
    id: 'daily_training',
    title: 'Daily Micro-Drill',
    icon: '🎯',
    description: 'Personalized 60-second exercise targeting your recurring communication habits.',
    metrics: ['Habit Precision', 'Execution']
  }
];

export default function ModeSelector({ onSelectMode }) {
  return (
    <div className="mode-selector-container fade-in" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#f8fafc', marginBottom: '12px' }}>
          Choose Your Coaching Agent
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Select a specialized communication agent tailored for your specific practice objective.
        </p>
      </div>

      <div className="modes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {MODES.map((mode) => (
          <div 
            key={mode.id} 
            className="mode-card glass" 
            onClick={() => onSelectMode(mode.id)}
            style={{
              padding: '24px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifySpace: 'space-between',
              transition: 'all 0.25s ease',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '2.2rem' }}>{mode.icon}</span>
                <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  SELECT →
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#f8fafc', marginBottom: '8px' }}>
                {mode.title}
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
                {mode.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              {mode.metrics.map((m, idx) => (
                <span key={idx} style={{ fontSize: '0.78rem', color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.04)', padding: '3px 8px', borderRadius: '6px' }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
