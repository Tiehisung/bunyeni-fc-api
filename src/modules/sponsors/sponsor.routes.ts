// routes/sponsor.routes.ts
import { Router } from "express";
import {
    getSponsors,
    getSponsorById,
    getTopSponsors,
    createSponsor,
    updateSponsor,
    toggleSponsorStatus,
    deleteSponsor,
    getSponsorStats,
} from "./sponsor.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { EUserRole } from "../../types/user.interface";
import { getDonationsBySponsor, createDonationForSponsor, deleteDonationBySponsor } from "./donations/donation.controller";

const router = Router();

// Public routes
router.get("/", getSponsors);
router.get("/stats", getSponsorStats);
router.get("/top", getTopSponsors);
router.get("/:id", getSponsorById);

// Sponsor donation routes (public read)
router.get("/:sponsorId/donations", getDonationsBySponsor);

// Protected routes - require authentication
router.use(authenticate);

// Sponsor management
router.route("/")
    .post(
        // authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
        createSponsor
    );

router.route("/:id")
    .put(
        authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
        updateSponsor
    )
    .delete(
        authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
        deleteSponsor
    );

// Sponsor status toggle
router.patch(
    "/:id/toggle-status",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
    toggleSponsorStatus
);

// Sponsor donations management
router.post(
    "/:sponsorId/donations",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
    createDonationForSponsor
);

router.delete(
    "/:sponsorId/donations/:donationId",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
    deleteDonationBySponsor
);

export default router;