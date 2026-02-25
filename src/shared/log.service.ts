// src/shared/log/logger.service.ts
import { Request } from "express";
import LogModel from "../modules/log/logs.model";
import { ELogSeverity } from "../types/log.interface";


export class LoggerService {
    static async info(title: string, description?: string, req?: Request, meta?: any) {
        return this.log(title, description, ELogSeverity.INFO, req, meta);
    }

    static async warn(title: string, description?: string, req?: Request, meta?: any) {
        return this.log(title, description, ELogSeverity.WARNING, req, meta);
    }

    static async error(title: string, description?: string, req?: Request, meta?: any) {
        return this.log(title, description, ELogSeverity.ERROR, req, meta);
    }
    static async critical(title: string, description?: string, req?: Request, meta?: any) {
        return this.log(title, description, ELogSeverity.CRITICAL, req, meta);
    }

    private static async log(
        title: string,
        description: string = '',
        severity: ELogSeverity,
        req?: Request,
        meta: any = {}
    ) {
        try {
            let userData = null;

            if (req?.user) {
                userData = {
                    _id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role
                };
            }

            if (req) {
                meta = {
                    ...meta,
                    ip: req.ip,
                    userAgent: req.get('user-agent'),
                    method: req.method,
                    url: req.originalUrl
                };
            }

            return await LogModel.create({
                title,
                description,
                user: userData,
                severity,
                meta,
                createdAt: new Date()
            });
        } catch (error) {
            console.error("Logging failed:", error);
            return null;
        }
    }
}

// Usage:
// LoggerService.info('User logged in', 'Successfully authenticated', req);
// LoggerService.error('Payment failed', error.message, req, { orderId: '123' });