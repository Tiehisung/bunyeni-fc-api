// routes/goal.routes.ts
import { Router } from "express";
import {
    getGoals,
    getGoalById,
    getGoalsByMatch,
    getGoalsByPlayer,
    createGoal,
    updateGoal,
    deleteGoal,
    bulkDeleteGoals,
    getGoalStats,
} from "./goal.controller";
import { authenticate, authorize } from "../../../shared/middleware/auth.middleware";
import { EUserRole } from "../../../types/user";

const router = Router();

// Public routes
router.get("/", getGoals);
router.get("/stats", getGoalStats);
router.get("/match/:matchId", getGoalsByMatch);
router.get("/player/:playerId", getGoalsByPlayer);
router.get("/:goalId", getGoalById);

// Protected routes - require authentication
router.use(authenticate);

// Goal management (admin/manager/coach only)
router.route("/")
    .post(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), createGoal);

router.route("/:goalId")
    .put(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), updateGoal)
    .delete(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), deleteGoal);

// Bulk operations (admin only)
router.delete("/bulk", authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,), bulkDeleteGoals);

export default router;