"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/goal.routes.ts
const express_1 = require("express");
const goal_controller_1 = require("./goal.controller");
const auth_middleware_1 = require("../../../shared/middleware/auth.middleware");
const user_1 = require("../../../types/user");
const router = (0, express_1.Router)();
// Public routes
router.get("/", goal_controller_1.getGoals);
router.get("/stats", goal_controller_1.getGoalStats);
router.get("/match/:matchId", goal_controller_1.getGoalsByMatch);
router.get("/player/:playerId", goal_controller_1.getGoalsByPlayer);
router.get("/:goalId", goal_controller_1.getGoalById);
// Protected routes - require authentication
router.use(auth_middleware_1.authenticate);
// Goal management (admin/manager/coach only)
router.route("/")
    .post((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), goal_controller_1.createGoal);
router.route("/:goalId")
    .put((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), goal_controller_1.updateGoal)
    .delete((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), goal_controller_1.deleteGoal);
// Bulk operations (admin only)
router.delete("/bulk", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), goal_controller_1.bulkDeleteGoals);
exports.default = router;
