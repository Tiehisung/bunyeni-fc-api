// routes/team.routes.ts
import { Router } from "express";
import {
  getTeams,
  getTeamById,
  getTeamsByClub,
  getTeamsBySeason,
  createTeam,
  updateTeam,
  patchTeam,
  deleteTeam,
  getTeamStats,
  addPlayerToTeam,
  removePlayerFromTeam,
} from "./team.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { EUserRole } from "../../types/user.interface";


const router = Router();

// Public routes
router.get("/", getTeams);
router.get("/stats", getTeamStats);
router.get("/club/:clubId", getTeamsByClub);
router.get("/season/:season", getTeamsBySeason);
router.get("/:id", getTeamById);

// Protected routes - require authentication
// router.use(authenticate);

// Team management
router.route("/")
  .post(
    // authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH),
    createTeam
  );

router.route("/:id")
  .put(
    // authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH),
    updateTeam
  )
  .patch(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH),
    patchTeam
  )
  .delete(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
    deleteTeam
  );

// Player management within teams
router.post(
  "/:id/players",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH),
  addPlayerToTeam
);

router.delete(
  "/:id/players/:playerId",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH),
  removePlayerFromTeam
);

export default router;