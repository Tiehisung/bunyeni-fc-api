// routes/squad.routes.ts
import { Router } from "express";
import {
  getSquads,
  getSquadById,
  getSquadByMatch,
  createSquad,
  updateSquad,
  updateSquadPlayers,
  addSubstitution,
  updateFormation,
  deleteSquad,
  getSquadStats,
} from "./squad.controller";
import { authenticate, authorize } from "../../shared/middleware/auth.middleware";
import { EUserRole } from "../../types/user";

const router = Router();

// Public routes
router.get("/", getSquads);
router.get("/stats", getSquadStats);
router.get("/match/:matchId", getSquadByMatch);
router.get("/:id", getSquadById);

// Protected routes - require authentication
router.use(authenticate);

// Squad management
router.route("/")
  .post(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
    createSquad
  );

router.route("/:id")
  .put(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
    updateSquad
  )
  .delete(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
    deleteSquad
  );

// Squad operations
router.patch(
  "/:id/players",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
  updateSquadPlayers
);

router.patch(
  "/:id/substitutions",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
  addSubstitution
);

router.patch(
  "/:id/formation",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
  updateFormation
);

export default router;