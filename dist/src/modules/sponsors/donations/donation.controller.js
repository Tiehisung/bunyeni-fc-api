"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDonationStats = exports.deleteDonationBySponsor = exports.deleteDonation = exports.createDonationForSponsor = exports.createDonation = exports.getDonationsBySponsor = exports.getDonationById = exports.getDonations = void 0;
const lib_1 = require("../../../lib");
const helper_1 = require("../../media/highlights/helper");
const sponsor_model_1 = __importDefault(require("../sponsor.model"));
const donation_model_1 = __importDefault(require("./donation.model"));
// GET /api/donations
const getDonations = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const search = req.query.donation_search || "";
        const sponsorId = req.query.sponsorId;
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        const regex = new RegExp(search, "i");
        let query = {};
        if (search) {
            query.$or = [
                { "item": regex },
                { "description": regex },
                { "date": regex },
                { "category": regex },
            ];
        }
        if (sponsorId) {
            query.sponsor = sponsorId;
        }
        if (fromDate || toDate) {
            query.date = {};
            if (fromDate)
                query.date.$gte = new Date(fromDate);
            if (toDate)
                query.date.$lte = new Date(toDate);
        }
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        const donations = await donation_model_1.default.find(cleaned)
            .populate({ path: "sponsor", select: "name businessName logo" })
            .populate("files")
            .limit(limit)
            .skip(skip)
            .lean()
            .sort({ createdAt: "desc" });
        const total = await donation_model_1.default.countDocuments(cleaned);
        res.status(200).json({
            success: true,
            data: donations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch donations"),
        });
    }
};
exports.getDonations = getDonations;
// GET /api/donations/:id
const getDonationById = async (req, res) => {
    try {
        const { id } = req.params;
        const donation = await donation_model_1.default.findById(id)
            .populate("sponsor")
            .populate("files")
            .lean();
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: "Donation not found",
            });
        }
        res.status(200).json({
            success: true,
            data: donation,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch donation"),
        });
    }
};
exports.getDonationById = getDonationById;
// GET /api/donations/sponsor/:sponsorId
const getDonationsBySponsor = async (req, res) => {
    try {
        const { sponsorId } = req.params;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const search = req.query.donation_search || "";
        const regex = new RegExp(search, "i");
        let query = { sponsor: sponsorId };
        if (search) {
            query.$or = [
                { "item": regex },
                { "description": regex },
                { "date": regex },
            ];
        }
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        const donations = await donation_model_1.default.find(cleaned)
            .populate({ path: "sponsor" })
            .populate("files")
            .limit(limit)
            .skip(skip)
            .lean()
            .sort({ createdAt: "desc" });
        const total = await donation_model_1.default.countDocuments(cleaned);
        res.status(200).json({
            success: true,
            data: donations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch sponsor donations"),
        });
    }
};
exports.getDonationsBySponsor = getDonationsBySponsor;
// POST /api/donations
const createDonation = async (req, res) => {
    try {
        const { sponsorId, item, description, files, date, value, category } = req.body;
        if (!sponsorId || !item) {
            return res.status(400).json({
                success: false,
                message: "Sponsor ID and item are required",
            });
        }
        // Create donation
        const donated = await donation_model_1.default.create({
            item,
            description,
            files,
            date: date || new Date(),
            sponsor: sponsorId,
            value,
            category: category || 'general',
            createdBy: req.user?.id,
            createdAt: new Date(),
        });
        // Update sponsor
        await sponsor_model_1.default.findByIdAndUpdate(sponsorId, {
            $push: { donations: donated._id },
            $inc: {
                badge: 1,
                totalDonations: 1,
                totalValue: value || 0,
            }
        });
        // Create gallery if files exist
        if (files?.length > 0) {
            const sponsor = await sponsor_model_1.default.findById(sponsorId);
            await (0, helper_1.createGallery)({
                title: item,
                description: description || `Donation from ${sponsor?.name || sponsor?.businessName}`,
                files,
                tags: [sponsor?.name, sponsor?.businessName, category].filter(Boolean),
            });
        }
        // Populate for response
        const populatedDonation = await donation_model_1.default.findById(donated._id)
            .populate("sponsor")
            .populate("files")
            .lean();
        res.status(201).json({
            message: "Donation recorded successfully",
            success: true,
            data: populatedDonation,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to create donation"),
            success: false,
        });
    }
};
exports.createDonation = createDonation;
// POST /api/sponsors/:sponsorId/donations
const createDonationForSponsor = async (req, res) => {
    try {
        const { sponsorId } = req.params;
        const { item, description, files, date, value, category } = req.body;
        if (!item) {
            return res.status(400).json({
                success: false,
                message: "Item is required",
            });
        }
        // Check if sponsor exists
        const sponsor = await sponsor_model_1.default.findById(sponsorId);
        if (!sponsor) {
            return res.status(404).json({
                success: false,
                message: "Sponsor not found",
            });
        }
        // Create donation
        const donated = await donation_model_1.default.create({
            item,
            description,
            files,
            date: date || new Date(),
            sponsor: sponsorId,
            value,
            category: category || 'general',
            createdBy: req.user?.id,
            createdAt: new Date(),
        });
        // Update sponsor
        await sponsor_model_1.default.findByIdAndUpdate(sponsorId, {
            $push: { donations: donated._id },
            $inc: {
                badge: 1,
                totalDonations: 1,
                totalValue: value || 0,
            }
        });
        // Create gallery if files exist
        if (files?.length > 0) {
            await (0, helper_1.createGallery)({
                title: item,
                description: description || `Donation from ${sponsor.name || sponsor.businessName}`,
                files,
                tags: [sponsor.name, sponsor.businessName, category].filter(Boolean),
            });
        }
        // Populate for response
        const populatedDonation = await donation_model_1.default.findById(donated._id)
            .populate("sponsor")
            .populate("files")
            .lean();
        res.status(201).json({
            message: "Donation recorded successfully",
            success: true,
            data: populatedDonation,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to create donation"),
            success: false,
        });
    }
};
exports.createDonationForSponsor = createDonationForSponsor;
// DELETE /api/donations/:id
const deleteDonation = async (req, res) => {
    try {
        const { id } = req.params;
        // Find donation first
        const donation = await donation_model_1.default.findById(id);
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: "Donation not found",
            });
        }
        // Delete donation
        await donation_model_1.default.findByIdAndDelete(id);
        // Update sponsor - remove donation reference
        await sponsor_model_1.default.findByIdAndUpdate(donation.sponsor, {
            $pull: { donations: id },
            $inc: {
                badge: -1,
                totalDonations: -1,
                totalValue: -(donation.value || 0),
            }
        });
        res.status(200).json({
            message: "Donation revoked successfully",
            success: true,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to delete donation"),
            success: false,
        });
    }
};
exports.deleteDonation = deleteDonation;
// DELETE /api/sponsors/:sponsorId/donations/:donationId
const deleteDonationBySponsor = async (req, res) => {
    try {
        const { sponsorId, donationId } = req.params;
        await donation_model_1.default.findByIdAndDelete(donationId);
        await sponsor_model_1.default.findByIdAndUpdate(sponsorId, {
            $pull: { donations: donationId },
        });
        res.status(200).json({
            message: "Donation revoked successfully",
            success: true,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to delete donation"),
            success: false,
        });
    }
};
exports.deleteDonationBySponsor = deleteDonationBySponsor;
// GET /api/donations/stats
const getDonationStats = async (req, res) => {
    try {
        const stats = await donation_model_1.default.aggregate([
            {
                $facet: {
                    totalDonations: [{ $count: "count" }],
                    totalValue: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$value" },
                            },
                        },
                    ],
                    byCategory: [
                        {
                            $group: {
                                _id: "$category",
                                count: { $sum: 1 },
                                totalValue: { $sum: "$value" },
                            },
                        },
                    ],
                    byMonth: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: "$date" },
                                    month: { $month: "$date" },
                                },
                                count: { $sum: 1 },
                                totalValue: { $sum: "$value" },
                            },
                        },
                        { $sort: { "_id.year": -1, "_id.month": -1 } },
                        { $limit: 12 },
                    ],
                },
            },
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalDonations: stats[0]?.totalDonations[0]?.count || 0,
                totalValue: stats[0]?.totalValue[0]?.total || 0,
                byCategory: stats[0]?.byCategory || [],
                byMonth: stats[0]?.byMonth || [],
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch donation statistics"),
        });
    }
};
exports.getDonationStats = getDonationStats;
