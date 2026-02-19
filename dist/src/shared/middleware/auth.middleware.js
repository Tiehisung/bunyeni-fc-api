"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../../modules/users/user.model"));
const authenticate = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token)
        return res.status(401).json({ message: "Not authorized" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Get user from database
        const user = await user_model_1.default.findById(decoded.id)
            .select("-password -__v")
            .lean();
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User associated with this token no longer exists.",
                code: "USER_NOT_FOUND"
            });
        }
        // Check if user is active
        if (user.status === 'inactive' || user.status === 'suspended') {
            return res.status(403).json({
                success: false,
                message: `Account is ${user.status}. Please contact administrator.`,
                code: "ACCOUNT_INACTIVE"
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Please log in again.",
                code: "INVALID_TOKEN"
            });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
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
exports.authenticate = authenticate;
/**
 * Role-based authorization middleware factory
 * @param roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
                code: "UNAUTHORIZED"
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${roles.join(", ")}`,
                code: "FORBIDDEN",
                userRole: req.user.role,
                requiredRoles: roles
            });
        }
        next();
    };
};
exports.authorize = authorize;
