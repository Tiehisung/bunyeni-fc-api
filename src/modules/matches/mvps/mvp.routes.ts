// routes/mvp.routes.ts (updated with dynamic ID routes)
import { Router } from "express";
import {
  getMvps,
  getMvpById,
  getMvpsByPlayer,
  getMvpByMatch,
  createMvp,
  updateMvpById,
  patchMvpById,
  deleteMvpById,
  transferMvp,
  getMvpStats,
  getMvpLeaderboard,
} from "./mvp.controller";
import { authenticate, authorize } from "../../../shared/middleware/auth.middleware";
import { EUserRole } from "../../../types/user";

const router = Router();

// Public routes
router.get("/", getMvps);
router.get("/stats", getMvpStats);
router.get("/leaderboard", getMvpLeaderboard);
router.get("/player/:playerId", getMvpsByPlayer);
router.get("/match/:matchId", getMvpByMatch);

// Dynamic ID routes (public read)
router.get("/:id", getMvpById);

// Protected routes - require authentication
router.use(authenticate);

// MVP management
router.route("/")
  .post(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH),
    createMvp
  );

// Dynamic ID routes (protected write)
router.route("/:id")
  .put(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH),
    updateMvpById
  )
  .patch(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH),
    patchMvpById
  )
  .delete(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
    deleteMvpById
  );

// Special operations
router.post("/:id/transfer",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
  transferMvp
);

// Backward compatibility route (if needed)
router.route("/:id")
  .get(getMvpById)
  .put(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH),
    updateMvpById
  )
  .delete(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
    deleteMvpById
  );

export default router;