import express from 'express';
import { getProfile, updateProfile, getRecurringWeaknesses } from '../services/profileService.js';
import { generateExercise } from '../services/geminiService.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(getProfile());
});

router.put('/', (req, res) => {
  res.json(updateProfile(req.body));
});

router.post('/coach-me', async (req, res, next) => {
  try {
    const profile = getProfile();
    const weaknesses = getRecurringWeaknesses();
    const exercise = await generateExercise(profile, weaknesses);
    res.json({ weakness: weaknesses[0] || 'general', exercise, coach_message: 'Let us work on this together.' });
  } catch (error) {
    next(error);
  }
});

export default router;
