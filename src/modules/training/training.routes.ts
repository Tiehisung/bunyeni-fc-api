// routes/training.routes.ts
import { Router } from "express";
import {
    getTrainingSessions,
    getUpcomingTraining,
    getRecentTraining,
    getPlayerTrainingHistory,
    getTrainingSessionById,
    createTrainingSession,
    updateTrainingSession,
    updateAttendance,
    updateSessionNote,
    deleteTrainingSession,
    getTrainingStats,
} from "./training.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { EUserRole } from "../../types/user.interface";

const router = Router();

// Public routes - anyone can view training sessions
router.get("/", getTrainingSessions);
router.get("/upcoming", getUpcomingTraining);
router.get("/recent", getRecentTraining);
router.get("/stats", getTrainingStats);
router.get("/player/:playerId", getPlayerTrainingHistory);
router.get("/:id", getTrainingSessionById);

// Protected routes - require authentication
router.use(authenticate);

// Training management - requires coach/manager/admin privileges
router.post(
    "/",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
    createTrainingSession
);

router.put(
    "/:id",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
    updateTrainingSession
);

// Attendance management
router.patch(
    "/:id/attendance",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
    updateAttendance
);

router.patch(
    "/:id/note",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
    updateSessionNote
);

// Deletion - admin only
router.delete(
    "/:id",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
    deleteTrainingSession
);

export default router;