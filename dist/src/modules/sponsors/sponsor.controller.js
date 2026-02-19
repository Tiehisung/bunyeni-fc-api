"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSponsorStats = exports.deleteSponsor = exports.toggleSponsorStatus = exports.updateSponsor = exports.createSponsor = exports.getTopSponsors = exports.getSponsorById = exports.getSponsors = void 0;
const lib_1 = require("../../lib");
const timeAndDate_1 = require("../../lib/timeAndDate");
const archive_interface_1 = require("../../types/archive.interface");
const log_interface_1 = require("../../types/log.interface");
const helper_1 = require("../archives/helper");
const helper_2 = require("../logs/helper");
const donation_model_1 = __importDefault(require("./donations/donation.model"));
const sponsor_model_1 = __importDefault(require("./sponsor.model"));
require("../media/files/file.model");
// ==================== SPONSOR CONTROLLERS ====================
// GET /api/sponsors
const getSponsors = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const search = req.query.sponsor_search || "";
        const tier = req.query.tier;
        const category = req.query.category;
        const isActive = req.query.isActive === 'true';
        const regex = new RegExp(search, "i");
        const query = {};
        if (search) {
            query.$or = [
                { "name": regex },
                { "businessName": regex },
                { "businessDescription": regex },
                { "community": regex },
                { "category": regex },
                { "tier": regex },
            ];
        }
        if (tier) {
            query.tier = tier;
        }
        if (category) {
            query.category = category;
        }
        if (req.query.isActive !== undefined) {
            query.isActive = isActive;
        }
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        const sponsors = await sponsor_model_1.default.find(cleaned)
            .populate({ path: "donations", populate: { path: "files" } })
            .populate("logo")
            .populate("badges")
            .limit(limit)
            .skip(skip)
            .lean()
            .sort({ updatedAt: "desc" });
        const total = await sponsor_model_1.default.countDocuments(cleaned);
        res.status(200).json({
            success: true,
            data: sponsors,
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch sponsors"),
        });
    }
};
exports.getSponsors = getSponsors;
// GET /api/sponsors/:id
const getSponsorById = async (req, res) => {
    try {
        const { id } = req.params;
        const sponsor = await sponsor_model_1.default.findById(id)
            .populate({ path: "donations", populate: { path: "files" } })
            .populate("logo")
            .populate("badges")
            .lean();
        if (!sponsor) {
            return res.status(404).json({
                success: false,
                message: "Sponsor not found",
            });
        }
        res.status(200).json({
            success: true,
            data: sponsor,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch sponsor"),
        });
    }
};
exports.getSponsorById = getSponsorById;
// GET /api/sponsors/top
const getTopSponsors = async (req, res) => {
    try {
        const limit = Number.parseInt(req.query.limit || "5", 10);
        const sponsors = await sponsor_model_1.default.find({ isActive: true })
            .populate("logo")
            .sort({ badge: -1, totalDonations: -1 })
            .limit(limit)
            .lean();
        res.status(200).json({
            success: true,
            data: sponsors,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch top sponsors"),
        });
    }
};
exports.getTopSponsors = getTopSponsors;
// POST /api/sponsors
const createSponsor = async (req, res) => {
    try {
        const sponsorData = req.body;
        // Check if sponsor with same business name exists
        const existingSponsor = await sponsor_model_1.default.findOne({
            businessName: sponsorData.businessName
        });
        if (existingSponsor) {
            return res.status(409).json({
                success: false,
                message: "Sponsor with this business name already exists",
            });
        }
        const created = await sponsor_model_1.default.create({
            ...sponsorData,
            createdBy: req.user?.id,
            createdAt: new Date(),
            badge: 0,
            totalDonations: 0,
        });
        if (!created) {
            return res.status(500).json({
                success: false,
                message: "Failed to create sponsor",
            });
        }
        // Log action
        await (0, helper_2.logAction)({
            title: "🤝 Sponsor Created",
            description: `New sponsor ${created.name || created.businessName} added`,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: {
                sponsorId: created._id,
                businessName: created.businessName,
            },
        });
        res.status(201).json({
            message: "Sponsor created successfully",
            success: true,
            data: created,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to create sponsor"),
            success: false,
        });
    }
};
exports.createSponsor = createSponsor;
// PUT /api/sponsors/:id
const updateSponsor = async (req, res) => {
    try {
        const { id } = req.params;
        const sponsorData = req.body;
        // Remove _id from updates
        delete sponsorData._id;
        const updated = await sponsor_model_1.default.findByIdAndUpdate(id, {
            $set: {
                ...sponsorData,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true, runValidators: true });
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Sponsor not found",
            });
        }
        res.status(200).json({
            message: "Sponsor updated successfully",
            success: true,
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to update sponsor"),
            success: false,
        });
    }
};
exports.updateSponsor = updateSponsor;
// PATCH /api/sponsors/:id/toggle-status
const toggleSponsorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const updated = await sponsor_model_1.default.findByIdAndUpdate(id, {
            $set: {
                isActive,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true });
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Sponsor not found",
            });
        }
        res.status(200).json({
            success: true,
            message: `Sponsor ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update sponsor status"),
        });
    }
};
exports.toggleSponsorStatus = toggleSponsorStatus;
// DELETE /api/sponsors/:id
const deleteSponsor = async (req, res) => {
    try {
        const id = req.params.id;
        // Find sponsor first
        const sponsor = await sponsor_model_1.default.findById(id);
        if (!sponsor) {
            return res.status(404).json({
                success: false,
                message: "Sponsor not found",
            });
        }
        // Delete all associated donations
        if (sponsor.donations && sponsor.donations.length > 0) {
            await donation_model_1.default.deleteMany({ _id: { $in: sponsor.donations } });
        }
        // Delete sponsor
        const deleted = await sponsor_model_1.default.findByIdAndDelete(id);
        // Archive the sponsor
        await (0, helper_1.saveToArchive)({
            data: sponsor,
            originalId: id,
            sourceCollection: archive_interface_1.EArchivesCollection.SPONSORS,
            reason: 'Sponsor deleted',
        });
        // Log deletion
        await (0, helper_2.logAction)({
            title: "🤝 Sponsor Deleted",
            description: `Sponsor ${sponsor.name || sponsor.businessName} deleted on ${(0, timeAndDate_1.formatDate)(new Date().toISOString())}`,
            severity: log_interface_1.ELogSeverity.CRITICAL,
            meta: {
                sponsorId: id,
                donationsCount: sponsor.donations?.length || 0,
            },
        });
        res.status(200).json({
            message: "Sponsor deleted successfully",
            success: true,
            data: {
                id: deleted?._id,
                name: sponsor.name,
                businessName: sponsor.businessName,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to delete sponsor"),
            success: false,
        });
    }
};
exports.deleteSponsor = deleteSponsor;
// GET /api/sponsors/stats
const getSponsorStats = async (req, res) => {
    try {
        const stats = await sponsor_model_1.default.aggregate([
            {
                $facet: {
                    totalSponsors: [{ $count: "count" }],
                    byTier: [
                        {
                            $group: {
                                _id: "$tier",
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    byCategory: [
                        {
                            $group: {
                                _id: "$category",
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    activeSponsors: [
                        {
                            $match: { isActive: true }
                        },
                        { $count: "count" }
                    ],
                    totalDonations: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$totalDonations" },
                            },
                        },
                    ],
                },
            },
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalSponsors: stats[0]?.totalSponsors[0]?.count || 0,
                activeSponsors: stats[0]?.activeSponsors[0]?.count || 0,
                byTier: stats[0]?.byTier || [],
                byCategory: stats[0]?.byCategory || [],
                totalDonations: stats[0]?.totalDonations[0]?.total || 0,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch sponsor statistics"),
        });
    }
};
exports.getSponsorStats = getSponsorStats;
