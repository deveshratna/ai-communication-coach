import express from 'express';
import { analyzeCommunication, compareAttempts, generateExercise, generateInterviewQuestion } from '../services/geminiService.js';
import { saveAnalysis } from '../services/sessionService.js';
import { addWeakness } from '../services/profileService.js';
import { recordSnapshot } from '../services/progressService.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { transcript, mode, sessionId } = req.body;
    const analysis = await analyzeCommunication(transcript, mode, sessionId);
    
    if (sessionId) {
      try { saveAnalysis(sessionId, analysis); } catch (e) {}
    }
    
    if (analysis && Array.isArray(analysis.priority_issues) && analysis.priority_issues.length > 0) {
      analysis.priority_issues.forEach(issue => {
        const item = typeof issue === 'object' ? (issue.issue || issue.title) : issue;
        if (item) try { addWeakness(item); } catch (e) {}
      });
    }
    
    if (analysis && analysis.scores && Object.keys(analysis.scores).length > 0) {
      try { recordSnapshot(analysis.scores); } catch (e) {}
    }
    
    res.json(analysis);
  } catch (error) {
    console.error("Error in POST /api/analysis:", error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

router.post('/compare', async (req, res, next) => {
  try {
    const { attempt1, attempt2, focus } = req.body;
    const result = await compareAttempts(attempt1, attempt2, focus);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/exercise', async (req, res, next) => {
  try {
    const profileMod = await import('../services/profileService.js');
    const profile = profileMod.getProfile();
    const weaknesses = profileMod.getRecurringWeaknesses();
    const exercise = await generateExercise(profile, weaknesses);
    res.json(exercise);
  } catch (error) {
    next(error);
  }
});

router.post('/interview-question', async (req, res, next) => {
  try {
    const { track, role, difficulty } = req.body;
    const result = await generateInterviewQuestion(track, role, difficulty);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
