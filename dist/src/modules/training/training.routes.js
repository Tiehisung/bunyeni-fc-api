"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/training.routes.ts
const express_1 = require("express");
const training_controller_1 = require("./training.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const user_1 = require("../../types/user");
const router = (0, express_1.Router)();
// Public routes - anyone can view training sessions
router.get("/", training_controller_1.getTrainingSessions);
router.get("/upcoming", training_controller_1.getUpcomingTraining);
router.get("/recent", training_controller_1.getRecentTraining);
router.get("/stats", training_controller_1.getTrainingStats);
router.get("/player/:playerId", training_controller_1.getPlayerTrainingHistory);
router.get("/:id", training_controller_1.getTrainingSessionById);
// Protected routes - require authentication
router.use(auth_middleware_1.authenticate);
// Training management - requires coach/manager/admin privileges
router.post("/", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), training_controller_1.createTrainingSession);
router.put("/:id", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), training_controller_1.updateTrainingSession);
// Attendance management
router.patch("/:id/attendance", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), training_controller_1.updateAttendance);
router.patch("/:id/note", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), training_controller_1.updateSessionNote);
// Deletion - admin only
router.delete("/:id", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), training_controller_1.deleteTrainingSession);
exports.default = router;
