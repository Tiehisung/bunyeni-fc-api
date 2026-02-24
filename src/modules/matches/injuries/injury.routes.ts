// routes/injury.routes.ts
import { Router } from "express";
import {
  getInjuries,
  getInjuryById,
  getInjuriesByPlayer,
  getInjuriesByMatch,
  getActiveInjuries,

  createInjury,
  
  updateInjury,
  updateInjuryStatus,
  deleteInjury,
  getInjuryStats,
} from "./injury.controller";
import { authenticate, authorize } from "../../../shared/middleware/auth.middleware";
import { EUserRole } from "../../../types/user";

const router = Router();

// Public routes
router.get("/", getInjuries);
router.get("/stats", getInjuryStats);
router.get("/active", getActiveInjuries);
router.get("/player/:playerId", getInjuriesByPlayer);
router.get("/match/:matchId", getInjuriesByMatch);
router.get("/:id", getInjuryById);

// Protected routes - require authentication
router.use(authenticate);

// Injury management
router.route("/")
  .post(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
    createInjury
  );

router.route("/:id")
  .put(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
    updateInjury
  )
  .delete(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
    deleteInjury
  );

// Status update
router.patch(
  "/:id/status",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
  updateInjuryStatus
);

export default router;