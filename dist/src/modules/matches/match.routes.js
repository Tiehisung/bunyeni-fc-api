"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/match.routes.ts (updated with slug routes)
const express_1 = require("express");
const match_controller_1 = require("./match.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const user_1 = require("../../types/user");
const router = (0, express_1.Router)();
// Public routes
router.get("/", match_controller_1.getMatches);
router.get("/stats", match_controller_1.getMatchStats);
router.get("/upcoming", match_controller_1.getUpcomingMatches);
router.get("/recent", match_controller_1.getRecentMatches);
router.get("/live", match_controller_1.getLiveMatch);
router.get("/season/:season", match_controller_1.getMatchesBySeason);
router.post("/live", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), match_controller_1.goLiveMatch);
router.put("/live", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), match_controller_1.updateLiveMatchEvents);
// Slug-based routes (flexible identifier)
router.get("/:slug", match_controller_1.getMatchBySlugOrId);
router.put("/:slug", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), match_controller_1.updateMatchBySlugOrId);
router.patch("/:slug", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), match_controller_1.patchMatchBySlugOrId);
router.delete("/:slug", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), match_controller_1.deleteMatchBySlugOrId);
router.route("/")
    .post((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), match_controller_1.createMatch);
// Match event routes
router.post("/:slug/goals", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), match_controller_1.addGoalToMatch);
router.post("/:slug/cards", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), match_controller_1.addCardToMatch);
router.post("/:slug/injuries", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), match_controller_1.addInjuryToMatch);
router.post("/:slug/mvp", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), match_controller_1.setMatchMVP);
// Legacy ID routes (maintain backward compatibility)
router.route("/:slug")
    .put(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), match_controller_1.updateMatch)
    .delete(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), match_controller_1.deleteMatch);
// Status and result updates (using ID for simplicity)
router.patch("/:slug/status", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), match_controller_1.updateMatchStatus);
router.patch("/:slug/result", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), match_controller_1.updateMatchResult);
exports.default = router;
