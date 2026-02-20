"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Import routes
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const player_routes_1 = __importDefault(require("./modules/players/player.routes"));
const team_routes_1 = __importDefault(require("./modules/teams/team.routes"));
const match_routes_1 = __importDefault(require("./modules/matches/match.routes"));
const goal_routes_1 = __importDefault(require("./modules/matches/goals/goal.routes"));
const card_routes_1 = __importDefault(require("./modules/matches/cards/card.routes"));
const injury_routes_1 = __importDefault(require("./modules/matches/injuries/injury.routes"));
const mvp_routes_1 = __importDefault(require("./modules/matches/mvps/mvp.routes"));
const squad_route_1 = __importDefault(require("./modules/squad/squad.route"));
const news_routes_1 = __importDefault(require("./modules/news/news.routes"));
const gallery_routes_1 = __importDefault(require("./modules/media/galleries/gallery.routes"));
const docs_routes_1 = __importDefault(require("./modules/media/documents/docs.routes"));
const highlight_routes_1 = __importDefault(require("./modules/media/highlights/highlight.routes"));
const sponsor_routes_1 = __importDefault(require("./modules/sponsors/sponsor.routes"));
const donation_routes_1 = __importDefault(require("./modules/sponsors/donations/donation.routes"));
const training_routes_1 = __importDefault(require("./modules/training/training.routes"));
const feature_routes_1 = __importDefault(require("./modules/features/feature.routes"));
const captain_routes_1 = __importDefault(require("./modules/captains/captain.routes"));
const manager_routes_1 = __importDefault(require("./modules/managers/manager.routes"));
const logs_routes_1 = __importDefault(require("./modules/logs/logs.routes"));
const archive_route_1 = __importDefault(require("./modules/archives/archive.route"));
const metrics_routes_1 = __importDefault(require("./modules/metrics/metrics.routes"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const logger_middleware_1 = require("./shared/middleware/logger.middleware");
const error_handler_middleware_1 = require("./shared/middleware/error-handler.middleware");
// Import middleware
const app = (0, express_1.default)();
// ==================== SECURITY MIDDLEWARE ====================
// Helmet for security headers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [process.env.FRONTEND_URL || 'https://bunyenifc.vercel.app'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);
// Special stricter rate limit for auth routes
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 auth requests per hour
    message: 'Too many authentication attempts, please try again later.',
});
app.use('/api/auth', authLimiter);
// ==================== PARSING MIDDLEWARE ====================
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Compression - compress all responses - Makes responses FASTER and reduces bandwidth usage
app.use((0, compression_1.default)());
// ==================== LOGGING ====================
app.use(logger_middleware_1.requestLogger);
// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        mongodb: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});
app.get('/', (req, res) => {
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
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/players', player_routes_1.default);
app.use('/api/teams', team_routes_1.default);
app.use('/api/matches', match_routes_1.default);
app.use('/api/goals', goal_routes_1.default);
app.use('/api/cards', card_routes_1.default);
app.use('/api/injuries', injury_routes_1.default);
app.use('/api/mvps', mvp_routes_1.default);
app.use('/api/squads', squad_route_1.default);
app.use('/api/news', news_routes_1.default);
app.use('/api/galleries', gallery_routes_1.default);
app.use('/api/documents', docs_routes_1.default);
app.use('/api/highlights', highlight_routes_1.default);
app.use('/api/sponsors', sponsor_routes_1.default);
app.use('/api/donations', donation_routes_1.default);
app.use('/api/training', training_routes_1.default);
app.use('/api/features', feature_routes_1.default);
app.use('/api/captaincy', captain_routes_1.default);
app.use('/api/managers', manager_routes_1.default);
app.use('/api/logs', logs_routes_1.default);
app.use('/api/archives', archive_route_1.default);
app.use('/api/metrics', metrics_routes_1.default);
// app.use('/api/clubs', clubRoutes);
// ==================== ERROR HANDLING ====================
// 404 handler
app.use(error_handler_middleware_1.notFound);
// Global error handler
app.use(error_handler_middleware_1.errorHandler);
// Export for serverless deployment (Vercel)
exports.default = app;
