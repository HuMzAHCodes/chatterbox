import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDB from './src/config/db.js';
import testRouter from './src/routes/test.js';
import authRouter from './src/routes/auth.js';
import errorHandler from './src/middleware/errorHandler.js';
import roomsRouter from './src/routes/rooms.js';
import messagesRouter from './src/routes/messages.js';

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// ── Global Middleware ─────────────────────────────────────────────────────────

app.use(morgan('dev'));
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
}));

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api', testRouter);
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/messages', messagesRouter);

// ── 404 Handler ───────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Error Handler — must be last ──────────────────────────────────────────────

app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

export default app;