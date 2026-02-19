"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/archive.routes.ts
const express_1 = require("express");
const archive_controller_1 = require("./archive.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const user_1 = require("../../types/user");
const router = (0, express_1.Router)();
// Public routes (if archives are publicly viewable)
// router.get("/", getArchives);
// router.get("/stats", getArchiveStats);
// router.get("/search", searchArchives);
// router.get("/collection/:collectionName", getArchivesByCollection);
// router.get("/:id", getArchiveById);
// Protected routes - require authentication
router.use(auth_middleware_1.authenticate);
// Admin/Super admin only routes
router.use((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN));
// Archive routes
router.route("/")
    .get(archive_controller_1.getArchives)
    .post(archive_controller_1.createArchive);
router.get("/stats", archive_controller_1.getArchiveStats);
router.get("/search", archive_controller_1.searchArchives);
router.get("/collection/:collectionName", archive_controller_1.getArchivesByCollection);
router.route("/:id")
    .get(archive_controller_1.getArchiveById)
    .delete(archive_controller_1.deleteArchive);
router.post("/:id/restore", archive_controller_1.restoreArchive);
router.delete("/collection/:collectionName", archive_controller_1.deleteArchivesByCollection);
exports.default = router;
