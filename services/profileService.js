import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');

const DEFAULT_PROFILE = {
  id: "default",
  strengths: [],
  weaknesses: [],
  filler_patterns: [],
  speaking_style: {},
  coaching_preferences: { feedback_intensity: "balanced" },
  session_count: 0,
  total_practice_minutes: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

function ensureProfile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PROFILE_FILE)) {
    fs.writeFileSync(PROFILE_FILE, JSON.stringify(DEFAULT_PROFILE, null, 2));
  }
}

export function getProfile() {
  ensureProfile();
  return JSON.parse(fs.readFileSync(PROFILE_FILE, 'utf-8'));
}

export function updateProfile(updates) {
  const profile = getProfile();
  const newProfile = { ...profile, ...updates, updated_at: new Date().toISOString() };
  fs.writeFileSync(PROFILE_FILE, JSON.stringify(newProfile, null, 2));
  return newProfile;
}

export function addWeakness(weakness) {
  const profile = getProfile();
  profile.weaknesses.push({ weakness, date: new Date().toISOString() });
  updateProfile(profile);
}

export function addStrength(strength) {
  const profile = getProfile();
  profile.strengths.push({ strength, date: new Date().toISOString() });
  updateProfile(profile);
}

export function getRecurringWeaknesses() {
  const profile = getProfile();
  const counts = {};
  profile.weaknesses.forEach(w => {
    counts[w.weakness] = (counts[w.weakness] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(e => e[0]);
}
