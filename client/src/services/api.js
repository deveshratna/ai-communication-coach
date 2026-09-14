const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  if (response.status === 204) return null;
  return response.json();
}

export const fetchEphemeralToken = () => request('/token', { method: 'POST' });
export const startSession = (mode, title) => request('/session/start', { method: 'POST', body: JSON.stringify({ mode, title }) });
export const endSession = (id, transcript) => request(`/session/${id}/end`, { method: 'POST', body: JSON.stringify({ transcript }) });
export const analyzeSession = (transcript, mode, sessionId) => request('/analysis', { method: 'POST', body: JSON.stringify({ transcript, mode, sessionId }) });
export const compareAttempts = (a1, a2, focus) => request('/analysis/compare', { method: 'POST', body: JSON.stringify({ a1, a2, focus }) });
export const getProfile = () => request('/profile');
export const coachMe = () => request('/profile/coach-me', { method: 'POST' });
export const getSessions = () => request('/session');
export const deleteSession = (id) => request(`/session/${id}`, { method: 'DELETE' });
