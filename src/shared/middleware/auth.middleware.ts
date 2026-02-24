import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { EUserRole, IAuthUser, } from "../../types/user";

declare global {
    namespace Express {
        interface Request {
            user?: IAuthUser;
        }
    }
}

export const authenticate = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {

    //uncomment all to implement
    
    // let token;
    // const header = req.headers.authorization;

    // if (!header?.startsWith("Bearer"))
    //     return res.status(401).json({ message: "Unauthorized" });

    // if (header?.startsWith("Bearer")) {
    //     token = header.split(" ")[1];
    // }

    // if (!token)
    //     return res.status(401).json({ message: "Not authorized" });

    try {

        // const decoded = jwt.verify(
        //     token,
        //     process.env.JWT_SECRET!
        // ) as IAuthUser;

        // // ✅ attach directly (no DB query)
        // req.user = decoded;

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


/**
 * Role-based authorization middleware factory
 * @param _roles - Allowed roles
 */
export const authorize = (..._roles: EUserRole[]) => {
    return (_req: Request, _res: Response, next: NextFunction) => {
        // if (!req.user) {
        //     return res.status(401).json({
        //         success: false,
        //         message: "Authentication required.",
        //         code: "UNAUTHORIZED"
        //     });
        // }

        // if (!roles.includes(req.user.role as EUserRole)) {
        //     return res.status(403).json({
        //         success: false,
        //         message: `Access denied. Required roles: ${roles.join(", ")}`,
        //         code: "FORBIDDEN",
        //         userRole: req.user.role,
        //         requiredRoles: roles
        //     });
        // }

        next();
    };
};
