import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PROGRESS_FILE)) fs.writeFileSync(PROGRESS_FILE, JSON.stringify([]));
}

export function recordSnapshot(scores) {
  ensureDataDir();
  const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  const snapshot = {
    timestamp: new Date().toISOString(),
    scores
  };
  progress.push(snapshot);
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  return snapshot;
}

export function getSnapshots(limit = 10) {
  ensureDataDir();
  const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  return progress.slice(-limit);
}

export function getTrends() {
  const snapshots = getSnapshots(5);
  return { status: "Trends active", snapshots };
}
