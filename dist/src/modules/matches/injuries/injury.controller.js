"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInjuryStats = exports.deleteInjury = exports.updateInjuryStatus = exports.updateInjury = exports.createInjury = exports.getActiveInjuries = exports.getInjuriesByMatch = exports.getInjuriesByPlayer = exports.getInjuryById = exports.getInjuries = void 0;
const lib_1 = require("../../../lib");
const injury_interface_1 = require("../../../types/injury.interface");
const log_interface_1 = require("../../../types/log.interface");
const helper_1 = require("../../logs/helper");
const player_model_1 = __importDefault(require("../../players/player.model"));
const match_model_1 = __importDefault(require("../match.model"));
const injury_model_1 = __importDefault(require("./injury.model"));
// GET /api/injuries
const getInjuries = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const search = req.query.injury_search || "";
        const matchId = req.query.matchId;
        const playerId = req.query.playerId;
        const severity = req.query.severity;
        const status = req.query.status;
        const regex = new RegExp(search, "i");
        const query = {};
        if (search) {
            query.$or = [
                { "title": regex },
                { "description": regex },
                { "severity": regex },
                { "player.name": regex },
                { "minute": regex },
                { "match.title": regex },
            ];
        }
        if (matchId) {
            query.match = matchId;
        }
        if (playerId) {
            query.player = playerId;
        }
        if (severity) {
            query.severity = severity;
        }
        if (status) {
            query.status = status;
        }
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        const injuries = await injury_model_1.default.find(cleaned)
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition')
            .limit(limit)
            .skip(skip)
            .lean()
            .sort({ createdAt: "desc" });
        const total = await injury_model_1.default.countDocuments(cleaned);
        res.status(200).json({
            success: true,
            data: injuries,
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch injuries"),
        });
    }
};
exports.getInjuries = getInjuries;
// GET /api/injuries/:id
const getInjuryById = async (req, res) => {
    try {
        const { id } = req.params;
        const injury = await injury_model_1.default.findById(id)
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition')
            .lean();
        if (!injury) {
            return res.status(404).json({
                success: false,
                message: "Injury not found",
            });
        }
        res.status(200).json({
            success: true,
            data: injury,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch injury"),
        });
    }
};
exports.getInjuryById = getInjuryById;
// GET /api/injuries/player/:playerId
const getInjuriesByPlayer = async (req, res) => {
    try {
        const { playerId } = req.params;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const injuries = await injury_model_1.default.find({ player: playerId })
            .populate('match', 'title date competition')
            .sort({ createdAt: "desc" })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await injury_model_1.default.countDocuments({ player: playerId });
        res.status(200).json({
            success: true,
            data: injuries,
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch player injuries"),
        });
    }
};
exports.getInjuriesByPlayer = getInjuriesByPlayer;
// GET /api/injuries/match/:matchId
const getInjuriesByMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const injuries = await injury_model_1.default.find({ match: matchId })
            .populate('player', 'name number position avatar')
            .sort({ minute: "asc" })
            .lean();
        res.status(200).json({
            success: true,
            data: injuries,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch match injuries"),
        });
    }
};
exports.getInjuriesByMatch = getInjuriesByMatch;
// GET /api/injuries/active
const getActiveInjuries = async (req, res) => {
    try {
        const injuries = await injury_model_1.default.find({
            status: { $in: ['active', 'recovering'] }
        })
            .populate('player', 'name number position avatar')
            .populate('match', 'title date')
            .sort({ createdAt: "desc" })
            .lean();
        res.status(200).json({
            success: true,
            data: injuries,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch active injuries"),
        });
    }
};
exports.getActiveInjuries = getActiveInjuries;
// POST /api/injuries
const createInjury = async (req, res) => {
    try {
        const { match, minute, player, description, severity, title, status } = req.body;
        // Validate required fields
        if (!match || !player || !minute) {
            return res.status(400).json({
                success: false,
                message: "Match ID, player ID, and minute are required",
            });
        }
        // Create injury record
        const savedInjury = await injury_model_1.default.create({
            minute,
            description,
            severity: severity || 'minor',
            match,
            player,
            title: title || `${player.name} Injury`,
            status: status || 'active',
            createdBy: req.user?.id,
            createdAt: new Date(),
        });
        if (!savedInjury) {
            return res.status(500).json({
                message: "Failed to create injury.",
                success: false
            });
        }
        // Update Player - add injury reference
        await player_model_1.default.findByIdAndUpdate(player?._id || player, { $push: { injuries: savedInjury._id } });
        // Update Match - add injury reference if match exists
        if (match) {
            await match_model_1.default.findByIdAndUpdate(match, { $push: { injuries: savedInjury._id } });
        }
        // Log action
        await (0, helper_1.logAction)({
            title: `🤕 Injury Created - ${title || player.name}`,
            description: description || `${player.name} injured at ${minute}'`,
            severity: (severity === injury_interface_1.EInjurySeverity.MAJOR || severity == injury_interface_1.EInjurySeverity.SEVERE) ? log_interface_1.ELogSeverity.CRITICAL : log_interface_1.ELogSeverity.INFO,
            meta: {
                injuryId: savedInjury._id,
                playerId: player._id || player,
                matchId: match,
                minute,
                severity,
            },
        });
        // Populate for response
        const populatedInjury = await injury_model_1.default.findById(savedInjury._id)
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition')
            .lean();
        res.status(201).json({
            message: "Injury recorded successfully!",
            success: true,
            data: populatedInjury
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to create injury"),
            success: false,
        });
    }
};
exports.createInjury = createInjury;
// PUT /api/injuries/:id
const updateInjury = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Remove _id from updates
        delete updates._id;
        const updatedInjury = await injury_model_1.default.findByIdAndUpdate(id, {
            $set: {
                ...updates,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true, runValidators: true })
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition');
        if (!updatedInjury) {
            return res.status(404).json({
                success: false,
                message: "Injury not found",
            });
        }
        // Log update
        await (0, helper_1.logAction)({
            title: `Injury Updated - ${updatedInjury.title}`,
            description: `Injury record updated`,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: {
                injuryId: id,
                updates: Object.keys(updates),
            },
        });
        res.status(200).json({
            success: true,
            message: "Injury updated successfully",
            data: updatedInjury,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update injury"),
        });
    }
};
exports.updateInjury = updateInjury;
// PATCH /api/injuries/:id/status
const updateInjuryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['active', 'recovering', 'recovered', 'season_ending'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value",
            });
        }
        const updatedInjury = await injury_model_1.default.findByIdAndUpdate(id, {
            $set: {
                status,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
                recoveredAt: status === 'recovered' ? new Date() : undefined,
            },
        }, { new: true }).populate('player', 'name number position avatar');
        if (!updatedInjury) {
            return res.status(404).json({
                success: false,
                message: "Injury not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Injury status updated",
            data: updatedInjury,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update injury status"),
        });
    }
};
exports.updateInjuryStatus = updateInjuryStatus;
// DELETE /api/injuries/:id
const deleteInjury = async (req, res) => {
    try {
        const { id } = req.params;
        // Find injury first to get details
        const injuryToDelete = await injury_model_1.default.findById(id);
        if (!injuryToDelete) {
            return res.status(404).json({
                success: false,
                message: "Injury not found",
            });
        }
        // Delete the injury
        const deletedInjury = await injury_model_1.default.findByIdAndDelete(id);
        // Update Player - remove injury reference
        await player_model_1.default.findByIdAndUpdate(injuryToDelete.player, { $pull: { injuries: id } });
        // Update Match - remove injury reference
        if (injuryToDelete.match) {
            await match_model_1.default.findByIdAndUpdate(injuryToDelete.match, { $pull: { injuries: id } });
        }
        // Log deletion
        await (0, helper_1.logAction)({
            title: `Injury Deleted - ${injuryToDelete.title}`,
            description: `Injury record deleted`,
            severity: log_interface_1.ELogSeverity.CRITICAL,
            meta: {
                injuryId: id,
                playerId: injuryToDelete.player,
            },
        });
        res.status(200).json({
            success: true,
            message: "Injury deleted successfully",
            data: deletedInjury,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to delete injury"),
        });
    }
};
exports.deleteInjury = deleteInjury;
// GET /api/injuries/stats
const getInjuryStats = async (req, res) => {
    try {
        const stats = await injury_model_1.default.aggregate([
            {
                $facet: {
                    totalInjuries: [{ $count: "count" }],
                    bySeverity: [
                        {
                            $group: {
                                _id: "$severity",
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    byStatus: [
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    byMinute: [
                        {
                            $bucket: {
                                groupBy: "$minute",
                                boundaries: [0, 15, 30, 45, 60, 75, 90],
                                default: "Other",
                                output: {
                                    count: { $sum: 1 },
                                },
                            },
                        },
                    ],
                    mostInjuredPlayers: [
                        {
                            $group: {
                                _id: "$player",
                                count: { $sum: 1 },
                            },
                        },
                        {
                            $sort: { count: -1 }
                        },
                        {
                            $limit: 10
                        },
                        {
                            $lookup: {
                                from: "players",
                                localField: "_id",
                                foreignField: "_id",
                                as: "playerDetails",
                            },
                        },
                        {
                            $project: {
                                playerId: "$_id",
                                count: 1,
                                playerName: { $arrayElemAt: ["$playerDetails.name", 0] },
                                playerNumber: { $arrayElemAt: ["$playerDetails.number", 0] },
                                _id: 0,
                            },
                        },
                    ],
                },
            },
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalInjuries: stats[0]?.totalInjuries[0]?.count || 0,
                bySeverity: stats[0]?.bySeverity || [],
                byStatus: stats[0]?.byStatus || [],
                byMinute: stats[0]?.byMinute || [],
                mostInjuredPlayers: stats[0]?.mostInjuredPlayers || [],
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch injury statistics"),
        });
    }
};
exports.getInjuryStats = getInjuryStats;
