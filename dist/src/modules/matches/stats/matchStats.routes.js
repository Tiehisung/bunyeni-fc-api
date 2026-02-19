"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/stats/matchStats.routes.ts
const express_1 = require("express");
const matchStats_controller_1 = require("./matchStats.controller");
const auth_middleware_1 = require("../../../shared/middleware/auth.middleware");
const user_1 = require("../../../types/user");
const lib_1 = require("../../../lib");
const router = (0, express_1.Router)();
// Public routes - match statistics are public information
router.get("/", matchStats_controller_1.getMatchStats);
router.get("/detailed", matchStats_controller_1.getDetailedMatchStats);
router.get("/home-away", matchStats_controller_1.getHomeAwayStats);
router.get("/form", matchStats_controller_1.getFormGuide);
router.get("/streaks", matchStats_controller_1.getStreaks);
// Protected routes - some advanced stats might require authentication
router.use(auth_middleware_1.authenticate);
// Advanced analytics - requires analyst/admin roles
router.get("/advanced", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), async (req, res) => {
    try {
        // This would combine multiple stats endpoints
        const [basic, detailed, homeAway, form, streaks] = await Promise.all([
            // You would need to create a service function for this
            (0, matchStats_controller_1.getMatchStats)(req, res),
            (0, matchStats_controller_1.getDetailedMatchStats)(req, res),
            (0, matchStats_controller_1.getHomeAwayStats)(req, res),
            (0, matchStats_controller_1.getFormGuide)(req, res),
            (0, matchStats_controller_1.getStreaks)(req, res),
        ]);
        // Note: This is a placeholder. In practice, you'd create
        // a separate service that returns combined stats.
        res.status(200).json({
            success: true,
            message: "Advanced analytics endpoint - implement as needed",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: (0, lib_1.getErrorMessage)(error, "Failed to fetch advanced analytics"),
        });
    }
});
exports.default = router;
