"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const requestLogger = (req, res, next) => {
    const start = Date.now();
    // Log when request completes
    res.on('finish', () => {
        const duration = Date.now() - start;
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
        if (res.statusCode >= 500) {
            console.error('❌', message);
        }
        else if (res.statusCode >= 400) {
            console.warn('⚠️', message);
        }
        else {
            console.log('✅', message);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
