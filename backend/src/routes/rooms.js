import express from 'express';
import { createRoom, getRooms, getRoomById } from '../controllers/roomController.js';
import protect from '../middleware/protect.js';

const router = express.Router();

router.use(protect); // all room routes are protected

router.post('/', createRoom);
router.get('/', getRooms);
router.get('/:id', getRoomById);

export default router;