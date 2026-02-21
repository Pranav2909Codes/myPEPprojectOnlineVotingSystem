import express from 'express';
import {
    createPoll,
    getPolls,
    getPollById,
    updatePoll,
    deletePoll,
    voteInPoll,
} from '../controllers/pollController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getPolls).post(protect, admin, createPoll);
router
    .route('/:id')
    .get(protect, getPollById)
    .put(protect, admin, updatePoll)
    .delete(protect, admin, deletePoll);
router.route('/:id/vote').post(protect, voteInPoll);

export default router;
