"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/news.routes.ts
const express_1 = require("express");
const news_controller_1 = require("./news.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const user_1 = require("../../types/user");
const router = (0, express_1.Router)();
// Public routes
router.get("/", news_controller_1.getNews);
router.get("/stats", news_controller_1.getNewsStats);
router.get("/trending", news_controller_1.getTrendingNews);
router.get("/latest", news_controller_1.getLatestNews);
router.get("/category/:category", news_controller_1.getNewsByCategory);
router.get("/:slug", news_controller_1.getNewsBySlug);
// Public interaction routes (no auth required)
router.post("/:slug/like", news_controller_1.likeNews);
router.post("/:slug/share", news_controller_1.shareNews);
// Protected routes - require authentication
router.use(auth_middleware_1.authenticate);
// News management
router.route("/")
    .post((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), news_controller_1.createNews);
router.route("/:slug")
    .put((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), news_controller_1.updateNews)
    .delete((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), news_controller_1.deleteNews);
// Publish status toggle
router.patch("/:slug/publish", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), news_controller_1.togglePublishStatus);
exports.default = router;
