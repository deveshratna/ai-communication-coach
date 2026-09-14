import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(process.cwd(), '.data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SESSIONS_FILE)) fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]));
}

function readSessions() {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
}

function writeSessions(sessions) {
  ensureDataDir();
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

export function createSession(mode, title) {
  const sessions = readSessions();
  const newSession = {
    id: uuidv4(),
    mode,
    title,
    startedAt: new Date().toISOString(),
    transcript: [],
    status: 'active'
  };
  sessions.push(newSession);
  writeSessions(sessions);
  return newSession;
}

export function endSession(id, transcript) {
  const sessions = readSessions();
  const session = sessions.find(s => s.id === id);
  if (session) {
    session.transcript = transcript || session.transcript;
    session.endedAt = new Date().toISOString();
    session.status = 'completed';
    writeSessions(sessions);
  }
  return session;
}

export function getSession(id) {
  const sessions = readSessions();
  return sessions.find(s => s.id === id);
}

export function getAllSessions() {
  const sessions = readSessions();
  return sessions.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
}

export function deleteSession(id) {
  let sessions = readSessions();
  sessions = sessions.filter(s => s.id !== id);
  writeSessions(sessions);
}

export function saveAnalysis(id, analysis) {
  const sessions = readSessions();
  const session = sessions.find(s => s.id === id);
  if (session) {
    session.analysis = analysis;
    writeSessions(sessions);
  }
  return session;
}
