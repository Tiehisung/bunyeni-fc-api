"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/log.routes.ts
const express_1 = require("express");
const logs_controller_1 = require("./logs.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const user_1 = require("../../types/user");
const router = (0, express_1.Router)();
// All log routes require authentication and admin access
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH, user_1.EUserRole.PLAYER)); // Only admins can access logs
// Main routes
router.get("/", logs_controller_1.getLogs);
router.get("/stats", logs_controller_1.getLogStats);
router.get("/search", logs_controller_1.searchLogs);
router.get("/user/:userId", logs_controller_1.getLogsByUser);
router.get("/severity/:severity", logs_controller_1.getLogsBySeverity);
router.get("/:id", logs_controller_1.getLogById);
// Admin cleanup operations
router.delete("/cleanup", (0, auth_middleware_1.authorize)(user_1.EUserRole.SUPER_ADMIN), logs_controller_1.cleanupOldLogs);
router.delete("/:id", (0, auth_middleware_1.authorize)(user_1.EUserRole.SUPER_ADMIN), logs_controller_1.deleteLog);
exports.default = router;
