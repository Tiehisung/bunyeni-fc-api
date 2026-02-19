// routes/document.routes.ts
import { Router } from "express";
import {
    getDocuments,
    getDocumentById,
    createDocument,
    updateDocument,
    deleteDocuments,
    deleteDocument,
    moveCopyDocuments,
    getFolders,
    getFolderByName,
    createFolder,
    updateFolder,
    deleteFolder,
    getFolderDocuments,
} from "./doc.controller";
import { authenticate, authorize } from "../../../shared/middleware/auth.middleware";
import { EUserRole } from "../../../types/user";

const router = Router();

// Public routes (if documents are publicly viewable)
router.get("/documents", getDocuments);
router.get("/documents/:id", getDocumentById);
router.get("/folders", getFolders);
router.get("/folders/:name", getFolderByName);
router.get("/folders/:folder/documents", getFolderDocuments);

// Protected routes - require authentication
router.use(authenticate);

// Document routes
router.route("/documents")
    .post(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH), createDocument)
    .delete(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH), deleteDocuments);

router.post("/documents/move-copy", authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH), moveCopyDocuments);

router.route("/documents/:id")
    .put(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH), updateDocument)
    .delete(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH), deleteDocument);

// Folder routes
router.route("/folders")
    .post(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH), createFolder);

router.route("/folders/:id")
    .put(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH), updateFolder)
    .delete(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN), deleteFolder);

export default router;