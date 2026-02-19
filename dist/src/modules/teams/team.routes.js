"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/team.routes.ts
const express_1 = require("express");
const team_controller_1 = require("./team.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const user_1 = require("../../types/user");
const router = (0, express_1.Router)();
// Public routes
router.get("/", team_controller_1.getTeams);
router.get("/stats", team_controller_1.getTeamStats);
router.get("/club/:clubId", team_controller_1.getTeamsByClub);
router.get("/season/:season", team_controller_1.getTeamsBySeason);
router.get("/:id", team_controller_1.getTeamById);
// Protected routes - require authentication
router.use(auth_middleware_1.authenticate);
// Team management
router.route("/")
    .post((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), team_controller_1.createTeam);
router.route("/:id")
    .put((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), team_controller_1.updateTeam)
    .patch((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), team_controller_1.patchTeam)
    .delete((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), team_controller_1.deleteTeam);
// Player management within teams
router.post("/:id/players", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), team_controller_1.addPlayerToTeam);
router.delete("/:id/players/:playerId", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), team_controller_1.removePlayerFromTeam);
exports.default = router;
