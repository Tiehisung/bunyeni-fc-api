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

    deleteNews,
    getNewsStats,

    updateNewsViews,
    updateNewsComments,
    updateNewsShares,
    updateNewsLikes,
    deleteNewsComment,
} from "./news.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { EUserRole } from "../../types/user.interface";


const router = Router();

// Public routes
router.get("/", getNews);
router.get("/stats", getNewsStats);
router.get("/trending", getTrendingNews);
router.get("/latest", getLatestNews);
router.get("/category/:category", getNewsByCategory);
router.get("/:slug", getNewsBySlug);


// View routes
router.patch("/:newsId/views", updateNewsViews);
router.patch("/:newsId/comments", updateNewsComments);
router.patch("/:newsId/shares", updateNewsShares);
router.patch("/:newsId/likes", updateNewsLikes);  // New like route
router.delete("/:newsId/comments", deleteNewsComment);   
router.get("/:newsId/stats", getNewsStats);   

// Protected routes - require authentication
router.use(authenticate);

// News management
router.route("/")
    .post(
        authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH),
        createNews
    );

router.route("/:newsId")
    .put(
        // authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
        updateNews
    )
    .delete(
        authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
        deleteNews
    );




// Publish status toggle
router.patch(
    "/:newsId/publish",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH),
    togglePublishStatus
);

export default router;