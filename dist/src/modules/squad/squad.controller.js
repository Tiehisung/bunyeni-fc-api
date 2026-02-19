"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSquadStats = exports.deleteSquad = exports.updateFormation = exports.addSubstitution = exports.updateSquadPlayers = exports.updateSquad = exports.createSquad = exports.getSquadByMatch = exports.getSquadById = exports.getSquads = void 0;
const lib_1 = require("../../lib");
const timeAndDate_1 = require("../../lib/timeAndDate");
const archive_interface_1 = require("../../types/archive.interface");
const log_interface_1 = require("../../types/log.interface");
const helper_1 = require("../archives/helper");
const helper_2 = require("../logs/helper");
const match_model_1 = __importDefault(require("../matches/match.model"));
const player_model_1 = __importDefault(require("../players/player.model"));
const squad_model_1 = __importDefault(require("./squad.model"));
// GET /api/squads
const getSquads = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const search = req.query.squad_search || "";
        const matchId = req.query.matchId;
        const season = req.query.season;
        const regex = new RegExp(search, "i");
        const query = {};
        if (search) {
            query.$or = [
                { "title": regex },
                { "description": regex },
                { "coach.name": regex },
                { "assistant.name": regex },
                { "match.title": regex },
            ];
        }
        if (matchId) {
            query.match = matchId;
        }
        if (season) {
            query.season = season;
        }
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        const squads = await squad_model_1.default.find(cleaned)
            .populate('match', 'title date competition opponent')
            .populate('players.player', 'name number position avatar')
            .populate('coach.id', 'name email avatar')
            .populate('assistant.id', 'name email avatar')
            .populate('substitutions.playerIn', 'name number position')
            .populate('substitutions.playerOut', 'name number position')
            .limit(limit)
            .skip(skip)
            .lean()
            .sort({ createdAt: "desc" });
        const total = await squad_model_1.default.countDocuments(cleaned);
        res.status(200).json({
            success: true,
            data: squads,
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch squads"),
        });
    }
};
exports.getSquads = getSquads;
// GET /api/squads/:id
const getSquadById = async (req, res) => {
    try {
        const { id } = req.params;
        const squad = await squad_model_1.default.findById(id)
            .populate('match', 'title date competition opponent')
            .populate('players.player', 'name number position avatar stats')
            .populate('coach.id', 'name email avatar')
            .populate('assistant.id', 'name email avatar')
            .populate('substitutions.playerIn', 'name number position')
            .populate('substitutions.playerOut', 'name number position')
            .lean();
        if (!squad) {
            return res.status(404).json({
                success: false,
                message: "Squad not found",
            });
        }
        res.status(200).json({
            success: true,
            data: squad,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch squad"),
        });
    }
};
exports.getSquadById = getSquadById;
// GET /api/squads/match/:matchId
const getSquadByMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const squad = await squad_model_1.default.findOne({ match: matchId })
            .populate('players.player', 'name number position avatar')
            .populate('coach.id', 'name email avatar')
            .populate('assistant.id', 'name email avatar')
            .populate('substitutions.playerIn', 'name number position')
            .populate('substitutions.playerOut', 'name number position')
            .lean();
        if (!squad) {
            return res.status(404).json({
                success: false,
                message: "Squad not found for this match",
            });
        }
        res.status(200).json({
            success: true,
            data: squad,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch match squad"),
        });
    }
};
exports.getSquadByMatch = getSquadByMatch;
// POST /api/squads
const createSquad = async (req, res) => {
    try {
        const { match, players, assistant, coach, description, formation, } = req.body;
        // Validate required fields
        if (!match || !players || !players.length) {
            return res.status(400).json({
                success: false,
                message: "Match ID and players are required",
            });
        }
        // Check if squad already exists for this match
        const existingSquad = await squad_model_1.default.findOne({ match: match._id || match });
        if (existingSquad) {
            return res.status(409).json({
                success: false,
                message: "Squad already exists for this match",
            });
        }
        // Get match details
        const matchDetails = await match_model_1.default.findById(match._id || match);
        if (!matchDetails) {
            return res.status(404).json({
                success: false,
                message: "Match not found",
            });
        }
        // Create squad
        const savedSquad = await squad_model_1.default.create({
            players,
            assistant,
            coach,
            description,
            formation: formation || '4-4-2',
            title: matchDetails.title,
            match: match._id || match,
            season: matchDetails.season,
            createdBy: req.user?.id,
            createdAt: new Date(),
        });
        if (!savedSquad) {
            return res.status(500).json({
                message: "Failed to create squad.",
                success: false
            });
        }
        // Update Match with squad reference
        await match_model_1.default.findByIdAndUpdate(match._id || match, { $set: { squad: savedSquad._id } });
        // Update player statistics (optional - track squad appearances)
        for (const player of players) {
            await player_model_1.default.findByIdAndUpdate(player._id, { $inc: { 'stats.squadAppearances': 1 } });
        }
        // Log action
        await (0, helper_2.logAction)({
            title: "📋 Squad Created",
            description: description || `Squad for ${matchDetails.title} on ${(0, timeAndDate_1.formatDate)(matchDetails.date)}`,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: {
                squadId: savedSquad._id,
                matchId: match._id || match,
                playerCount: players.length,
            },
        });
        // Populate for response
        const populatedSquad = await squad_model_1.default.findById(savedSquad._id)
            .populate('match', 'title date competition opponent')
            .populate('players.player', 'name number position avatar')
            .populate('coach.id', 'name email avatar')
            .populate('assistant.id', 'name email avatar')
            .lean();
        res.status(201).json({
            message: "Squad created successfully!",
            success: true,
            data: populatedSquad
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to create squad"),
            success: false,
        });
    }
};
exports.createSquad = createSquad;
// PUT /api/squads/:id
const updateSquad = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Remove _id from updates
        delete updates._id;
        const updated = await squad_model_1.default.findByIdAndUpdate(id, {
            $set: {
                ...updates,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true, runValidators: true })
            .populate('match', 'title date competition opponent')
            .populate('players.player', 'name number position avatar')
            .populate('coach.id', 'name email avatar')
            .populate('assistant.id', 'name email avatar');
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Squad not found",
            });
        }
        // Log update
        await (0, helper_2.logAction)({
            title: "📋 Squad Updated",
            description: `Squad for ${updated.title} updated`,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: {
                squadId: id,
                updates: Object.keys(updates),
            },
        });
        res.status(200).json({
            success: true,
            message: "Squad updated successfully",
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update squad"),
        });
    }
};
exports.updateSquad = updateSquad;
// PATCH /api/squads/:id/players (add or update players)
const updateSquadPlayers = async (req, res) => {
    try {
        const { id } = req.params;
        const { players } = req.body;
        if (!players || !Array.isArray(players)) {
            return res.status(400).json({
                success: false,
                message: "Players array is required",
            });
        }
        const updated = await squad_model_1.default.findByIdAndUpdate(id, {
            $set: {
                players,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true }).populate('players.player', 'name number position avatar');
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Squad not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Squad players updated",
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update squad players"),
        });
    }
};
exports.updateSquadPlayers = updateSquadPlayers;
// PATCH /api/squads/:id/substitutions (add substitution)
const addSubstitution = async (req, res) => {
    try {
        const { id } = req.params;
        const { minute, playerIn, playerOut, reason } = req.body;
        if (!minute || !playerIn || !playerOut) {
            return res.status(400).json({
                success: false,
                message: "Minute, playerIn, and playerOut are required",
            });
        }
        const updated = await squad_model_1.default.findByIdAndUpdate(id, {
            $push: {
                substitutions: {
                    minute,
                    playerIn,
                    playerOut,
                    reason: reason || 'Tactical',
                    timestamp: new Date(),
                },
            },
            $set: {
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true })
            .populate('substitutions.playerIn', 'name number position')
            .populate('substitutions.playerOut', 'name number position');
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Squad not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Substitution added",
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to add substitution"),
        });
    }
};
exports.addSubstitution = addSubstitution;
// PATCH /api/squads/:id/formation
const updateFormation = async (req, res) => {
    try {
        const { id } = req.params;
        const { formation, tactics } = req.body;
        const updated = await squad_model_1.default.findByIdAndUpdate(id, {
            $set: {
                formation,
                tactics,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true });
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Squad not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Formation updated",
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update formation"),
        });
    }
};
exports.updateFormation = updateFormation;
// DELETE /api/squads/:id
const deleteSquad = async (req, res) => {
    try {
        const { id } = req.params;
        // Find squad first
        const squad = await squad_model_1.default.findById(id);
        if (!squad) {
            return res.status(404).json({
                success: false,
                message: "Squad not found",
            });
        }
        // Delete squad
        const deleted = await squad_model_1.default.findByIdAndDelete(id);
        // Remove squad reference from match
        if (squad.match) {
            await match_model_1.default.findByIdAndUpdate(squad.match, { $unset: { squad: "" } });
        }
        // Archive the squad
        await (0, helper_1.saveToArchive)({
            data: squad,
            originalId: id + '',
            sourceCollection: archive_interface_1.EArchivesCollection.SQUADS,
            reason: 'Squad deleted',
        });
        // Log deletion
        await (0, helper_2.logAction)({
            title: "📋 Squad Deleted",
            description: `Squad for ${squad.title} deleted on ${(0, timeAndDate_1.formatDate)(new Date().toISOString())}`,
            severity: log_interface_1.ELogSeverity.CRITICAL,
            meta: {
                squadId: id,
                matchId: squad.match,
                playerCount: squad.players?.length,
            },
        });
        res.status(200).json({
            success: true,
            message: "Squad deleted successfully",
            data: {
                id: deleted?._id,
                title: squad.title,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to delete squad"),
        });
    }
};
exports.deleteSquad = deleteSquad;
// GET /api/squads/stats
const getSquadStats = async (req, res) => {
    try {
        const stats = await squad_model_1.default.aggregate([
            {
                $facet: {
                    totalSquads: [{ $count: "count" }],
                    byFormation: [
                        {
                            $group: {
                                _id: "$formation",
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { count: -1 } },
                    ],
                    averageSquadSize: [
                        {
                            $group: {
                                _id: null,
                                avgSize: { $avg: { $size: "$players" } },
                            },
                        },
                    ],
                    mostUsedPlayers: [
                        { $unwind: "$players" },
                        {
                            $group: {
                                _id: "$players.player",
                                appearances: { $sum: 1 },
                            },
                        },
                        { $sort: { appearances: -1 } },
                        { $limit: 10 },
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
                                appearances: 1,
                                playerName: { $arrayElemAt: ["$playerDetails.name", 0] },
                                playerNumber: { $arrayElemAt: ["$playerDetails.number", 0] },
                                playerPosition: { $arrayElemAt: ["$playerDetails.position", 0] },
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
                totalSquads: stats[0]?.totalSquads[0]?.count || 0,
                byFormation: stats[0]?.byFormation || [],
                averageSquadSize: Math.round(stats[0]?.averageSquadSize[0]?.avgSize || 0),
                mostUsedPlayers: stats[0]?.mostUsedPlayers || [],
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch squad statistics"),
        });
    }
};
exports.getSquadStats = getSquadStats;
