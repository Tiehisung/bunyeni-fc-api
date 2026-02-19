"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/sponsor.routes.ts
const express_1 = require("express");
const sponsor_controller_1 = require("./sponsor.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const user_1 = require("../../types/user");
const donation_controller_1 = require("./donations/donation.controller");
const router = (0, express_1.Router)();
// Public routes
router.get("/", sponsor_controller_1.getSponsors);
router.get("/stats", sponsor_controller_1.getSponsorStats);
router.get("/top", sponsor_controller_1.getTopSponsors);
router.get("/:id", sponsor_controller_1.getSponsorById);
// Sponsor donation routes (public read)
router.get("/:sponsorId/donations", donation_controller_1.getDonationsBySponsor);
// Protected routes - require authentication
router.use(auth_middleware_1.authenticate);
// Sponsor management
router.route("/")
    .post((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), sponsor_controller_1.createSponsor);
router.route("/:id")
    .put((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), sponsor_controller_1.updateSponsor)
    .delete((0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), sponsor_controller_1.deleteSponsor);
// Sponsor status toggle
router.patch("/:id/toggle-status", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), sponsor_controller_1.toggleSponsorStatus);
// Sponsor donations management
router.post("/:sponsorId/donations", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), donation_controller_1.createDonationForSponsor);
router.delete("/:sponsorId/donations/:donationId", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), donation_controller_1.deleteDonationBySponsor);
exports.default = router;
