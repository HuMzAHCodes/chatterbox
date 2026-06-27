import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';



// Connect to MongoDB
connectDB();
// Load env variables first — before anything else
dotenv.config();

// Route imports
import testRouter from './src/routes/test.js';

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
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // max 100 requests per IP per window
  message: { success: false, message: 'Too many requests, please try again later' },
}));

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api', testRouter);

// ── 404 Handler ───────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Start Server ──────────────────────────────────────────────────────────────



const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}



export default app;  