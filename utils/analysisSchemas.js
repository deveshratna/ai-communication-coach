export function sanitizeScores(scores) {
  if (!scores || typeof scores !== 'object') return {};
  const safe = { ...scores };
  for (let key in safe) {
    if (typeof safe[key] === 'number') {
      safe[key] = Math.max(0, Math.min(100, safe[key]));
    }
  }
  return safe;
}

export function validateAnalysis(data, modeConfig = {}) {
  if (!data || typeof data !== 'object') {
    return {
      hasSufficientSpeech: false,
      status: "invalid_response",
      coach_message: "Analysis could not be generated."
    };
  }
  
  const safeData = { ...data };
  if (safeData.scores) {
    safeData.scores = sanitizeScores(safeData.scores);
  }
  if (safeData.overall_score !== undefined && typeof safeData.overall_score === 'number') {
    safeData.overall_score = Math.max(0, Math.min(100, safeData.overall_score));
  }
  
  return safeData;
}
