import express from 'express';
import { getEphemeralToken } from '../services/geminiService.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const data = await getEphemeralToken();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
