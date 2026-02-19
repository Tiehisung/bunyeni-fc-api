// routes/news.routes.ts
import { Router } from "express";
import {
    getNews,
    getTrendingNews,
    getLatestNews,
    getNewsByCategory,
    getNewsBySlug,
    createNews,
    updateNews,
    togglePublishStatus,
    likeNews,
    shareNews,
    deleteNews,
    getNewsStats,
} from "./news.controller";
import { authenticate, authorize } from "../../shared/middleware/auth.middleware";
import { EUserRole } from "../../types/user";


const router = Router();

// Public routes
router.get("/", getNews);
router.get("/stats", getNewsStats);
router.get("/trending", getTrendingNews);
router.get("/latest", getLatestNews);
router.get("/category/:category", getNewsByCategory);
router.get("/:slug", getNewsBySlug);

// Public interaction routes (no auth required)
router.post("/:slug/like", likeNews);
router.post("/:slug/share", shareNews);

// Protected routes - require authentication
router.use(authenticate);

// News management
router.route("/")
    .post(
        authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH),
        createNews
    );

router.route("/:slug")
    .put(
        authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
        updateNews
    )
    .delete(
        authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
        deleteNews
    );

// Publish status toggle
router.patch(
    "/:slug/publish",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH),
    togglePublishStatus
);

export default router;