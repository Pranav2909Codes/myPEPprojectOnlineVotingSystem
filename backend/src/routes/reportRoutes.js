import express from 'express';
import { getVotingSummary, getPollFeed } from '../controllers/reportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary', protect, admin, getVotingSummary);
router.get('/feed', protect, getPollFeed);

export default router;
