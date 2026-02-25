// routes/stats/playerStats.routes.ts
import { type Request, type Response, Router } from "express";
import {
    getPlayerStats,
    getPlayerSummary,
    getGlobalPlayerStats,
    getPlayerRankings,
    getPlayerLeaderboard,
} from "./playerStats.controller";
import { authenticate, authorize } from "../../../middleware/auth.middleware";
import { getErrorMessage } from "../../../lib";
import { EUserRole } from "../../../types/user.interface";


const router = Router();

// Public routes - player statistics are public information
router.get("/global", getGlobalPlayerStats);
router.get("/rankings", getPlayerRankings);
router.get("/leaderboard", getPlayerLeaderboard);
router.get("/:playerId/summary", getPlayerSummary);
router.get("/:playerId", getPlayerStats);

// Protected routes - detailed player stats might require authentication
router.use(authenticate);

// Detailed player analytics - requires coach/analyst/admin roles
router.get(
    "/:playerId/detailed",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
    async (req: Request, res: Response) => {
        try {
            // This would combine multiple stats endpoints for a single player
            const { playerId } = req.params;

            // You would implement a detailed player analytics service here
            res.status(200).json({
                success: true,
                message: "Detailed player analytics endpoint - implement as needed",
                playerId,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: getErrorMessage(error, "Failed to fetch detailed player analytics"),
            });
        }
    }
);

export default router;