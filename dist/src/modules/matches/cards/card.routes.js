"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/card.routes.ts
const express_1 = require("express");
const card_controller_1 = require("./card.controller");
const auth_middleware_1 = require("../../../shared/middleware/auth.middleware");
const user_1 = require("../../../types/user");
const router = (0, express_1.Router)();
// Public routes
router.get("/", card_controller_1.getCards);
router.get("/stats", card_controller_1.getCardStats);
router.get("/match/:matchId", card_controller_1.getCardsByMatch);
router.get("/player/:playerId", card_controller_1.getCardsByPlayer);
router.get("/:id", card_controller_1.getCardById);
// Protected routes - require authentication
router.use(auth_middleware_1.authenticate);
// Card management
router.route("/")
    .post((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), card_controller_1.createCard);
router.route("/:id")
    .put((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), card_controller_1.updateCard)
    .delete((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), card_controller_1.deleteCard);
exports.default = router;
