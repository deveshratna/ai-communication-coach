import React, { useState } from 'react';

export default function InterviewSetup({ onStartInterview }) {
  const [track, setTrack] = useState('Behavioral');
  const [role, setRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');

  const handleGenerateQuestion = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/analysis/interview-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track, role, difficulty })
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.question) {
          setCurrentQuestion(data.question);
        } else {
          throw new Error('No question in response');
        }
      } else {
        throw new Error('API error');
      }
    } catch (e) {
      // Fallback questions by track
      const fallbacks = {
        'Behavioral': 'Tell me about a time you had to navigate a difficult conflict within your team. What did you do and what was the outcome?',
        'HR': 'What specifically about this company and role made you decide to apply, and what value do you believe you bring to this team?',
        'Technical': 'Walk me through how you would approach debugging a production issue that is affecting 20% of users but is not reproducible in staging.',
        'Leadership': 'Describe a situation where you had to champion an unpopular but necessary decision. How did you bring your team along?'
      };
      setCurrentQuestion(fallbacks[track] || fallbacks['Behavioral']);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="interview-setup-container glass fade-in" style={{ maxWidth: '720px', margin: '40px auto', padding: '36px', borderRadius: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💼</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#f8fafc' }}>
          Interview Prep Studio
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.98rem', marginTop: '6px' }}>
          Configure your interview track to generate a target question before recording.
        </p>
      </div>

      {!currentQuestion ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c084fc', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Interview Track
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {['Behavioral', 'HR', 'Technical', 'Leadership'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTrack(t)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: track === t ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                    background: track === t ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                    color: track === t ? '#f8fafc' : '#94a3b8',
                    fontWeight: track === t ? 600 : 400,
                    cursor: 'pointer'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#22d3ee', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Target Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#0d0f17',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#f8fafc',
                fontSize: '0.95rem'
              }}
            >
              <option value="Software Engineer">Software Engineer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Engineering Manager">Engineering Manager</option>
              <option value="Executive Leader">Executive Leader</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Difficulty
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {['Beginner', 'Intermediate', 'Advanced'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: difficulty === d ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                    background: difficulty === d ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
                    color: difficulty === d ? '#f8fafc' : '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleGenerateQuestion}
            disabled={isGenerating}
            style={{ padding: '14px', fontSize: '1.05rem', marginTop: '12px' }}
          >
            {isGenerating ? "Generating Interview Question..." : "Generate Question & Proceed →"}
          </button>
        </div>
      ) : (
        <div className="question-display-box fade-in" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#c084fc', fontWeight: 600 }}>
              {track} Interview Question ({role})
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#f8fafc', marginTop: '6px', lineHeight: 1.4 }}>
              "{currentQuestion}"
            </h3>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px 18px', borderRadius: '12px', fontSize: '0.88rem', color: '#94a3b8', borderLeft: '3px solid #22d3ee' }}>
            <strong style={{ color: '#22d3ee' }}>Task:</strong> Answer directly in 60–120 seconds using the <strong>STAR method</strong> (Situation, Task, Action, Result). State your role clearly.
          </div>

          {/* Optional: Text Input for Answer */}
          <div style={{ marginTop: '8px' }}>
            <label style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#f59e0b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Or Type Your Answer (Optional)
            </label>
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer here instead of speaking..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9',
                fontSize: '0.92rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: 1.5
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              className="btn-primary"
              onClick={() => onStartInterview({ question: currentQuestion, track, role, difficulty, textAnswer: textAnswer.trim() || null })}
              style={{ flex: 1, padding: '14px' }}
            >
              Start Answer (Mic ON) 🎙️
            </button>
            <button
              className="btn-secondary"
              onClick={() => setCurrentQuestion(null)}
              style={{ padding: '14px 20px' }}
            >
              Change Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
