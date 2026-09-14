import { useState, useCallback } from 'react';

export function useTranscript() {
  const [entries, setEntries] = useState([]);
  const [interimText, setInterimText] = useState('');

  const addEntry = useCallback((speaker, text) => {
    if (!text || !text.trim()) return;
    setEntries((prev) => {
      const clean = text.trim();
      const last = prev[prev.length - 1];
      if (last && last.speaker === speaker && last.text === clean) {
        return prev;
      }
      return [...prev, { speaker, text: clean, timestamp: Date.now() }];
    });
    // Clear interim text when final entry is added
    if (speaker === 'user') {
      setInterimText('');
    }
  }, []);

  const updateInterim = useCallback((text) => {
    setInterimText(text || '');
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
    setInterimText('');
  }, []);

  const getFullText = useCallback(() => {
    const lines = entries.map(e => {
      const role = e.speaker === 'coach' ? 'Coach' : 'User';
      return `${role}: ${e.text}`;
    });
    if (interimText.trim()) {
      lines.push(`User: ${interimText.trim()}`);
    }
    return lines.join('\n');
  }, [entries, interimText]);

  const getUserTextOnly = useCallback(() => {
    const userLines = entries
      .filter(e => e.speaker === 'user')
      .map(e => e.text);
    if (interimText.trim()) {
      userLines.push(interimText.trim());
    }
    return userLines.join(' ');
  }, [entries, interimText]);

  return {
    entries,
    interimText,
    addEntry,
    updateInterim,
    clear,
    getFullText,
    getUserTextOnly
  };
}
