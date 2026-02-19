"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/player.routes.ts
const express_1 = require("express");
const player_controller_1 = require("../../modules/players/player.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const user_1 = require("../../types/user");
const router = (0, express_1.Router)();
// Public routes (if needed)
// router.get("/", getPlayers);
// router.get("/:id", getPlayerById);
// Protected routes
router.use(auth_middleware_1.authenticate);
// Collection routes
router.route("/")
    .get(player_controller_1.getPlayers)
    .post((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), player_controller_1.createPlayer);
// Dynamic player routes by slug or ID
router.route("/:slug")
    .get(player_controller_1.getPlayerBySlugOrId)
    .put((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.PLAYER), player_controller_1.updatePlayerBySlugOrId)
    .patch((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.PLAYER), player_controller_1.patchPlayerBySlugOrId)
    .delete((0, auth_middleware_1.authorize)(user_1.EUserRole.SUPER_ADMIN), player_controller_1.deletePlayerBySlugOrId);
exports.default = router;
