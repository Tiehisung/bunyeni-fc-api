// routes/donation.routes.ts
import { Router } from "express";
import {
    getDonations,
    getDonationById,
    createDonation,
    deleteDonation,
    getDonationStats,
} from "./donation.controller";
import { authenticate, authorize } from "../../../middleware/auth.middleware";
import { EUserRole } from "../../../types/user.interface";

const router = Router();

// Public routes
router.get("/", getDonations);
router.get("/stats", getDonationStats);
router.get("/:id", getDonationById);

// Protected routes - require authentication
router.use(authenticate);

// Donation management
router.route("/")
    .post(
        authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
        createDonation
    );

router.delete(
    "/:id",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
    deleteDonation
);

export default router;