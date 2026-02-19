"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/squad.routes.ts
const express_1 = require("express");
const squad_controller_1 = require("./squad.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const user_1 = require("../../types/user");
const router = (0, express_1.Router)();
// Public routes
router.get("/", squad_controller_1.getSquads);
router.get("/stats", squad_controller_1.getSquadStats);
router.get("/match/:matchId", squad_controller_1.getSquadByMatch);
router.get("/:id", squad_controller_1.getSquadById);
// Protected routes - require authentication
router.use(auth_middleware_1.authenticate);
// Squad management
router.route("/")
    .post((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), squad_controller_1.createSquad);
router.route("/:id")
    .put((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), squad_controller_1.updateSquad)
    .delete((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), squad_controller_1.deleteSquad);
// Squad operations
router.patch("/:id/players", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), squad_controller_1.updateSquadPlayers);
router.patch("/:id/substitutions", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), squad_controller_1.addSubstitution);
router.patch("/:id/formation", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), squad_controller_1.updateFormation);
exports.default = router;
