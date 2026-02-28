// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

// Import routes
import userRoutes from './modules/users/user.routes';
import teamRoutes from './modules/teams/team.routes';
import matchRoutes from './modules/matches/match.routes';
import goalRoutes from './modules/matches/goals/goal.routes';
import cardRoutes from './modules/matches/cards/card.routes';
import injuryRoutes from './modules/matches/injuries/injury.routes';
import mvpRoutes from './modules/matches/mvps/mvp.routes';
import squadRoutes from './modules/squad/squad.route';
import newsRoutes from './modules/news/news.routes';
import galleryRoutes from './modules/media/galleries/gallery.routes';
import documentRoutes from './modules/media/documents/docs.routes';
import highlightRoutes from './modules/media/highlights/highlight.routes';
import sponsorRoutes from './modules/sponsors/sponsor.routes';
import donationRoutes from './modules/sponsors/donations/donation.routes';
import trainingRoutes from './modules/training/training.routes';
import featureRoutes from './modules/features/feature.routes';
import captaincyRoutes from './modules/captains/captain.routes';
import staffRoutes from './modules/staff/staff.routes';
import logRoutes from './modules/log/logs.routes';
import archiveRoutes from './modules/archives/archive.route';
import metricRoutes from './modules/metrics/metrics.routes';
import authRoutes from './modules/auth/auth.routes';
import uploadRoutes from './modules/upload/upload.routes';
import { requestLogger } from './middleware/logger.middleware';
import { notFound, errorHandler } from './middleware/error-handler.middleware';
import { ENV } from './config/env.config';

// Import middleware


const app: Application = express();

// Trust proxy (needed for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// ==================== SECURITY MIDDLEWARE ====================
// Helmet for security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [process.env.FRONTEND_URL as string || 'https://bunyenifc.vercel.app'],
    credentials: true,
    optionsSuccessStatus: 200,
    exposedHeaders: ['set-cookie']
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: ENV.RATE_LIMIT_WINDOW || (15 * 60 * 1000), // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health' // Don't rate limit health checks
});

app.use(cookieParser());
app.use('/api', limiter);

// Special stricter rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 auth requests per hour
    message: 'Too many authentication attempts, please try again later.',
});
app.use('/api/auth', authLimiter);

// ==================== PARSING MIDDLEWARE ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression - compress all responses - Makes responses FASTER and reduces bandwidth usage
app.use(compression());


// ==================== LOGGING ====================
app.use(requestLogger);

// ==================== HEALTH CHECK ====================
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Bunyeni FC API Server',
        version: '1.0.0',
        documentation: '/api/docs',
        health: '/health'
    });
});

//Removes /favicon.ico noisy logs.
// app.get("/favicon.ico", (_, res) => res.status(204).end());

// ==================== API ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

//Cold start improvement is massive for serverless. Only import player routes when needed.
app.use("/api/players", async (req, res, next) => {
    const routes = (await import("./modules/players/player.routes")).default;
    return routes(req, res, next);
});
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/injuries', injuryRoutes);
app.use('/api/mvps', mvpRoutes);
app.use('/api/squads', squadRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/galleries', galleryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/highlights', highlightRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/captains', captaincyRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/archives', archiveRoutes);
app.use('/api/metrics', metricRoutes);
// app.use('/api/clubs', clubRoutes);

// ==================== ERROR HANDLING ====================
// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Export for serverless deployment (Vercel)
export default app;

