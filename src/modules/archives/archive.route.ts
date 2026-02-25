// routes/archive.routes.ts
import { Router } from "express";
import {
    getArchives,
    getArchiveById,
    getArchivesByCollection,
    searchArchives,
    createArchive,
    deleteArchive,
    deleteArchivesByCollection,
    getArchiveStats,
    restoreArchive,
} from "./archive.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { EUserRole } from "../../types/user.interface";


const router = Router();

// Public routes (if archives are publicly viewable)
// router.get("/", getArchives);
// router.get("/stats", getArchiveStats);
// router.get("/search", searchArchives);
// router.get("/collection/:collectionName", getArchivesByCollection);
// router.get("/:id", getArchiveById);

// Protected routes - require authentication
router.use(authenticate);

// Admin/Super admin only routes
router.use(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,));

// Archive routes
router.route("/")
    .get(getArchives)
    .post(createArchive);

router.get("/stats", getArchiveStats);
router.get("/search", searchArchives);
router.get("/collection/:collectionName", getArchivesByCollection);

router.route("/:id")
    .get(getArchiveById)
    .delete(deleteArchive);

router.post("/:id/restore", restoreArchive);
router.delete("/collection/:collectionName", deleteArchivesByCollection);

export default router;