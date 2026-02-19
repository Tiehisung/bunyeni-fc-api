// routes/feature.routes.ts
import { Router } from "express";
import {
    getFeatures,
    getFeatureByName,
    getFeaturesByCategory,
    createFeature,
    updateFeatureById,
    updateFeatureByName,
    toggleFeatureStatus,
    deleteFeatureById,
    deleteFeatureByName,
    checkFeatureStatus,
    getFeatureStats,
} from "./feature.controller";
import { authenticate, authorize } from "../../shared/middleware/auth.middleware";
import { EUserRole } from "../../types/user";

const router = Router();

// Public routes - anyone can check feature status (used by frontend)
router.get("/check/:name", checkFeatureStatus);
router.get("/category/:category", getFeaturesByCategory);

// Protected routes - require authentication
router.use(authenticate);

// Read operations - many roles can view features
router.get(
    "/",
    authorize(
        EUserRole.ADMIN,
        EUserRole.SUPER_ADMIN,
        EUserRole.COACH
    ),
    getFeatures
);

router.get(
    "/stats",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
    getFeatureStats
);

router.get("/:name", authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,), getFeatureByName);

// Write operations - restricted to admin/developer roles
router.post(
    "/",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
    createFeature
);

// Update by ID
router.put(
    "/:id",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
    updateFeatureById
);

// Update by name (convenience for frontend)
router.put(
    "/name/:name",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
    updateFeatureByName
);

// Toggle feature status
router.patch(
    "/:id/toggle",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
    toggleFeatureStatus
);

// Delete operations - super admin only for safety
router.delete(
    "/:id",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
    deleteFeatureById
);

router.delete(
    "/name/:name",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
    deleteFeatureByName
);

export default router;