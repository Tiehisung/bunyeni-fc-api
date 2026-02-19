// routes/stats/matchStats.routes.ts
import { type Request, type Response, Router } from "express";
import {
    getMatchStats,
    getDetailedMatchStats,
    getHomeAwayStats,
    getFormGuide,
    getStreaks,
} from "./matchStats.controller";
import { authenticate, authorize } from "../../../shared/middleware/auth.middleware";
import { EUserRole } from "../../../types/user";
import { getErrorMessage } from "../../../lib";


const router = Router();

// Public routes - match statistics are public information
router.get("/", getMatchStats);
router.get("/detailed", getDetailedMatchStats);
router.get("/home-away", getHomeAwayStats);
router.get("/form", getFormGuide);
router.get("/streaks", getStreaks);

// Protected routes - some advanced stats might require authentication
router.use(authenticate);

// Advanced analytics - requires analyst/admin roles
router.get(
    "/advanced",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH),
    async (req: Request, res: Response) => {
        try {
            // This would combine multiple stats endpoints
            const [basic, detailed, homeAway, form, streaks] = await Promise.all([
                // You would need to create a service function for this
                getMatchStats(req, res),
                getDetailedMatchStats(req, res),
                getHomeAwayStats(req, res),
                getFormGuide(req, res),
                getStreaks(req, res),
            ]);

            // Note: This is a placeholder. In practice, you'd create
            // a separate service that returns combined stats.
            res.status(200).json({
                success: true,
                message: "Advanced analytics endpoint - implement as needed",
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: getErrorMessage(error, "Failed to fetch advanced analytics"),
            });
        }
    }
);

export default router;