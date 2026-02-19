"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/metrics.routes.ts
const express_1 = require("express");
const metrics_controller_1 = require("./metrics.controller");
const lib_1 = require("../../lib");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const user_1 = require("../../types/user");
const router = (0, express_1.Router)();
// Most metrics are public - used for displaying stats on the website
router.get("/dashboard", metrics_controller_1.getDashboardMetrics);
router.get("/overview", metrics_controller_1.getOverviewMetrics);
router.get("/trends", metrics_controller_1.getMetricTrends);
router.get("/season/:season", metrics_controller_1.getSeasonMetrics);
router.get("/head-to-head/:opponentId", metrics_controller_1.getHeadToHeadMetrics);
router.get("/player/:playerId", metrics_controller_1.getPlayerMetrics);
// Some detailed metrics might require authentication
router.use(auth_middleware_1.authenticate);
// Detailed analytics - requires admin/coach/analyst roles
router.get("/detailed", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), async (req, res) => {
    try {
        // This would be a more detailed analytics endpoint
        const [dashboard, overview, trends] = await Promise.all([
            (0, metrics_controller_1.getDashboardMetrics)(req, res),
            (0, metrics_controller_1.getOverviewMetrics)(req, res),
            (0, metrics_controller_1.getMetricTrends)(req, res),
        ]);
        // Note: This is just a placeholder. In practice, you'd create
        // a separate controller method for detailed analytics.
        res.status(200).json({
            success: true,
            message: "Detailed analytics endpoint - implement as needed",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch detailed analytics"),
        });
    }
});
exports.default = router;
