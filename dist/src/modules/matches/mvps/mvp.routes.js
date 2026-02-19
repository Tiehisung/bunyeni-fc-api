"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/mvp.routes.ts (updated with dynamic ID routes)
const express_1 = require("express");
const mvp_controller_1 = require("./mvp.controller");
const auth_middleware_1 = require("../../../shared/middleware/auth.middleware");
const user_1 = require("../../../types/user");
const router = (0, express_1.Router)();
// Public routes
router.get("/", mvp_controller_1.getMvps);
router.get("/stats", mvp_controller_1.getMvpStats);
router.get("/leaderboard", mvp_controller_1.getMvpLeaderboard);
router.get("/player/:playerId", mvp_controller_1.getMvpsByPlayer);
router.get("/match/:matchId", mvp_controller_1.getMvpByMatch);
// Dynamic ID routes (public read)
router.get("/:id", mvp_controller_1.getMvpById);
// Protected routes - require authentication
router.use(auth_middleware_1.authenticate);
// MVP management
router.route("/")
    .post((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), mvp_controller_1.createMvp);
// Dynamic ID routes (protected write)
router.route("/:id")
    .put((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), mvp_controller_1.updateMvpById)
    .patch((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), mvp_controller_1.patchMvpById)
    .delete((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), mvp_controller_1.deleteMvpById);
// Special operations
router.post("/:id/transfer", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), mvp_controller_1.transferMvp);
// Backward compatibility route (if needed)
router.route("/:id")
    .get(mvp_controller_1.getMvpById)
    .put((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), mvp_controller_1.updateMvpById)
    .delete((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), mvp_controller_1.deleteMvpById);
exports.default = router;
