import React, { useEffect, useState, useRef, useCallback } from 'react';
import CameraPreview from './CameraPreview';
import SessionControls from './SessionControls';
import CoachingIndicator from './CoachingIndicator';
import InterviewSetup from './InterviewSetup';
import LiveMetricsPanel from './LiveMetricsPanel';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { useTimer } from '../hooks/useTimer';
import { useTranscript } from '../hooks/useTranscript';
import { useLiveMetrics } from '../hooks/useLiveMetrics';
import { fetchEphemeralToken, startSession, analyzeSession } from '../services/api';
import { getAudioLevel } from '../services/audioCapture';

export default function LiveSession({ sessionData, onEnd }) {
  const isInterviewMode = sessionData?.mode === 'interview';
  // SETUP → STARTING → READY → LISTENING → USER_SPEAKING → PROCESSING
  const [sessionState, setSessionState] = useState(isInterviewMode ? 'SETUP' : 'STARTING');
  const [interviewConfig, setInterviewConfig] = useState(null);
  const [sessionDbId, setSessionDbId] = useState(null);
  const [coachMessage, setCoachMessage] = useState(null);
  const [useSpeechFallback, setUseSpeechFallback] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [currentAudioLevel, setCurrentAudioLevel] = useState(0);
  const [textInputMode, setTextInputMode] = useState(false);
  const [textInputValue, setTextInputValue] = useState('');

  const {
    startCamera,
    stopCamera,
    startMic,
    stopMic,
    hasCameraPermission,
    hasMicPermission
  } = useMediaDevices();

  const { formatted: timerFormatted, start: startTimer, stop: stopTimer } = useTimer();
  const transcript = useTranscript();

  const [token, setToken] = useState(null);
  const gemini = useGeminiLive(token, sessionData?.mode);
  const geminiRef = useRef(gemini);

  useEffect(() => {
    geminiRef.current = gemini;
  }, [gemini]);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioPollIntervalRef = useRef(null);
  const cameraInitializedRef = useRef(false);
  const micInitializedRef = useRef(false);
  const sessionInitializedRef = useRef(false);

  const modeInfo = MODE_DETAILS[sessionData?.mode] || MODE_DETAILS.conversation;

  // Real-Time Local Analytics Hook
  const liveMetrics = useLiveMetrics(
    transcript.getUserTextOnly(),
    sessionState === 'USER_SPEAKING',
    currentAudioLevel
  );

  // ── Camera Init (only once, stable) ──────────────────────────────────────
  useEffect(() => {
    if (sessionState === 'SETUP') return;
    if (cameraInitializedRef.current) return;
    if (!isCameraActive) return;

    cameraInitializedRef.current = true;
    (async () => {
      if (videoRef.current) {
        try {
          await startCamera(videoRef.current);
        } catch (e) {
          console.warn('Camera init failed:', e);
        }
      }
    })();

    return () => {
      stopCamera();
      cameraInitializedRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionState]);

  // Toggle camera on/off without reinitializing
  useEffect(() => {
    if (sessionState === 'SETUP') return;
    if (!cameraInitializedRef.current) return;
    if (isCameraActive) {
      startCamera(videoRef.current).catch(() => {});
    } else {
      stopCamera();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraActive]);

  // ── Audio level polling ───────────────────────────────────────────────────
  useEffect(() => {
    if (sessionState === 'LISTENING' || sessionState === 'USER_SPEAKING') {
      audioPollIntervalRef.current = setInterval(() => {
        setCurrentAudioLevel(getAudioLevel());
      }, 150);
    } else {
      clearInterval(audioPollIntervalRef.current);
      setCurrentAudioLevel(0);
    }
    return () => clearInterval(audioPollIntervalRef.current);
  }, [sessionState]);

  // ── Session + Ephemeral Token (only once) ─────────────────────────────────
  useEffect(() => {
    if (sessionState !== 'STARTING') return;
    if (sessionInitializedRef.current) return;
    sessionInitializedRef.current = true;

    (async () => {
      try {
        const { token: t } = await fetchEphemeralToken();
        setToken(t);
        const sess = await startSession(sessionData?.mode, `${modeInfo.title} Session`);
        setSessionDbId(sess?.id);
        setSessionState('READY');
      } catch (e) {
        console.warn('API init failed, using Web Speech API fallback:', e);
        setUseSpeechFallback(true);
        setSessionState('READY');
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionState]);

  // ── Gemini WebSocket (connect once when token ready) ──────────────────────
  useEffect(() => {
    if (!token || sessionState === 'SETUP') return;
    gemini.connect({
      onTranscript: (msg) => {
        transcript.addEntry(msg.speaker, msg.text);
        setSessionState('USER_SPEAKING');
        if (msg.speaker === 'coach') {
          setCoachMessage(msg.text);
          setTimeout(() => setCoachMessage(null), 5000);
        }
      },
      onError: () => setUseSpeechFallback(true)
    }).catch(() => setUseSpeechFallback(true));

    return () => gemini.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Web Speech API (high-sensitivity settings) ────────────────────────────
  useEffect(() => {
    const shouldUseWebSpeech = (useSpeechFallback || !gemini.isConnected) && sessionState !== 'SETUP';
    if (!shouldUseWebSpeech) return;
    if (micInitializedRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    micInitializedRef.current = true;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;  // More alternatives = better accuracy
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setSessionState('LISTENING');
    };

    recognition.onresult = (event) => {
      let hasSpeech = false;
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        // Use the best alternative
        const chunk = event.results[i][0].transcript;
        if (chunk && chunk.trim()) {
          hasSpeech = true;
          if (event.results[i].isFinal) {
            transcript.addEntry('user', chunk);
          } else {
            currentInterim += chunk;
          }
        }
      }

      if (currentInterim) {
        transcript.updateInterim(currentInterim);
      }

      if (hasSpeech) {
        setSessionState('USER_SPEAKING');
      }
    };

    recognition.onerror = (event) => {
      // network errors / no-speech shouldn't kill the recognition
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        return;
      }
      console.warn('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      // Auto-restart to keep recognition going (prevents mic flickering bug)
      if (micInitializedRef.current && sessionState !== 'PROCESSING') {
        try {
          recognition.start();
        } catch (e) {
          // Ignore errors during restart
        }
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      startTimer();
      startMic(() => {});
    } catch (e) {
      console.error('Speech recognition start failed:', e);
    }

    return () => {
      micInitializedRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useSpeechFallback, gemini.isConnected, sessionState]);

  // ── Gemini Mic Capture ───────────────────────────────────────────────────
  useEffect(() => {
    if (!gemini.isConnected || useSpeechFallback || sessionState === 'SETUP') return;

    startMic((pcmData) => {
      if (!isMicMuted && geminiRef.current?.isConnected) {
        geminiRef.current.sendAudio(pcmData);
      }
    });
    startTimer();
    setSessionState('LISTENING');

    return () => {
      stopMic();
      stopTimer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gemini.isConnected, useSpeechFallback]);

  // ── Interview Setup ───────────────────────────────────────────────────────
  const handleInterviewSetupComplete = useCallback((config) => {
    setInterviewConfig(config);
    // If a text answer was provided during setup, pre-populate transcript
    if (config.textAnswer) {
      transcript.addEntry('user', config.textAnswer);
    }
    setSessionState('STARTING');
  }, [transcript]);

  // ── End Session ───────────────────────────────────────────────────────────
  const handleEndSession = async () => {
    stopTimer();
    gemini.disconnect();
    stopMic();
    stopCamera();
    micInitializedRef.current = false;
    cameraInitializedRef.current = false;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    setSessionState('PROCESSING');

    // If text input mode was used, add the typed text to transcript
    if (textInputMode && textInputValue.trim()) {
      transcript.addEntry('user', textInputValue.trim());
    }

    const userSpeechText = transcript.getUserTextOnly();
    const fullText = transcript.getFullText();
    let finalAnalysis = null;

    try {
      const contextInfo = interviewConfig
        ? `Interview Question: ${interviewConfig.question} | Track: ${interviewConfig.track} | Role: ${interviewConfig.role}`
        : modeInfo.title;
      const analysis = await analyzeSession(userSpeechText || fullText, sessionData?.mode, sessionDbId, contextInfo);
      finalAnalysis = analysis;
    } catch (e) {
      console.error('Session analysis error:', e);
    }

    const cleanText = (userSpeechText || fullText || '').trim();
    if (!finalAnalysis) {
      finalAnalysis = {
        hasSufficientSpeech: cleanText.length >= 10,
        mode: sessionData?.mode || 'conversation',
        status: cleanText.length >= 10 ? 'complete' : 'waiting_for_speech',
        overall_score: cleanText.length >= 10 ? 70 : 0,
        scores: {},
        coach_message: cleanText.length >= 10 ? 'Session transcript captured.' : 'No speech detected during the session.',
        priority_issues: [],
        strengths: [],
        transcript_text: cleanText
      };
    }

    finalAnalysis.metrics = liveMetrics;
    finalAnalysis.transcript_text = cleanText;
    if (interviewConfig) {
      finalAnalysis.target_question = interviewConfig.question;
    }

    onEnd(finalAnalysis);
  };

  // ── SETUP state → Show Interview Setup UI ────────────────────────────────
  if (sessionState === 'SETUP') {
    return <InterviewSetup onStartInterview={handleInterviewSetupComplete} />;
  }

  // ── PROCESSING state ─────────────────────────────────────────────────────
  if (sessionState === 'PROCESSING') {
    return (
      <div className="analyzing-screen fade-in">
        <div className="pulse-glow" style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
          🧠
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem' }}>Analyzing your session...</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '480px', textAlign: 'center', lineHeight: 1.6 }}>
          Grounding communication diagnostics in your actual spoken transcript.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: 'var(--accent-gradient)',
              animation: `pulseGlow ${1 + i * 0.2}s ${i * 0.15}s ease infinite`
            }} />
          ))}
        </div>
      </div>
    );
  }

  const stateDotColor =
    sessionState === 'USER_SPEAKING' ? '#22c55e' :
    sessionState === 'LISTENING' ? '#22d3ee' : '#f59e0b';

  const stateLabel =
    sessionState === 'STARTING' ? 'Initializing Studio...' :
    sessionState === 'READY' ? 'Ready — Start Speaking' :
    sessionState === 'LISTENING' ? 'Listening for Speech...' :
    sessionState === 'USER_SPEAKING' ? '🎙 Speech Detected' : '';

  // Collect all transcript entries for the sidebar panel
  const transcriptEntries = transcript.entries;
  const interimText = transcript.interimText;

  return (
    <div className="live-session-studio fade-in" style={{
      display: 'flex', flexDirection: 'column', gap: '16px',
      width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '16px'
    }}>

      {/* ── Top Navigation Bar ─────────────────────────────────────────────── */}
      <div className="studio-topbar glass" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderRadius: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            padding: '6px 14px', borderRadius: '20px', color: '#c084fc',
            fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span>{modeInfo.icon}</span>
            <span>{modeInfo.title}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
            <div style={{
              width: '9px', height: '9px', borderRadius: '50%',
              background: stateDotColor,
              boxShadow: sessionState === 'USER_SPEAKING' ? `0 0 10px ${stateDotColor}` : 'none',
              transition: 'all 0.3s ease'
            }} />
            <span>{stateLabel}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Text Input Toggle (for non-interview modes) */}
          {!isInterviewMode && (
            <button
              onClick={() => setTextInputMode(!textInputMode)}
              style={{
                padding: '6px 14px', borderRadius: '12px', fontSize: '0.82rem',
                background: textInputMode ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255,255,255,0.05)',
                border: textInputMode ? '1px solid rgba(34, 211, 238, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                color: textInputMode ? '#22d3ee' : '#94a3b8',
                cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: 500
              }}
            >
              {textInputMode ? '⌨️ Text Mode ON' : '⌨️ Switch to Text'}
            </button>
          )}

          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '1.5rem',
            fontWeight: 700, letterSpacing: '2px', color: '#f8fafc',
            background: 'rgba(255,255,255,0.04)', padding: '4px 14px', borderRadius: '10px'
          }}>
            {timerFormatted}
          </div>
        </div>
      </div>

      {/* ── Main Studio Grid ──────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) 380px',
        gap: '16px', minHeight: '480px'
      }}>

        {/* Left: Video + Transcript panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Camera Feed */}
          <div className="video-studio-panel glass" style={{
            position: 'relative', display: 'flex', flexDirection: 'column',
            borderRadius: '20px', overflow: 'hidden', flex: 1, minHeight: '280px'
          }}>
            <CameraPreview
              videoRef={videoRef}
              hasCamera={hasCameraPermission}
              isCameraEnabled={isCameraActive}
            />
            {coachMessage && <CoachingIndicator message={coachMessage} />}

            {/* Mic energy bar at the bottom of camera */}
            {(sessionState === 'LISTENING' || sessionState === 'USER_SPEAKING') && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '3px', background: 'rgba(255,255,255,0.05)'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, liveMetrics.audioLevelPct)}%`,
                  background: sessionState === 'USER_SPEAKING'
                    ? 'linear-gradient(90deg, #22c55e, #22d3ee)'
                    : 'linear-gradient(90deg, #22d3ee, #8b5cf6)',
                  transition: 'width 0.1s ease',
                  borderRadius: '0 2px 2px 0'
                }} />
              </div>
            )}
          </div>

          {/* ── Live Transcript Panel (visible in ALL modes) ───────────────── */}
          <div className="transcript-panel glass" style={{
            padding: '16px 20px', borderRadius: '16px', minHeight: '140px', maxHeight: '200px',
            overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px'
          }}>
            <div className="transcript-panel-header">
              <span style={{
                display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%',
                background: sessionState === 'USER_SPEAKING' ? '#22c55e' : 'rgba(34, 211, 238, 0.4)',
                boxShadow: sessionState === 'USER_SPEAKING' ? '0 0 6px #22c55e' : 'none'
              }} />
              Live Transcript
              {transcriptEntries.length > 0 && (
                <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.72rem', fontWeight: 400 }}>
                  {transcriptEntries.filter(e => e.speaker === 'user').length} turns
                </span>
              )}
            </div>

            {transcriptEntries.length === 0 && !interimText.trim() && (
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#475569', fontSize: '0.9rem', fontStyle: 'italic'
              }}>
                {sessionState === 'LISTENING' ? 'Waiting for speech...' :
                 sessionState === 'READY' ? 'Session ready — start speaking' : 'Initializing...'}
              </div>
            )}

            {transcriptEntries.map((entry, i) => (
              <div key={entry.timestamp + i} className="transcript-panel-line" style={{
                borderLeft: `2px solid ${entry.speaker === 'coach' ? '#8b5cf6' : '#22d3ee'}`,
                paddingLeft: '10px'
              }}>
                <span style={{
                  fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700,
                  color: entry.speaker === 'coach' ? '#c084fc' : '#22d3ee',
                  marginRight: '6px', letterSpacing: '0.04em'
                }}>
                  {entry.speaker === 'coach' ? 'Coach' : 'You'}:
                </span>
                {entry.text}
              </div>
            ))}

            {interimText.trim() && (
              <div className="transcript-panel-interim">
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#22d3ee', fontWeight: 700, marginRight: '6px' }}>
                  Speaking:
                </span>
                {interimText.trim()}...
              </div>
            )}
          </div>

          {/* ── Text Input Panel (shows when text mode enabled) ─────────────── */}
          {textInputMode && (
            <div className="glass fade-in" style={{
              padding: '16px 20px', borderRadius: '16px',
              border: '1px solid rgba(34, 211, 238, 0.25)'
            }}>
              <div style={{
                fontSize: '0.75rem', textTransform: 'uppercase', color: '#22d3ee',
                fontWeight: 700, marginBottom: '10px', letterSpacing: '0.06em'
              }}>
                ⌨️ Text Input Mode — Type instead of speaking
              </div>
              <textarea
                value={textInputValue}
                onChange={(e) => setTextInputValue(e.target.value)}
                placeholder="Type your response here. Click 'End Session' when done to analyze it..."
                rows={4}
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f1f5f9', fontSize: '0.92rem', resize: 'vertical',
                  fontFamily: 'var(--font-body)', lineHeight: 1.6,
                  outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(34, 211, 238, 0.4)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
              <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#64748b' }}>
                {textInputValue.split(/\s+/).filter(Boolean).length} words typed
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Metrics Panel */}
        <div className="mode-focus-panel glass" style={{
          padding: '20px', borderRadius: '20px',
          display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto'
        }}>
          <LiveMetricsPanel
            metrics={liveMetrics}
            mode={sessionData?.mode}
            targetQuestion={interviewConfig?.question}
            modeInfo={modeInfo}
          />
        </div>
      </div>

      {/* ── Session Controls ──────────────────────────────────────────────── */}
      <SessionControls
        onEnd={handleEndSession}
        hasMic={hasMicPermission}
        hasCamera={hasCameraPermission}
        isCameraEnabled={isCameraActive}
        isMicMuted={isMicMuted}
        onToggleMic={() => setIsMicMuted(!isMicMuted)}
        onToggleCamera={() => setIsCameraActive(!isCameraActive)}
      />
    </div>
  );
}

const MODE_DETAILS = {
  conversation: { title: 'General Communication', icon: '🎙️', promptHint: 'Speak naturally on any topic. Focus on directness and conciseness.', metrics: ['Clarity', 'Structure', 'Fillers', 'Directness'] },
  storytelling: { title: 'Storytelling Lab', icon: '📖', promptHint: 'Share a real story. Start with an engaging hook and build stakes.', metrics: ['Hook', 'Conflict', 'Tension', 'Ending'] },
  wit: { title: 'Wit & Playful Framing', icon: '⚡', promptHint: 'Describe a situation using unexpected comparisons and metaphors.', metrics: ['Timing', 'Unexpected Framing', 'Analogy'] },
  interview: { title: 'Interview Prep', icon: '💼', promptHint: 'Answer behavioral interview questions using the STAR framework.', metrics: ['STAR Structure', 'Ownership', 'Directness'] },
  public_speaking: { title: 'Public Speaking', icon: '🎤', promptHint: 'Present a pitch or talk. Practice deliberate pauses and emphasis.', metrics: ['Vocal Variation', 'Engagement', 'Transitions'] },
  technical: { title: 'Technical Explanation', icon: '🧠', promptHint: 'Explain a complex concept simply without jargon.', metrics: ['Simplicity', 'Analogy', 'Audience Adaptation'] },
  impromptu: { title: 'Impromptu Challenge', icon: '⚡', promptHint: 'Respond immediately to a spontaneous topic under pressure.', metrics: ['Thinking Speed', 'Structure', 'Fluency'] },
  deep_analysis: { title: 'Deep Multi-Dimensional Analysis', icon: '🔍', promptHint: 'Deliver a full response for comprehensive diagnostic evaluation.', metrics: ['Multi-Dimensional Diagnostics'] },
  daily_training: { title: 'Daily Training Challenge', icon: '🎯', promptHint: 'Targeted drill designed to address your recurring communication patterns.', metrics: ['Habit Precision', 'Execution'] }
};
