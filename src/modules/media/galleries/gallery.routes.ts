// routes/gallery.routes.ts
import { Router } from "express";
import {
  getGalleries,
  getGalleryById,
  getGalleriesByTag,
  createGallery,
  updateGallery,
  patchGallery,
  deleteGallery,
  addFilesToGallery,
  removeFileFromGallery,
  getGalleryStats,
} from "./gallery.controller";
import { authenticate, authorize } from "../../../shared/middleware/auth.middleware";
import { EUserRole } from "../../../types/user";

const router = Router();

// Public routes (if galleries are publicly viewable)
router.get("/", getGalleries);
router.get("/stats", getGalleryStats);
router.get("/tag/:tag", getGalleriesByTag);
router.get("/:galleryId", getGalleryById);

// Protected routes - require authentication for modifications
router.use(authenticate);

// Gallery management
router.route("/")
  .post(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH, EUserRole.PLAYER,), createGallery);

router.route("/:id")
  .put(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH, EUserRole.PLAYER,), updateGallery)
  .patch(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH, EUserRole.PLAYER,), patchGallery)
  .delete(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH, EUserRole.PLAYER,), deleteGallery);

// File management within galleries
router.post(
  "/:galleryId/files",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH, EUserRole.PLAYER,),
  addFilesToGallery
);

router.delete(
  "/:galleryId/files/:fileId",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH, EUserRole.PLAYER,),
  removeFileFromGallery
);

export default router;