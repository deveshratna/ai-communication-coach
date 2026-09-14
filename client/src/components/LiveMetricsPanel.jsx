import React from 'react';

const FILLER_COLORS = {
  0: '#22c55e',
  low: '#22d3ee',
  medium: '#f59e0b',
  high: '#ef4444'
};

function MiniBar({ value = 0, color = '#8b5cf6', label = '' }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
          <span style={{ color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
          <span style={{ color: '#f8fafc', fontWeight: 700 }}>{pct}%</span>
        </div>
      )}
      <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color, borderRadius: '3px',
          transition: 'width 0.4s ease'
        }} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, color = '#f8fafc', alert = false }) {
  return (
    <div className={`metric-box${alert ? ' alert' : ''}`} style={{
      padding: '14px', borderRadius: '14px',
      background: 'rgba(255, 255, 255, 0.025)',
      border: `1px solid ${alert ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.07)'}`,
      transition: 'all 0.2s ease'
    }}>
      <div style={{ fontSize: '0.7rem', color: alert ? '#ef4444' : '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{
        fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 800,
        color: alert ? '#ef4444' : color, margin: '4px 0 2px', lineHeight: 1
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{sub}</div>}
    </div>
  );
}

export default function LiveMetricsPanel({ metrics, mode, targetQuestion, modeInfo }) {
  const {
    words = 0,
    wpmFormatted = '--',
    wpm = 0,
    fillersCount = 0,
    fillerBreakdown = {},
    fillerRate = '0%',
    pauseGapSeconds = 0,
    pausesCount = 0,
    audioLevelPct = 0
  } = metrics || {};

  const fillerAlert = fillersCount > 3;
  const wpmColor = wpm < 100 ? '#f59e0b' : wpm > 180 ? '#ef4444' : '#22c55e';
  const topFillers = Object.entries(fillerBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="live-metrics-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* ── Panel Title ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px'
      }}>
        <span style={{
          fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700,
          color: '#8b5cf6', letterSpacing: '0.06em'
        }}>
          Live Analytics
        </span>
        <span style={{ fontSize: '0.7rem', color: '#475569' }}>Real-time</span>
      </div>

      {/* ── Core Metrics Grid ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <MetricCard
          label="Speech Pace"
          value={wpmFormatted}
          sub="Target: 130–160 WPM"
          color={wpmColor}
        />
        <MetricCard
          label="Fillers"
          value={`${fillersCount}`}
          sub={fillersCount === 0 ? 'Clean speech ✓' : `${fillerRate} of speech`}
          color={fillerAlert ? '#ef4444' : '#22c55e'}
          alert={fillerAlert}
        />
        <MetricCard
          label="Pause Gap"
          value={`${pauseGapSeconds}s`}
          sub={`${pausesCount} pauses >1.5s`}
          color="#22d3ee"
        />
        <MetricCard
          label="Mic Energy"
          value={`${audioLevelPct}%`}
          sub={audioLevelPct > 5 ? 'Active ●' : 'Silent ○'}
          color={audioLevelPct > 5 ? '#22c55e' : '#f59e0b'}
        />
      </div>

      {/* ── Word Count bar ────────────────────────────────────────────────── */}
      <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Words Spoken</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-display)' }}>{words}</span>
        </div>
        <MiniBar value={Math.min(100, (words / 200) * 100)} color="linear-gradient(90deg, #22d3ee, #8b5cf6)" />
        <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: '4px' }}>
          {words < 30 ? 'Keep going...' : words < 100 ? 'Good amount of content' : 'Great depth of response'}
        </div>
      </div>

      {/* ── Filler Word Breakdown ─────────────────────────────────────────── */}
      {topFillers.length > 0 && (
        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.12)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#ef4444', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.06em' }}>
            Filler Breakdown
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {topFillers.map(([word, count]) => (
              <span key={word} style={{
                padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem',
                background: 'rgba(239, 68, 68, 0.12)', color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 500
              }}>
                "{word}" ×{count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Mode-Specific Panel ───────────────────────────────────────────── */}
      <div style={{
        padding: '14px', borderRadius: '14px',
        background: 'rgba(139, 92, 246, 0.06)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderLeft: '3px solid #8b5cf6'
      }}>
        {/* INTERVIEW MODE */}
        {mode === 'interview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#c084fc', fontWeight: 700, letterSpacing: '0.06em' }}>
              Interview Target Question
            </div>
            <div style={{ fontSize: '0.9rem', color: '#f1f5f9', lineHeight: 1.5, fontStyle: 'italic' }}>
              "{targetQuestion || 'Awaiting interview question...'}"
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              {['Situation', 'Task', 'Action', 'Result'].map(part => (
                <div key={part} style={{
                  padding: '6px 10px', borderRadius: '8px', fontSize: '0.78rem',
                  background: words > ['Situation', 'Task', 'Action', 'Result'].indexOf(part) * 40 ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                  color: words > ['Situation', 'Task', 'Action', 'Result'].indexOf(part) * 40 ? '#4ade80' : '#64748b',
                  border: `1px solid ${words > ['Situation', 'Task', 'Action', 'Result'].indexOf(part) * 40 ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  fontWeight: 600, textAlign: 'center'
                }}>
                  {part}
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>STAR Framework Progress</div>
          </div>
        )}

        {/* STORYTELLING MODE */}
        {mode === 'storytelling' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#22d3ee', fontWeight: 700, letterSpacing: '0.06em' }}>
              Story Structure Meter
            </div>
            {[
              { label: 'Hook', threshold: 10 },
              { label: 'Stakes/Conflict', threshold: 40 },
              { label: 'Tension', threshold: 80 },
              { label: 'Resolution', threshold: 140 }
            ].map(({ label, threshold }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: words >= threshold ? '#22c55e' : 'rgba(255,255,255,0.12)',
                  boxShadow: words >= threshold ? '0 0 6px #22c55e' : 'none',
                  flexShrink: 0, transition: 'all 0.4s ease'
                }} />
                <span style={{ fontSize: '0.82rem', color: words >= threshold ? '#f1f5f9' : '#475569', transition: 'color 0.4s ease' }}>
                  {label}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: words >= threshold ? '#22c55e' : '#475569' }}>
                  {words >= threshold ? 'Active ✓' : `~${threshold - words}w`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* PUBLIC SPEAKING MODE */}
        {mode === 'public_speaking' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#f59e0b', fontWeight: 700, letterSpacing: '0.06em' }}>
              Presentation Metrics
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <MiniBar value={wpm >= 130 && wpm <= 160 ? 90 : wpm > 0 ? 50 : 0} color="#f59e0b" label="Pace Control" />
              <MiniBar value={pausesCount > 2 ? 80 : pausesCount * 20} color="#22d3ee" label="Deliberate Pauses" />
              <MiniBar value={Math.min(100, words / 2)} color="#8b5cf6" label="Content Depth" />
            </div>
          </div>
        )}

        {/* IMPROMPTU MODE */}
        {mode === 'impromptu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#22d3ee', fontWeight: 700 }}>
              Impromptu Performance
            </div>
            <div style={{ fontSize: '0.88rem', color: '#f1f5f9' }}>
              Structure Framework Detected:
            </div>
            <div style={{
              padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem',
              background: words > 30 ? 'rgba(34,211,238,0.08)' : 'rgba(255,255,255,0.04)',
              color: words > 30 ? '#22d3ee' : '#64748b',
              border: `1px solid ${words > 30 ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.06)'}`
            }}>
              {words < 10 ? '⏳ Forming response...' :
               words < 30 ? '🎯 Point identified' :
               words < 60 ? '📋 Building reasoning...' :
               words < 100 ? '💡 Providing examples...' :
               '✅ Strong conclusion pending'}
            </div>
          </div>
        )}

        {/* TECHNICAL MODE */}
        {mode === 'technical' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#22d3ee', fontWeight: 700 }}>
              Explanation Quality
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <MiniBar value={Math.min(100, words / 1.5)} color="#22d3ee" label="Coverage" />
              <MiniBar value={fillersCount === 0 ? 100 : Math.max(0, 100 - fillersCount * 15)} color="#10b981" label="Fluency" />
            </div>
          </div>
        )}

        {/* WIT MODE */}
        {mode === 'wit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#f59e0b', fontWeight: 700 }}>
              Wit & Sharpness
            </div>
            <div style={{ fontSize: '0.88rem', color: '#f1f5f9', lineHeight: 1.5 }}>
              Tip: Use unexpected comparisons and memorable metaphors.
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {words < 20 ? 'Starting fresh...' : words < 60 ? 'Building the frame...' : 'Looking for the twist...'}
            </div>
          </div>
        )}

        {/* DEFAULT / CONVERSATION MODE */}
        {(!mode || mode === 'conversation' || mode === 'deep_analysis' || mode === 'daily_training') && (
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#c084fc', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '8px' }}>
              Communication Status
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Words spoken</span>
                <span style={{ color: '#f8fafc', fontWeight: 600 }}>{words}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Filler rate</span>
                <span style={{ color: fillerAlert ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{fillerRate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Pace</span>
                <span style={{ color: wpmColor, fontWeight: 600 }}>{wpmFormatted}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Coach Tip ─────────────────────────────────────────────────────── */}
      {words > 10 && words < 50 && (
        <div style={{
          padding: '10px 14px', borderRadius: '12px', fontSize: '0.8rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          color: '#94a3b8', lineHeight: 1.5
        }}>
          <span style={{ color: '#c084fc', fontWeight: 600 }}>Coach: </span>
          {fillerAlert
            ? 'Pause instead of using filler words. Silence is power.'
            : wpm > 180
            ? 'Slow down — deliberate pace adds authority.'
            : wpm > 0 && wpm < 100
            ? 'Pick up the pace slightly to maintain audience engagement.'
            : 'Good rhythm. Keep your main point clear and direct.'}
        </div>
      )}
    </div>
  );
}
