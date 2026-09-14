import { useState, useEffect, useRef } from 'react';

const FILLER_REGEX = /\b(um|uh|like|you know|basically|actually|so|i mean|kind of|sort of)\b/gi;

export function useLiveMetrics(transcriptText = '', isSpeaking = false, audioLevel = 0) {
  const [metrics, setMetrics] = useState({
    words: 0,
    wpm: 0,
    wpmFormatted: '--',
    fillersCount: 0,
    fillerBreakdown: {},
    fillerRate: '0%',
    pauseGapSeconds: 0,
    pausesCount: 0,
    audioLevelPct: 0
  });

  const speakingStartTimeRef = useRef(null);
  const totalSpeakingTimeRef = useRef(0);
  const lastSpeechTimeRef = useRef(Date.now());
  const pausesCountRef = useRef(0);
  const gapTimerRef = useRef(null);

  // Track speaking duration & pauses
  useEffect(() => {
    if (isSpeaking) {
      if (!speakingStartTimeRef.current) {
        speakingStartTimeRef.current = Date.now();
      }
      lastSpeechTimeRef.current = Date.now();
    } else if (speakingStartTimeRef.current) {
      const elapsed = (Date.now() - speakingStartTimeRef.current) / 1000;
      totalSpeakingTimeRef.current += elapsed;
      speakingStartTimeRef.current = null;
    }
  }, [isSpeaking]);

  // Track gap duration (silence timer) & pause counts
  useEffect(() => {
    gapTimerRef.current = setInterval(() => {
      if (!isSpeaking) {
        const gap = (Date.now() - lastSpeechTimeRef.current) / 1000;
        if (gap >= 1.5 && gap < 1.6) {
          pausesCountRef.current += 1;
        }
        setMetrics(prev => ({ ...prev, pauseGapSeconds: gap.toFixed(1) }));
      } else {
        setMetrics(prev => ({ ...prev, pauseGapSeconds: 0 }));
      }
    }, 200);

    return () => clearInterval(gapTimerRef.current);
  }, [isSpeaking]);

  // Recalculate metrics on transcript update
  useEffect(() => {
    const cleanText = (transcriptText || '').trim();
    if (!cleanText) {
      setMetrics({
        words: 0,
        wpm: 0,
        wpmFormatted: '--',
        fillersCount: 0,
        fillerBreakdown: {},
        fillerRate: '0%',
        pauseGapSeconds: 0,
        pausesCount: 0,
        audioLevelPct: Math.min(100, Math.round((audioLevel / 255) * 100))
      });
      return;
    }

    const wordsArr = cleanText.split(/\s+/).filter(Boolean);
    const wordCount = wordsArr.length;

    // Detect fillers
    const matches = cleanText.match(FILLER_REGEX) || [];
    const breakdown = {};
    matches.forEach(m => {
      const lower = m.toLowerCase();
      breakdown[lower] = (breakdown[lower] || 0) + 1;
    });

    const fillersTotal = matches.length;
    const fillerPct = wordCount > 0 ? ((fillersTotal / wordCount) * 100).toFixed(1) : 0;

    // Calculate WPM
    let activeSec = totalSpeakingTimeRef.current;
    if (speakingStartTimeRef.current) {
      activeSec += (Date.now() - speakingStartTimeRef.current) / 1000;
    }
    const minutes = activeSec / 60;
    const calculatedWpm = minutes > 0.05 ? Math.round(wordCount / minutes) : 0;

    setMetrics({
      words: wordCount,
      wpm: calculatedWpm,
      wpmFormatted: (wordCount >= 5 && activeSec >= 3) ? `${calculatedWpm} WPM` : '--',
      fillersCount: fillersTotal,
      fillerBreakdown: breakdown,
      fillerRate: `${fillerPct}%`,
      pauseGapSeconds: (metrics.pauseGapSeconds || 0),
      pausesCount: pausesCountRef.current,
      audioLevelPct: Math.min(100, Math.round((audioLevel / 255) * 100))
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcriptText, audioLevel]);

  return metrics;
}
