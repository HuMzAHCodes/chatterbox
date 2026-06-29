import express from 'express';
import { getMessages } from '../controllers/messageController.js';
import protect from '../middleware/protect.js';

const router = express.Router();

router.use(protect);

router.get('/:roomId', getMessages);

export default router;