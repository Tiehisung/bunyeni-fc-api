// routes/captaincy.routes.ts
import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { EUserRole } from "../../types/user.interface";
import {
  getCaptains,
  getActiveCaptains,
  getCaptaincyStats,
  getCaptaincyByPlayer,
  getCaptaincyHistoryByRole,
  getCaptaincyById,
  assignCaptain,
  assignMultipleCaptains,
  endCaptaincy,
  updateCaptaincy,
  deleteCaptaincy
} from "./captain.controller";

const router = Router();

// Public routes - anyone can view captaincy history
router.get("/", getCaptains);
router.get("/active", getActiveCaptains);
router.get("/stats", getCaptaincyStats);
router.get("/player/:playerId", getCaptaincyByPlayer);
router.get("/history/:role", getCaptaincyHistoryByRole);
router.get("/:id", getCaptaincyById);

// Protected routes - require authentication
router.use(authenticate);

// Captain assignment - requires admin/coach/manager privileges
router.post(
  "/",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
  assignCaptain
);

router.post(
  "/bulk",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
  assignMultipleCaptains
);

// End captaincy
router.put(
  "/:id/end",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
  endCaptaincy
);

// Update captaincy record
router.put(
  "/:id",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH),
  updateCaptaincy
);

// Delete captaincy record (admin only)
router.delete(
  "/:id",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
  deleteCaptaincy
);

export default router;