"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/donation.routes.ts
const express_1 = require("express");
const donation_controller_1 = require("./donation.controller");
const auth_middleware_1 = require("../../../shared/middleware/auth.middleware");
const user_1 = require("../../../types/user");
const router = (0, express_1.Router)();
// Public routes
router.get("/", donation_controller_1.getDonations);
router.get("/stats", donation_controller_1.getDonationStats);
router.get("/:id", donation_controller_1.getDonationById);
// Protected routes - require authentication
router.use(auth_middleware_1.authenticate);
// Donation management
router.route("/")
    .post((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), donation_controller_1.createDonation);
router.delete("/:id", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), donation_controller_1.deleteDonation);
exports.default = router;
