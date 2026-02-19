// routes/match.routes.ts (updated with slug routes)
import { Router } from "express";
import {
  getMatches,
  getMatchBySlugOrId,
  getUpcomingMatches,
  getRecentMatches,
  getMatchesBySeason,
  createMatch,
  updateMatch,
  updateMatchBySlugOrId,
  patchMatchBySlugOrId,
  updateMatchStatus,
  updateMatchResult,
  deleteMatch,
  deleteMatchBySlugOrId,
  getMatchStats,
  addGoalToMatch,
  addCardToMatch,
  addInjuryToMatch,
  setMatchMVP, getLiveMatch, goLiveMatch, updateLiveMatchEvents
} from "./match.controller";
import { authenticate, authorize } from "../../shared/middleware/auth.middleware";
import { EUserRole } from "../../types/user";

const router = Router();

// Public routes
router.get("/", getMatches);
router.get("/stats", getMatchStats);
router.get("/upcoming", getUpcomingMatches);
router.get("/recent", getRecentMatches);
router.get("/live", getLiveMatch);
router.get("/season/:season", getMatchesBySeason);
router.post("/live", authenticate, authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), goLiveMatch);
router.put("/live", authenticate, authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), updateLiveMatchEvents);


// Slug-based routes (flexible identifier)
router.get("/:slug", getMatchBySlugOrId);
router.put("/:slug", authenticate, authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), updateMatchBySlugOrId);
router.patch("/:slug", authenticate, authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), patchMatchBySlugOrId);
router.delete("/:slug", authenticate, authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,), deleteMatchBySlugOrId);

router.route("/")
  .post(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), createMatch);

// Match event routes
router.post("/:slug/goals", authenticate, authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), addGoalToMatch);
router.post("/:slug/cards", authenticate, authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), addCardToMatch);
router.post("/:slug/injuries", authenticate, authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), addInjuryToMatch);
router.post("/:slug/mvp", authenticate, authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), setMatchMVP);

// Legacy ID routes (maintain backward compatibility)
router.route("/:slug")
  .put(authenticate, authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), updateMatch)
  .delete(authenticate, authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,), deleteMatch);

// Status and result updates (using ID for simplicity)
router.patch("/:slug/status", authenticate, authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), updateMatchStatus);
router.patch("/:slug/result", authenticate, authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), updateMatchResult);

export default router;