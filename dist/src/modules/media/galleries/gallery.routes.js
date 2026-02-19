"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/gallery.routes.ts
const express_1 = require("express");
const gallery_controller_1 = require("./gallery.controller");
const auth_middleware_1 = require("../../../shared/middleware/auth.middleware");
const user_1 = require("../../../types/user");
const router = (0, express_1.Router)();
// Public routes (if galleries are publicly viewable)
router.get("/", gallery_controller_1.getGalleries);
router.get("/stats", gallery_controller_1.getGalleryStats);
router.get("/tag/:tag", gallery_controller_1.getGalleriesByTag);
router.get("/:galleryId", gallery_controller_1.getGalleryById);
// Protected routes - require authentication for modifications
router.use(auth_middleware_1.authenticate);
// Gallery management
router.route("/")
    .post((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH, user_1.EUserRole.PLAYER), gallery_controller_1.createGallery);
router.route("/:id")
    .put((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH, user_1.EUserRole.PLAYER), gallery_controller_1.updateGallery)
    .patch((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH, user_1.EUserRole.PLAYER), gallery_controller_1.patchGallery)
    .delete((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH, user_1.EUserRole.PLAYER), gallery_controller_1.deleteGallery);
// File management within galleries
router.post("/:galleryId/files", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH, user_1.EUserRole.PLAYER), gallery_controller_1.addFilesToGallery);
router.delete("/:galleryId/files/:fileId", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH, user_1.EUserRole.PLAYER), gallery_controller_1.removeFileFromGallery);
exports.default = router;
