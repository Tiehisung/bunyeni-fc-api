/// <reference path="../types/global.d.ts" />

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../modules/users/user.model";

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from header or cookie
        const token = req.cookies?.accessToken ||
            req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error();
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET || 'access_secret'
        ) as any;

        // Find user
        const user = await UserModel.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists",
                code: "USER_NOT_FOUND"
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Account is deactivated",
                code: "ACCOUNT_DEACTIVATED"
            });
        }

        // Attach user to request
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Please log in again.",
                code: "INVALID_TOKEN"
            });
        }

        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please log in again.",
                code: "TOKEN_EXPIRED"
            });
        }

        console.error("Authentication error:", error);
        return res.status(500).json({
            success: false,
            message: "Authentication failed due to server error.",
            code: "AUTH_ERROR"
        });
    }
};



// Role-based authorization
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user?.role as string)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource'
            });
        }

        next();
    };
};