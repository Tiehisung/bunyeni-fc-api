// routes/manager.routes.ts
import { Router } from "express";
import {
  getManagers,
  getActiveManagers,
  getManagersByRole,
  getManagerById,
  createManager,
  updateManager,
  deactivateManager,
  activateManager,
  deleteManager,
  getManagerStats,
} from "./manager.controller";
import { authenticate, authorize } from "../../shared/middleware/auth.middleware";
import { EUserRole } from "../../types/user";


const router = Router();

// Public routes - anyone can view staff information
router.get("/", getManagers);
router.get("/active", getActiveManagers);
router.get("/stats", getManagerStats);
router.get("/role/:role", getManagersByRole);
router.get("/:id", getManagerById);

// Protected routes - require authentication
router.use(authenticate);

// Staff management - requires admin/management privileges
router.post(
  "/",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
  createManager
);

router.put(
  "/:id",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
  updateManager
);

// Status management
router.patch(
  "/:id/deactivate",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
  deactivateManager
);

router.patch(
  "/:id/activate",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
  activateManager
);

// Deletion - admin only
router.delete(
  "/:id",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
  deleteManager
);

export default router;