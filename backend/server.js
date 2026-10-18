import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import morgan from 'morgan';
import connectDB, { getDbStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import atsRoutes from './routes/atsRoutes.js';
import coverLetterRoutes from './routes/coverLetterRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import careerRoutes from './routes/careerRoutes.js';

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(serverDirectory, '../.env') });
dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  // If not provided or too short in dev, supply a secure fallback
  process.env.JWT_SECRET = 'careerforge_super_secure_jwt_secret_token_key_2026_xyz!';
}

const app = express();
const basePort = Number(process.env.PORT || 5000);

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    success: true,
    status: 'ok',
    database: dbStatus,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/cover-letter', coverLetterRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/career', careerRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.statusCode || error.status || 500).json({
    success: false,
    message: error.message || 'Server error',
  });
});

await connectDB();

app.listen(basePort, () => {
  console.log(`CareerForge AI server is running on port ${basePort}`);
});
