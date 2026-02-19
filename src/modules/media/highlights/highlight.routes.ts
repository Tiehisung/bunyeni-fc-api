// routes/highlight.routes.ts
import { Router } from "express";
import {
    getHighlights,
    getHighlightById,
    getHighlightsByMatch,
    createHighlight,
    updateHighlight,
    patchHighlight,
    deleteHighlight,
    getHighlightStats,
    incrementHighlightView
} from "./highlight.controller";
import { authenticate, authorize } from "../../../shared/middleware/auth.middleware";
import { EUserRole } from "../../../types/user";

const router = Router();

// Public routes (viewing highlights)
router.get("/", getHighlights);
router.get("/stats", getHighlightStats);
router.get("/match/:matchId", getHighlightsByMatch);
router.get("/:highlightId", getHighlightById);
router.post("/:highlightId/view", incrementHighlightView); // Public view counting

// Protected routes - require authentication for modifications
router.use(authenticate);

// Highlight management (admin/manager/editor only)
router.route("/")
    .post(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), createHighlight);

router.route("/:highlightId")
    .put(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), updateHighlight)
    .patch(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), patchHighlight)
    .delete(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), deleteHighlight);

export default router;