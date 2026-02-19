"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/injury.routes.ts
const express_1 = require("express");
const injury_controller_1 = require("./injury.controller");
const auth_middleware_1 = require("../../../shared/middleware/auth.middleware");
const user_1 = require("../../../types/user");
const router = (0, express_1.Router)();
// Public routes
router.get("/", injury_controller_1.getInjuries);
router.get("/stats", injury_controller_1.getInjuryStats);
router.get("/active", injury_controller_1.getActiveInjuries);
router.get("/player/:playerId", injury_controller_1.getInjuriesByPlayer);
router.get("/match/:matchId", injury_controller_1.getInjuriesByMatch);
router.get("/:id", injury_controller_1.getInjuryById);
// Protected routes - require authentication
router.use(auth_middleware_1.authenticate);
// Injury management
router.route("/")
    .post((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), injury_controller_1.createInjury);
router.route("/:id")
    .put((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), injury_controller_1.updateInjury)
    .delete((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), injury_controller_1.deleteInjury);
// Status update
router.patch("/:id/status", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), injury_controller_1.updateInjuryStatus);
exports.default = router;
