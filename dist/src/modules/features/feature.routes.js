"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/feature.routes.ts
const express_1 = require("express");
const feature_controller_1 = require("./feature.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const user_1 = require("../../types/user");
const router = (0, express_1.Router)();
// Public routes - anyone can check feature status (used by frontend)
router.get("/check/:name", feature_controller_1.checkFeatureStatus);
router.get("/category/:category", feature_controller_1.getFeaturesByCategory);
// Protected routes - require authentication
router.use(auth_middleware_1.authenticate);
// Read operations - many roles can view features
router.get("/", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), feature_controller_1.getFeatures);
router.get("/stats", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), feature_controller_1.getFeatureStats);
router.get("/:name", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), feature_controller_1.getFeatureByName);
// Write operations - restricted to admin/developer roles
router.post("/", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), feature_controller_1.createFeature);
// Update by ID
router.put("/:id", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), feature_controller_1.updateFeatureById);
// Update by name (convenience for frontend)
router.put("/name/:name", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), feature_controller_1.updateFeatureByName);
// Toggle feature status
router.patch("/:id/toggle", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), feature_controller_1.toggleFeatureStatus);
// Delete operations - super admin only for safety
router.delete("/:id", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), feature_controller_1.deleteFeatureById);
router.delete("/name/:name", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), feature_controller_1.deleteFeatureByName);
exports.default = router;
