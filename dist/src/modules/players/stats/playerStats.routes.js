"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/stats/playerStats.routes.ts
const express_1 = require("express");
const playerStats_controller_1 = require("./playerStats.controller");
const auth_middleware_1 = require("../../../shared/middleware/auth.middleware");
const lib_1 = require("../../../lib");
const user_1 = require("../../../types/user");
const router = (0, express_1.Router)();
// Public routes - player statistics are public information
router.get("/global", playerStats_controller_1.getGlobalPlayerStats);
router.get("/rankings", playerStats_controller_1.getPlayerRankings);
router.get("/leaderboard", playerStats_controller_1.getPlayerLeaderboard);
router.get("/:playerId/summary", playerStats_controller_1.getPlayerSummary);
router.get("/:playerId", playerStats_controller_1.getPlayerStats);
// Protected routes - detailed player stats might require authentication
router.use(auth_middleware_1.authenticate);
// Detailed player analytics - requires coach/analyst/admin roles
router.get("/:playerId/detailed", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH), async (req, res) => {
    try {
        // This would combine multiple stats endpoints for a single player
        const { playerId } = req.params;
        // You would implement a detailed player analytics service here
        res.status(200).json({
            success: true,
            message: "Detailed player analytics endpoint - implement as needed",
            playerId,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch detailed player analytics"),
        });
    }
});
exports.default = router;
