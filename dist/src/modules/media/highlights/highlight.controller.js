"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementHighlightView = exports.getHighlightStats = exports.deleteHighlight = exports.patchHighlight = exports.updateHighlight = exports.createHighlight = exports.getHighlightsByMatch = exports.getHighlightById = exports.getHighlights = void 0;
const lib_1 = require("../../../lib");
const timeAndDate_1 = require("../../../lib/timeAndDate");
const helper_1 = require("../../logs/helper");
const highlight_model_1 = __importDefault(require("./highlight.model"));
// GET /api/highlights
const getHighlights = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const search = req.query.highlight_search || "";
        const tagsParam = req.query.tags || "";
        const matchId = req.query.matchId;
        const status = req.query.status;
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        const tags = tagsParam
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        const skip = (page - 1) * limit;
        const regex = new RegExp(search, "i");
        // Build Query Object
        const query = {};
        if (tags.length > 0) {
            query.tags = { $in: tags };
        }
        if (matchId) {
            query.match = matchId;
        }
        if (status) {
            query.status = status;
        }
        // Date range filter
        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) {
                query.createdAt.$gte = new Date(fromDate);
            }
            if (toDate) {
                query.createdAt.$lte = new Date(toDate);
            }
        }
        if (search) {
            query.$or = [
                { title: regex },
                { description: regex },
                { tags: regex },
            ];
        }
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        // Apply filters here
        const highlights = await highlight_model_1.default.find(cleaned)
            .populate('match', 'homeTeam awayTeam date competition') // Populate match details
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await highlight_model_1.default.countDocuments(cleaned);
        res.status(200).json({
            success: true,
            data: highlights,
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch highlights"),
        });
    }
};
exports.getHighlights = getHighlights;
// GET /api/highlights/:id
const getHighlightById = async (req, res) => {
    try {
        const { highlightId } = req.params;
        const highlight = await highlight_model_1.default.findById(highlightId)
            .populate('match')
            .lean();
        if (!highlight) {
            return res.status(404).json({
                success: false,
                message: "Highlight not found",
            });
        }
        res.status(200).json({
            success: true,
            data: highlight,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch highlight"),
        });
    }
};
exports.getHighlightById = getHighlightById;
// GET /api/highlights/match/:matchId
const getHighlightsByMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const highlights = await highlight_model_1.default.find({ match: matchId })
            .populate('match')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await highlight_model_1.default.countDocuments({ match: matchId });
        res.status(200).json({
            success: true,
            data: highlights,
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch match highlights"),
        });
    }
};
exports.getHighlightsByMatch = getHighlightsByMatch;
// POST /api/highlights
const createHighlight = async (req, res) => {
    try {
        const { match, ...others } = req.body;
        // Validate required fields
        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Match ID is required",
            });
        }
        if (!others.title) {
            return res.status(400).json({
                success: false,
                message: "Highlight title is required",
            });
        }
        // Create highlight
        const savedHighlight = await highlight_model_1.default.create({
            match,
            ...others,
            createdBy: req.user?.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        // Populate match details for response
        const populatedHighlight = await highlight_model_1.default.findById(savedHighlight._id)
            .populate('match')
            .lean();
        // Log action
        await (0, helper_1.logAction)({
            title: `Match highlight created - [${others?.title || ''}]`,
            description: `A match highlight (${others?.title}) created on ${(0, timeAndDate_1.formatDate)(new Date().toISOString()) ?? ''}.`,
            meta: {
                highlightId: savedHighlight._id,
                matchId: match,
                title: others.title,
            },
        });
        res.status(201).json({
            message: "Highlight created successfully",
            success: true,
            data: populatedHighlight,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to save highlight"),
            success: false,
        });
    }
};
exports.createHighlight = createHighlight;
// PUT /api/highlights/:id
const updateHighlight = async (req, res) => {
    try {
        const { highlightId } = req.params;
        const updates = req.body;
        const existingHighlight = await highlight_model_1.default.findById(highlightId);
        if (!existingHighlight) {
            return res.status(404).json({
                success: false,
                message: "Highlight not found",
            });
        }
        const updatedHighlight = await highlight_model_1.default.findByIdAndUpdate(highlightId, {
            $set: {
                ...updates,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true, runValidators: true }).populate('match');
        // Log action
        await (0, helper_1.logAction)({
            title: `Highlight updated - [${updates.title || existingHighlight.title}]`,
            description: `Highlight was updated`,
            meta: {
                highlightId,
                changes: Object.keys(updates),
            },
        });
        res.status(200).json({
            message: "Highlight updated successfully",
            success: true,
            data: updatedHighlight,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to update highlight"),
            success: false,
        });
    }
};
exports.updateHighlight = updateHighlight;
// PATCH /api/highlights/:id (partial updates)
const patchHighlight = async (req, res) => {
    try {
        const { highlightId } = req.params;
        const updates = req.body;
        // Remove undefined fields
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined || updates[key] === null) {
                delete updates[key];
            }
        });
        const updatedHighlight = await highlight_model_1.default.findByIdAndUpdate(highlightId, {
            $set: {
                ...updates,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true, runValidators: true }).populate('match');
        if (!updatedHighlight) {
            return res.status(404).json({
                success: false,
                message: "Highlight not found",
            });
        }
        res.status(200).json({
            message: "Highlight updated successfully",
            success: true,
            data: updatedHighlight,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to update highlight"),
            success: false,
        });
    }
};
exports.patchHighlight = patchHighlight;
// DELETE /api/highlights/:id
const deleteHighlight = async (req, res) => {
    try {
        const { highlightId } = req.params;
        const deletedHighlight = await highlight_model_1.default.findByIdAndDelete(highlightId);
        if (!deletedHighlight) {
            return res.status(404).json({
                success: false,
                message: "Highlight not found",
            });
        }
        // Log action
        await (0, helper_1.logAction)({
            title: `Highlight deleted - [${deletedHighlight.title}]`,
            description: `Highlight was deleted`,
            meta: {
                highlightId,
                matchId: deletedHighlight.match,
                title: deletedHighlight.title,
            },
        });
        res.status(200).json({
            message: "Highlight deleted successfully",
            success: true,
            data: deletedHighlight,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to delete highlight"),
            success: false,
        });
    }
};
exports.deleteHighlight = deleteHighlight;
// GET /api/highlights/stats
const getHighlightStats = async (req, res) => {
    try {
        const stats = await highlight_model_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalHighlights: { $sum: 1 },
                    avgViews: { $avg: "$views" },
                    totalViews: { $sum: "$views" },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalHighlights: 1,
                    avgViews: { $round: ["$avgViews", 0] },
                    totalViews: 1,
                },
            },
        ]);
        // Get tag distribution
        const tagStats = await highlight_model_1.default.aggregate([
            { $unwind: "$tags" },
            {
                $group: {
                    _id: "$tags",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
            {
                $limit: 20,
            },
            {
                $project: {
                    tag: "$_id",
                    count: 1,
                    _id: 0,
                },
            },
        ]);
        // Get highlights by match (top 10 matches with most highlights)
        const matchStats = await highlight_model_1.default.aggregate([
            {
                $group: {
                    _id: "$match",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
            {
                $limit: 10,
            },
            {
                $lookup: {
                    from: "matches",
                    localField: "_id",
                    foreignField: "_id",
                    as: "matchDetails",
                },
            },
            {
                $project: {
                    matchId: "$_id",
                    count: 1,
                    matchDetails: { $arrayElemAt: ["$matchDetails", 0] },
                    _id: 0,
                },
            },
        ]);
        res.status(200).json({
            success: true,
            data: {
                summary: stats[0] || { totalHighlights: 0, avgViews: 0, totalViews: 0 },
                topTags: tagStats,
                topMatches: matchStats,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch highlight statistics"),
        });
    }
};
exports.getHighlightStats = getHighlightStats;
// POST /api/highlights/:id/view (increment view count)
const incrementHighlightView = async (req, res) => {
    try {
        const { highlightId } = req.params;
        const updated = await highlight_model_1.default.findByIdAndUpdate(highlightId, { $inc: { views: 1 } }, { new: true });
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Highlight not found",
            });
        }
        res.status(200).json({
            success: true,
            data: { views: updated.views },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update view count"),
        });
    }
};
exports.incrementHighlightView = incrementHighlightView;
