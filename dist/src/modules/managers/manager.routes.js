"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/manager.routes.ts
const express_1 = require("express");
const manager_controller_1 = require("./manager.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const user_1 = require("../../types/user");
const router = (0, express_1.Router)();
// Public routes - anyone can view staff information
router.get("/", manager_controller_1.getManagers);
router.get("/active", manager_controller_1.getActiveManagers);
router.get("/stats", manager_controller_1.getManagerStats);
router.get("/role/:role", manager_controller_1.getManagersByRole);
router.get("/:id", manager_controller_1.getManagerById);
// Protected routes - require authentication
router.use(auth_middleware_1.authenticate);
// Staff management - requires admin/management privileges
router.post("/", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), manager_controller_1.createManager);
router.put("/:id", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), manager_controller_1.updateManager);
// Status management
router.patch("/:id/deactivate", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), manager_controller_1.deactivateManager);
router.patch("/:id/activate", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), manager_controller_1.activateManager);
// Deletion - admin only
router.delete("/:id", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), manager_controller_1.deleteManager);
exports.default = router;
