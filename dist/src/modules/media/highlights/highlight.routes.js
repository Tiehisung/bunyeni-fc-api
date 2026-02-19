"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/highlight.routes.ts
const express_1 = require("express");
const highlight_controller_1 = require("./highlight.controller");
const auth_middleware_1 = require("../../../shared/middleware/auth.middleware");
const user_1 = require("../../../types/user");
const router = (0, express_1.Router)();
// Public routes (viewing highlights)
router.get("/", highlight_controller_1.getHighlights);
router.get("/stats", highlight_controller_1.getHighlightStats);
router.get("/match/:matchId", highlight_controller_1.getHighlightsByMatch);
router.get("/:highlightId", highlight_controller_1.getHighlightById);
router.post("/:highlightId/view", highlight_controller_1.incrementHighlightView); // Public view counting
// Protected routes - require authentication for modifications
router.use(auth_middleware_1.authenticate);
// Highlight management (admin/manager/editor only)
router.route("/")
    .post((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), highlight_controller_1.createHighlight);
router.route("/:highlightId")
    .put((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), highlight_controller_1.updateHighlight)
    .patch((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), highlight_controller_1.patchHighlight)
    .delete((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), highlight_controller_1.deleteHighlight);
exports.default = router;
