"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/captaincy.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const user_1 = require("../../types/user");
const captain_controller_1 = require("./captain.controller");
const router = (0, express_1.Router)();
// Public routes - anyone can view captaincy history
router.get("/", captain_controller_1.getCaptains);
router.get("/active", captain_controller_1.getActiveCaptains);
router.get("/stats", captain_controller_1.getCaptaincyStats);
router.get("/player/:playerId", captain_controller_1.getCaptaincyByPlayer);
router.get("/history/:role", captain_controller_1.getCaptaincyHistoryByRole);
router.get("/:id", captain_controller_1.getCaptaincyById);
// Protected routes - require authentication
router.use(auth_middleware_1.authenticate);
// Captain assignment - requires admin/coach/manager privileges
router.post("/", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), captain_controller_1.assignCaptain);
router.post("/bulk", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), captain_controller_1.assignMultipleCaptains);
// End captaincy
router.put("/:id/end", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), captain_controller_1.endCaptaincy);
// Update captaincy record
router.put("/:id", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), captain_controller_1.updateCaptaincy);
// Delete captaincy record (admin only)
router.delete("/:id", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), captain_controller_1.deleteCaptaincy);
exports.default = router;
