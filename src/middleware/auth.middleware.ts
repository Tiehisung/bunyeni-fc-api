/// <reference path="../types/global.d.ts" />

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../modules/users/user.model";
import { ENV } from "../config/env.config";
import { HttpStatusCode } from "axios";


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
            return res.status(HttpStatusCode.Unauthorized).json({
                success: false,
                message: "No token provided",
                code: "NO_TOKEN"
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            ENV.JWT.ACCESS_SECRET
        ) as any;

        // Find user
        const user = await UserModel.findById(decoded._id).select('-password');

        if (!user) {
            return res.status(HttpStatusCode.Unauthorized).json({
                success: false,
                message: "User no longer exists",
                code: "USER_NOT_FOUND"
            });
        }

        if (!user.isActive) {
            return res.status(HttpStatusCode.Unauthorized).json({
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
            return res.status(HttpStatusCode.Unauthorized).json({
                success: false,
                message: "Invalid token. Please log in again.",
                code: "INVALID_TOKEN"
            });
        }

        if (error instanceof jwt.TokenExpiredError) {
            return res.status(HttpStatusCode.Unauthorized).json({
                success: false,
                message: "Token expired. Please log in again.",
                code: "TOKEN_EXPIRED"
            });
        }

        console.error("Authentication error:", error);
        return res.status(HttpStatusCode.InternalServerError).json({
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
            return res.status(HttpStatusCode.Unauthorized).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user?.role as string)) {
            return res.status(HttpStatusCode.Forbidden).json({
                success: false,
                message: 'You do not have permission to access this resource'
            });
        }

        next();
    };
};