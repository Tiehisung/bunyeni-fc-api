// src/shared/middleware/logger.ts
import type{ Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Log when request completes
    res.on('finish', () => {
        const duration = Date.now() - start;
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

        if (res.statusCode >= 500) {
            console.error('❌', message);
        } else if (res.statusCode >= 400) {
            console.warn('⚠️', message);
        } else {
            console.log('✅', message);
        }
    });

    next();
};