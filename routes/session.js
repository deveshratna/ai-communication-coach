import express from 'express';
import { createSession, endSession, getSession, getAllSessions, deleteSession } from '../services/sessionService.js';

const router = express.Router();

router.post('/start', (req, res) => {
  const { mode, title } = req.body;
  res.json(createSession(mode, title));
});

router.post('/:id/end', (req, res) => {
  const { transcript } = req.body;
  res.json(endSession(req.params.id, transcript));
});

router.get('/:id', (req, res) => {
  const session = getSession(req.params.id);
  if (!session) return res.status(404).json({ error: 'Not found' });
  res.json(session);
});

router.get('/', (req, res) => {
  res.json(getAllSessions());
});

router.delete('/:id', (req, res) => {
  deleteSession(req.params.id);
  res.json({ success: true });
});

export default router;
