import React, { useEffect } from 'react';
import ScoreBar from './ScoreBar';
import FeedbackCard from './FeedbackCard';
import { downloadPDFReport, downloadJSONReport } from '../services/pdfExporter';

export default function PostSessionDashboard({ analysis, onTryAgain, onNewSession, onHome }) {
  // Automatically persist completed session to local history
  useEffect(() => {
    if (analysis && analysis.hasSufficientSpeech) {
      try {
        const history = JSON.parse(localStorage.getItem('cadence_session_history') || '[]');
        const newRecord = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          mode: analysis.mode || 'conversation',
          overallScore: analysis.overall_score !== undefined ? analysis.overall_score : 75,
          analysis
        };
        // Dedupe
        if (!history.some(h => h.id === newRecord.id)) {
          localStorage.setItem('cadence_session_history', JSON.stringify([newRecord, ...history].slice(0, 20)));
        }
      } catch (e) {
        console.warn("History save error:", e);
      }
    }
  }, [analysis]);

  if (!analysis) {
    return (
      <div className="dashboard-empty glass fade-in" style={{ padding: '48px', textAlign: 'center', maxWidth: '600px', margin: '60px auto', borderRadius: '24px' }}>
        <h2>No Analysis Available</h2>
        <p style={{ color: 'var(--text-muted)', margin: '16px 0 24px' }}>Session completed without analysis data.</p>
        <button className="btn-primary" onClick={onNewSession}>Start New Training</button>
      </div>
    );
  }

  // Handle NO SPEECH / INSIGHTS GATED state
  if (analysis.hasSufficientSpeech === false || analysis.status === 'waiting_for_speech' || (analysis.overall_score === 0 && !analysis.transcript_text)) {
    return (
      <div className="dashboard-no-speech glass fade-in" style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '640px', margin: '40px auto', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎙️</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#f8fafc' }}>No Speech Captured</h2>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: '16px 0 32px', lineHeight: 1.6 }}>
          The AI Coach requires actual spoken speech to generate communication diagnostics. No audio or transcript text was detected during your session.
        </p>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '32px', textAlign: 'left' }}>
          <div style={{ fontWeight: 600, color: '#c084fc', marginBottom: '8px', fontSize: '0.9rem' }}>Quick Troubleshooting Checklist:</div>
          <ul style={{ color: '#94a3b8', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '20px' }}>
            <li>Ensure microphone permissions are allowed in your browser.</li>
            <li>Speak clearly and continuously for at least 15–30 seconds.</li>
            <li>Check that your microphone input device is selected properly.</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={onTryAgain} style={{ padding: '12px 28px' }}>Try Session Again</button>
          <button className="btn-secondary" onClick={onHome} style={{ padding: '12px 28px' }}>Return Home</button>
        </div>
      </div>
    );
  }

  const overallScore = analysis.overall_score !== undefined ? analysis.overall_score : (analysis.overallScore || 75);
  const coachMsg = analysis.coach_message || analysis.coachMessage || "Great effort! Here are your targeted communication insights.";
  const priorityIssues = analysis.priority_issues || analysis.priorityIssues || [];
  const strengths = analysis.strengths || [];
  const scores = analysis.scores || {};
  const bestMoment = analysis.best_moment || analysis.bestMoment;
  const weakestMoment = analysis.weakest_moment || analysis.weakestMoment;
  const exercise = analysis.recommended_exercise || analysis.exerciseRecommendation;
  const mode = analysis.mode || 'conversation';
  const metrics = analysis.metrics || {};
  const transcriptText = analysis.transcript_text || analysis.transcript || '';

  return (
    <div className="post-session-dashboard fade-in" style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Action Toolbar Header (Download PDF / JSON) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <button className="btn-secondary" onClick={onHome} style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
          ← Back to Dashboard
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-primary" 
            onClick={() => downloadPDFReport(analysis)}
            style={{ padding: '10px 22px', fontSize: '0.92rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
          >
            📄 Download PDF Report
          </button>

          <button 
            className="btn-secondary" 
            onClick={() => downloadJSONReport(analysis, mode)}
            style={{ padding: '10px 18px', fontSize: '0.92rem' }}
          >
            💾 Export JSON
          </button>
        </div>
      </div>

      {/* Main Score & Coach Message Banner */}
      <div className="dashboard-header glass" style={{ padding: '32px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.3)', marginBottom: '12px', width: 'fit-content' }}>
            {mode.toUpperCase()} DIAGNOSTIC REPORT
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#f8fafc', marginBottom: '12px' }}>Communication Analysis</h1>
          <p style={{ color: '#e2e8f0', fontSize: '1.05rem', lineHeight: 1.5, background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
            "{coachMsg}"
          </p>
        </div>

        <div className="score-ring-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div className="score-ring pulse-glow" style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            background: `conic-gradient(#8b5cf6 ${overallScore}%, rgba(255,255,255,0.06) 0%)`,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            position: 'relative'
          }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#0d0f17', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#f8fafc' }}>{overallScore}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Overall</span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Data-Grounded Score</span>
        </div>
      </div>

      {/* SPOKEN SESSION METRICS SUMMARY CARD */}
      <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#22d3ee', marginBottom: '16px' }}>📊 Spoken Session Metrics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>TOTAL WORDS</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>{metrics.words || (transcriptText ? transcriptText.split(/\s+/).length : 0)}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>SPEECH PACE</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>{metrics.wpmFormatted || `${metrics.wpm || '--'} WPM`}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>FILLERS DETECTED</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: (metrics.fillersCount > 3) ? '#ef4444' : '#f8fafc', marginTop: '4px' }}>
              {metrics.fillersCount || 0} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#94a3b8' }}>({metrics.fillerRate || '0%'})</span>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PAUSES (&gt;1.5S)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22d3ee', marginTop: '4px' }}>{metrics.pausesCount || 0}</div>
          </div>
        </div>
      </div>

      {/* CAPTURED TRANSCRIPT DISPLAY */}
      {transcriptText && (
        <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#f8fafc', marginBottom: '12px' }}>🗣️ Captured Speech Transcript</h3>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px 20px', borderRadius: '12px', color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6, borderLeft: '3px solid #22d3ee' }}>
            "{transcriptText}"
          </div>
        </div>
      )}

      {/* INTERVIEW DYNAMIC FOLLOW-UP */}
      {mode === 'interview' && (analysis.dynamic_followup_question || analysis.followUpQuestion) && (
        <div className="glass" style={{ padding: '24px', borderRadius: '20px', borderLeft: '4px solid #22d3ee' }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#22d3ee', fontWeight: 600, marginBottom: '8px' }}>Interviewer Dynamic Follow-up</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#f8fafc' }}>
            "{analysis.dynamic_followup_question || analysis.followUpQuestion}"
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '8px' }}>
            Generated based on your spoken answer above. Practice answering this follow-up in your retry attempt.
          </p>
        </div>
      )}

      {/* PRIORITY IMPROVEMENTS SECTION */}
      {priorityIssues.length > 0 && (
        <div className="priority-issues-section">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🎯</span> Top High-Leverage Improvements
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {priorityIssues.map((issue, idx) => (
              <FeedbackCard key={idx} index={idx + 1} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {/* METRIC BREAKDOWN GRID */}
      {Object.keys(scores).length > 0 && (
        <div className="glass" style={{ padding: '28px', borderRadius: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#f8fafc', marginBottom: '20px' }}>Communication Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {Object.entries(scores).map(([label, val]) => (
              <ScoreBar key={label} label={label.replace('_', ' ')} value={val} />
            ))}
          </div>
        </div>
      )}

      {/* BEST & WEAKEST MOMENTS */}
      {(bestMoment?.quote || weakestMoment?.quote) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {bestMoment?.quote && (
            <div className="glass" style={{ padding: '24px', borderRadius: '20px', borderLeft: '4px solid #22c55e' }}>
              <div style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>✓ BEST MOMENT</div>
              <blockquote style={{ fontStyle: 'italic', color: '#f1f5f9', marginBottom: '12px', fontSize: '0.98rem' }}>"{bestMoment.quote}"</blockquote>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{bestMoment.why_it_worked || bestMoment.whyItWorked}</p>
            </div>
          )}

          {weakestMoment?.quote && (
            <div className="glass" style={{ padding: '24px', borderRadius: '20px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>⚠️ WEAKEST MOMENT</div>
              <blockquote style={{ fontStyle: 'italic', color: '#f1f5f9', marginBottom: '12px', fontSize: '0.98rem' }}>"{weakestMoment.quote}"</blockquote>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{weakestMoment.why_it_failed || weakestMoment.whyItFailed}</p>
              {weakestMoment.better_approach && (
                <div style={{ marginTop: '10px', color: '#38bdf8', fontSize: '0.88rem', fontWeight: 500 }}>
                  💡 Better Approach: {weakestMoment.better_approach}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STRENGTHS */}
      {strengths.length > 0 && (
        <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#22c55e', marginBottom: '12px' }}>What Worked Well</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {strengths.map((str, idx) => (
              <div key={idx} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem' }}>
                ✓ {str}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECOMMENDED EXERCISE */}
      {exercise && (
        <div className="glass pulse-glow" style={{ padding: '28px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#c084fc', fontWeight: 600, marginBottom: '6px' }}>Recommended Practice Drill</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#f8fafc', marginBottom: '8px' }}>{exercise.title}</h3>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '16px', lineHeight: 1.5 }}>{exercise.description}</p>
          <button className="btn-primary" onClick={onTryAgain}>Start Practice Drill ({exercise.duration_seconds || 60}s)</button>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={onTryAgain} style={{ padding: '14px 32px' }}>Retry Session</button>
        <button className="btn-secondary" onClick={onNewSession} style={{ padding: '14px 32px' }}>New Agent Mode</button>
        <button className="btn-secondary" onClick={() => downloadPDFReport(analysis)} style={{ padding: '14px 28px' }}>Download PDF</button>
      </div>

    </div>
  );
}
