// routes/document.routes.ts
import { Router } from "express";
import {
    getDocuments,
    getDocumentById,
    createDocuments,
    updateDocument,
    deleteDocuments,
    deleteDocument,
    moveDocuments,
    getFolders,
    getFolderById,
    createFolder,
    updateFolder,
    deleteFolder,
    getFolderDocuments,
} from "./doc.controller";
import { authenticate, authorize } from "../../../middleware/auth.middleware";
import { EUserRole } from "../../../types/user.interface";

const router = Router();

// Public routes (if documents are publicly viewable)
router.get("/", getDocuments);
router.get("/folders", getFolders);
router.get("/folders/:folderId", getFolderById);
router.get("/folders/:folderId/documents", getFolderDocuments);

// Protected routes - require authentication
router.use(authenticate);

// Document routes
router.route("/")
.post(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH), createDocuments)
    .delete(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH), deleteDocuments);

router.post("/move", authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH), moveDocuments);

router.route("/:id")
    .put(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH), updateDocument)
    .delete(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH), deleteDocument);

// Folder routes
router.route("/folders")
    .post(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH), createFolder);

router.route("/folders/:id")
.put(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH), updateFolder)
.delete(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN), deleteFolder);

router.get("/:id", getDocumentById);

export default router;