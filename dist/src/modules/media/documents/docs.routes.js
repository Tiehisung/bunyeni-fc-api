"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/document.routes.ts
const express_1 = require("express");
const doc_controller_1 = require("./doc.controller");
const auth_middleware_1 = require("../../../shared/middleware/auth.middleware");
const user_1 = require("../../../types/user");
const router = (0, express_1.Router)();
// Public routes (if documents are publicly viewable)
router.get("/documents", doc_controller_1.getDocuments);
router.get("/documents/:id", doc_controller_1.getDocumentById);
router.get("/folders", doc_controller_1.getFolders);
router.get("/folders/:name", doc_controller_1.getFolderByName);
router.get("/folders/:folder/documents", doc_controller_1.getFolderDocuments);
// Protected routes - require authentication
router.use(auth_middleware_1.authenticate);
// Document routes
router.route("/documents")
    .post((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), doc_controller_1.createDocument)
    .delete((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), doc_controller_1.deleteDocuments);
router.post("/documents/move-copy", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), doc_controller_1.moveCopyDocuments);
router.route("/documents/:id")
    .put((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), doc_controller_1.updateDocument)
    .delete((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), doc_controller_1.deleteDocument);
// Folder routes
router.route("/folders")
    .post((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), doc_controller_1.createFolder);
router.route("/folders/:id")
    .put((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), doc_controller_1.updateFolder)
    .delete((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), doc_controller_1.deleteFolder);
exports.default = router;
