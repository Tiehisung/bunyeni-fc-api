// routes/metrics.routes.ts
import { Router } from "express";
import type { Request, Response, } from "express";
import {
  getDashboardMetrics,
  getSeasonMetrics,
  getHeadToHeadMetrics,
  getPlayerMetrics,
  getOverviewMetrics,
  getMetricTrends,
} from "./metrics.controller";
import { getErrorMessage } from "../../lib";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { EUserRole } from "../../types/user.interface";

const router = Router();

// Most metrics are public - used for displaying stats on the website
router.get("/dashboard", getDashboardMetrics);
router.get("/overview", getOverviewMetrics);
router.get("/trends", getMetricTrends);
router.get("/season/:season", getSeasonMetrics);
router.get("/head-to-head/:opponentId", getHeadToHeadMetrics);
router.get("/player/:playerId", getPlayerMetrics);

// Some detailed metrics might require authentication
router.use(authenticate);

// Detailed analytics - requires admin/coach/analyst roles
router.get(
  "/detailed",
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
  async (req: Request, res: Response) => {
    try {
      // This would be a more detailed analytics endpoint
      const [dashboard, overview, trends] = await Promise.all([
        getDashboardMetrics(req, res),
        getOverviewMetrics(req, res),
        getMetricTrends(req, res),
      ]);

      // Note: This is just a placeholder. In practice, you'd create
      // a separate controller method for detailed analytics.
      res.status(200).json({
        success: true,
        message: "Detailed analytics endpoint - implement as needed",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: getErrorMessage(error, "Failed to fetch detailed analytics"),
      });
    }
  }
);

export default router;