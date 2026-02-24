// routes/manager.routes.ts
import { Router } from "express";
import {
  getStaff,
  getActiveStaff,
  getStaffByRole,
  getManagerById,
  createStaff,
  updateStaff,
  deactivateStaff,
  activateStaff,
  deleteStaff,
  getStafftats,
} from "./staff.controller";
import { authenticate, authorize } from "../../shared/middleware/auth.middleware";
import { EUserRole } from "../../types/user";


const router = Router();

// Public routes - anyone can view staff information
router.get("/", getStaff);
router.get("/active", getActiveStaff);
router.get("/stats", getStafftats);
router.get("/role/:role", getStaffByRole);
router.get("/:id", getManagerById);

// Protected routes - require authentication
router.use(authenticate);

// Staff management - requires admin/management privileges
router.post(
  "/",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
  createStaff
);

router.put(
  "/:id",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
  updateStaff
);

// Status management
router.patch(
  "/:id/deactivate",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
  deactivateStaff
);

router.patch(
  "/:id/activate",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
  activateStaff
);

// Deletion - admin only
router.delete(
  "/:id",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
  deleteStaff
);

export default router;