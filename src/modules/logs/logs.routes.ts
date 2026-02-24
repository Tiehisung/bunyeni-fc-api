// routes/log.routes.ts
import { Router } from "express";
import {
    getLogs,
    getLogById,
    getLogsByUser,
    getLogsBySeverity,
    getLogStats,
    searchLogs,
    cleanupOldLogs,
    deleteLog,
} from "./logs.controller";
import { authenticate, authorize } from "../../shared/middleware/auth.middleware";
import { EUserRole } from "../../types/user";

const router = Router();

// All log routes require authentication and admin access
// router.use(authenticate);
// router.use(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH, EUserRole.PLAYER,)); // Only admins can access logs

// Main routes
router.get("/", getLogs);
router.get("/stats", getLogStats);
router.get("/search", searchLogs);
router.get("/user/:userId", getLogsByUser);
router.get("/severity/:severity", getLogsBySeverity);
router.get("/:id", getLogById);

// Admin cleanup operations
router.delete("/cleanup", authorize(EUserRole.SUPER_ADMIN,), cleanupOldLogs);
router.delete("/:id", authorize(EUserRole.SUPER_ADMIN,), deleteLog);

export default router;