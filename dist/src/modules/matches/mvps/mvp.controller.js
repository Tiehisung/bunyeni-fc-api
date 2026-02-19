"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferMvp = exports.deleteMvpById = exports.patchMvpById = exports.updateMvpById = exports.getMvpById = exports.getMvpLeaderboard = exports.deleteMvp = exports.updateMvp = exports.createMvp = exports.getMvpStats = exports.getMvpByMatch = exports.getMvpsByPlayer = exports.getMvps = void 0;
const lib_1 = require("../../../lib");
const log_interface_1 = require("../../../types/log.interface");
const helper_1 = require("../../logs/helper");
const player_model_1 = __importDefault(require("../../players/player.model"));
const match_model_1 = __importDefault(require("../match.model"));
const mpv_model_1 = __importDefault(require("./mpv.model"));
const helpers_1 = require("../helpers");
// GET /api/mvps
const getMvps = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "30", 10);
        const skip = (page - 1) * limit;
        const search = req.query.mvp_search || "";
        const playerId = req.query.playerId;
        const matchId = req.query.matchId;
        const season = req.query.season;
        const regex = new RegExp(search, "i");
        const query = {};
        if (search) {
            query.$or = [
                { "player.name": regex },
                { "match.title": regex },
                { "description": regex },
                { "positionPlayed": regex },
            ];
        }
        if (playerId) {
            query.player = playerId;
        }
        if (matchId) {
            query.match = matchId;
        }
        if (season) {
            query.season = season;
        }
        const mvps = await mpv_model_1.default.find(query)
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent')
            .limit(limit)
            .skip(skip)
            .lean()
            .sort({ createdAt: "desc" });
        const total = await mpv_model_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            data: mvps,
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch MVPs"),
        });
    }
};
exports.getMvps = getMvps;
// GET /api/mvps/:id
// GET /api/mvps/player/:playerId
const getMvpsByPlayer = async (req, res) => {
    try {
        const { playerId } = req.params;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const mvps = await mpv_model_1.default.find({ player: playerId })
            .populate('match', 'title date competition opponent')
            .sort({ createdAt: "desc" })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await mpv_model_1.default.countDocuments({ player: playerId });
        res.status(200).json({
            success: true,
            data: mvps,
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch player MVPs"),
        });
    }
};
exports.getMvpsByPlayer = getMvpsByPlayer;
// GET /api/mvps/match/:matchId
const getMvpByMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const mvp = await mpv_model_1.default.findOne({ match: matchId })
            .populate('player', 'name number position avatar')
            .lean();
        res.status(200).json({
            success: true,
            data: mvp || null,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch match MVP"),
        });
    }
};
exports.getMvpByMatch = getMvpByMatch;
// GET /api/mvps/stats
const getMvpStats = async (req, res) => {
    try {
        const stats = await mpv_model_1.default.aggregate([
            {
                $facet: {
                    totalMvps: [{ $count: "count" }],
                    byPosition: [
                        {
                            $group: {
                                _id: "$positionPlayed",
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { count: -1 } },
                    ],
                    topPlayers: [
                        {
                            $group: {
                                _id: "$player",
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { count: -1 } },
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
                                count: 1,
                                playerName: { $arrayElemAt: ["$playerDetails.name", 0] },
                                playerNumber: { $arrayElemAt: ["$playerDetails.number", 0] },
                                playerPosition: { $arrayElemAt: ["$playerDetails.position", 0] },
                                _id: 0,
                            },
                        },
                    ],
                    bySeason: [
                        {
                            $group: {
                                _id: "$season",
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { "_id": -1 } },
                    ],
                },
            },
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalMvps: stats[0]?.totalMvps[0]?.count || 0,
                byPosition: stats[0]?.byPosition || [],
                topPlayers: stats[0]?.topPlayers || [],
                bySeason: stats[0]?.bySeason || [],
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch MVP statistics"),
        });
    }
};
exports.getMvpStats = getMvpStats;
// POST /api/mvps
const createMvp = async (req, res) => {
    try {
        const { match, player, description, positionPlayed, season } = req.body;
        // Validate required fields
        if (!match || !player) {
            return res.status(400).json({
                success: false,
                message: "Match ID and player ID are required",
            });
        }
        // Check if match already has an MVP
        const existingMatch = await match_model_1.default.findById(match).populate('mvp');
        if (existingMatch?.mvp) {
            return res.status(409).json({
                message: "Match already assigned Man of the Match.",
                success: false
            });
        }
        // Create MVP record
        const savedMVP = await mpv_model_1.default.create({
            match,
            player,
            description,
            positionPlayed,
            season: season || existingMatch?.season,
            createdBy: req.user?.id,
            createdAt: new Date(),
        });
        if (!savedMVP) {
            return res.status(500).json({
                message: "Failed to create MVP.",
                success: false
            });
        }
        // Update Match - add MVP reference
        await match_model_1.default.findByIdAndUpdate(match, {
            $set: { mvp: savedMVP._id },
            $push: { mvps: savedMVP._id }
        });
        // Update Player - add MVP reference
        const playerId = typeof player === 'object' ? player._id : player;
        await player_model_1.default.findByIdAndUpdate(playerId, { $push: { mvps: savedMVP._id } });
        // Update match events
        await (0, helpers_1.updateMatchEvent)(match?.toString(), {
            type: 'general',
            minute: 'FT',
            title: `🏆 ${typeof player === 'object' ? player.name : 'Player'} awarded Man of the Match`,
            description: description || `Outstanding performance${positionPlayed ? ` playing as ${positionPlayed}` : ''}`,
            timestamp: new Date(),
        });
        // Log action
        await (0, helper_1.logAction)({
            title: "🏆 MVP Awarded",
            description: `${typeof player === 'object' ? player.name : 'Player'} declared Man of the Match. ${description || ''}`,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: {
                mvpId: savedMVP._id,
                matchId: match,
                playerId: playerId,
            },
        });
        // Populate for response
        const populatedMVP = await mpv_model_1.default.findById(savedMVP._id)
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent')
            .lean();
        res.status(201).json({
            message: "Man of the Match awarded successfully!",
            success: true,
            data: populatedMVP
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to create MVP"),
            success: false,
        });
    }
};
exports.createMvp = createMvp;
// PUT /api/mvps/:id
const updateMvp = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Remove _id from updates
        delete updates._id;
        const updatedMVP = await mpv_model_1.default.findByIdAndUpdate(id, {
            $set: {
                ...updates,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true, runValidators: true })
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent');
        if (!updatedMVP) {
            return res.status(404).json({
                success: false,
                message: "MVP not found",
            });
        }
        // Log update
        await (0, helper_1.logAction)({
            title: "MVP Record Updated",
            description: `MVP record updated for ${updatedMVP.player?.name}`,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: {
                mvpId: id,
                updates: Object.keys(updates),
            },
        });
        res.status(200).json({
            success: true,
            message: "MVP updated successfully",
            data: updatedMVP,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update MVP"),
        });
    }
};
exports.updateMvp = updateMvp;
// DELETE /api/mvps/:id
const deleteMvp = async (req, res) => {
    try {
        const { id } = req.params;
        // Find MVP first to get details
        const mvpToDelete = await mpv_model_1.default.findById(id);
        if (!mvpToDelete) {
            return res.status(404).json({
                success: false,
                message: "MVP not found",
            });
        }
        // Delete the MVP
        const deletedMVP = await mpv_model_1.default.findByIdAndDelete(id);
        // Update Match - remove MVP reference
        await match_model_1.default.findByIdAndUpdate(mvpToDelete.match, {
            $unset: { mvp: "" },
            $pull: { mvps: id }
        });
        // Update Player - remove MVP reference
        await player_model_1.default.findByIdAndUpdate(mvpToDelete.player, { $pull: { mvps: id } });
        // Log deletion
        await (0, helper_1.logAction)({
            title: "MVP Award Deleted",
            description: `MVP award for ${mvpToDelete.player?.name} deleted`,
            severity: log_interface_1.ELogSeverity.CRITICAL,
            meta: {
                mvpId: id,
                matchId: mvpToDelete.match,
                playerId: mvpToDelete.player,
            },
        });
        res.status(200).json({
            success: true,
            message: "MVP deleted successfully",
            data: deletedMVP,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to delete MVP"),
        });
    }
};
exports.deleteMvp = deleteMvp;
// GET /api/mvps/leaderboard
const getMvpLeaderboard = async (req, res) => {
    try {
        const limit = Number.parseInt(req.query.limit || "20", 10);
        const season = req.query.season;
        const matchFilter = {};
        if (season) {
            matchFilter.season = season;
        }
        const leaderboard = await mpv_model_1.default.aggregate([
            {
                $lookup: {
                    from: "matches",
                    localField: "match",
                    foreignField: "_id",
                    as: "matchDetails",
                },
            },
            {
                $match: season ? { "matchDetails.season": season } : {},
            },
            {
                $group: {
                    _id: "$player",
                    count: { $sum: 1 },
                    recentAwards: { $push: { match: "$match", date: "$createdAt" } },
                },
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: limit
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
                    awardCount: "$count",
                    playerName: { $arrayElemAt: ["$playerDetails.name", 0] },
                    playerNumber: { $arrayElemAt: ["$playerDetails.number", 0] },
                    playerPosition: { $arrayElemAt: ["$playerDetails.position", 0] },
                    playerAvatar: { $arrayElemAt: ["$playerDetails.avatar", 0] },
                    recentAwards: { $slice: ["$recentAwards", 5] },
                    _id: 0,
                },
            },
        ]);
        res.status(200).json({
            success: true,
            data: leaderboard,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch MVP leaderboard"),
        });
    }
};
exports.getMvpLeaderboard = getMvpLeaderboard;
// controllers/mvp.controller.ts (Add these to your existing MVP controller)
// GET /api/mvps/:id
const getMvpById = async (req, res) => {
    try {
        const { id } = req.params;
        const mvp = await mpv_model_1.default.findById(id)
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent')
            .lean();
        if (!mvp) {
            return res.status(404).json({
                success: false,
                message: "MVP not found",
            });
        }
        res.status(200).json({
            success: true,
            data: mvp,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch MVP"),
        });
    }
};
exports.getMvpById = getMvpById;
// PUT /api/mvps/:id
const updateMvpById = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        // Find current MVP data
        const previousMvpData = await mpv_model_1.default.findById(id)
            .populate('player')
            .populate('match');
        if (!previousMvpData) {
            return res.status(404).json({
                success: false,
                message: "MVP not found",
            });
        }
        // Remove from previous player's mvps array if player changed
        if (body.player &&
            previousMvpData.player &&
            previousMvpData.player._id.toString() !==
                (typeof body.player === 'object' ? body.player._id : body.player)) {
            await player_model_1.default.findByIdAndUpdate(previousMvpData.player._id, { $pull: { mvps: id } });
        }
        // Update MVP record
        const updated = await mpv_model_1.default.findByIdAndUpdate(id, {
            $set: {
                ...body,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true, runValidators: true }).populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent');
        if (!updated) {
            return res.status(500).json({
                message: "Update failed",
                success: false
            });
        }
        // Update player's mvps array if new player
        if (body.player &&
            previousMvpData.player &&
            previousMvpData.player._id.toString() !==
                (typeof body.player === 'object' ? body.player._id : body.player)) {
            await player_model_1.default.findByIdAndUpdate(typeof body.player === 'object' ? body.player._id : body.player, { $push: { mvps: id } });
        }
        // Update match MVP reference
        const matchId = body.match?._id || updated.match?._id;
        if (matchId) {
            await match_model_1.default.findByIdAndUpdate(matchId, { $set: { mvp: updated._id } });
        }
        // Log action
        await (0, helper_1.logAction)({
            title: "🏆 MVP Updated",
            description: `MVP record updated for ${updated.player?.name || 'player'}`,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: {
                mvpId: id,
                updates: Object.keys(body),
            },
        });
        res.status(200).json({
            message: "MVP updated successfully",
            success: true,
            data: updated
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Update failed"),
            success: false
        });
    }
};
exports.updateMvpById = updateMvpById;
// PATCH /api/mvps/:id (partial updates)
const patchMvpById = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Remove undefined fields
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined || updates[key] === null) {
                delete updates[key];
            }
        });
        // Remove _id from updates
        delete updates._id;
        const updated = await mpv_model_1.default.findByIdAndUpdate(id, {
            $set: {
                ...updates,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true, runValidators: true }).populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent');
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "MVP not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "MVP updated successfully",
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update MVP"),
        });
    }
};
exports.patchMvpById = patchMvpById;
// DELETE /api/mvps/:id
const deleteMvpById = async (req, res) => {
    try {
        const { id } = req.params;
        // Find and delete MVP
        const deleted = await mpv_model_1.default.findByIdAndDelete(id)
            .populate('player')
            .populate('match');
        if (!deleted) {
            return res.status(404).json({
                message: "MVP not found",
                success: false
            });
        }
        // Remove from player's mvps array
        if (deleted.player) {
            await player_model_1.default.findByIdAndUpdate(deleted.player._id, { $pull: { mvps: id } });
        }
        // Remove from match's MVP reference
        if (deleted.match) {
            await match_model_1.default.findByIdAndUpdate(deleted.match._id, { $set: { mvp: null } });
        }
        // Log deletion
        await (0, helper_1.logAction)({
            title: "🏆 MVP Deleted",
            description: `MVP award for ${deleted.player?.name || 'player'} deleted`,
            severity: log_interface_1.ELogSeverity.CRITICAL,
            meta: {
                mvpId: id,
                matchId: deleted.match?._id,
                playerId: deleted.player?._id,
            },
        });
        res.status(200).json({
            message: "MVP deleted successfully",
            success: true,
            data: {
                id: deleted._id,
                player: deleted.player,
                match: deleted.match,
            }
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Delete failed"),
            success: false
        });
    }
};
exports.deleteMvpById = deleteMvpById;
// POST /api/mvps/:id/transfer (transfer MVP to different player)
const transferMvp = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPlayerId, reason } = req.body;
        if (!newPlayerId) {
            return res.status(400).json({
                success: false,
                message: "New player ID is required",
            });
        }
        // Find current MVP
        const currentMvp = await mpv_model_1.default.findById(id)
            .populate('player')
            .populate('match');
        if (!currentMvp) {
            return res.status(404).json({
                success: false,
                message: "MVP not found",
            });
        }
        const oldPlayerId = currentMvp.player?._id;
        // Remove from old player
        if (oldPlayerId) {
            await player_model_1.default.findByIdAndUpdate(oldPlayerId, { $pull: { mvps: id } });
        }
        // Add to new player
        await player_model_1.default.findByIdAndUpdate(newPlayerId, { $push: { mvps: id } });
        // Update MVP record
        const updated = await mpv_model_1.default.findByIdAndUpdate(id, {
            $set: {
                player: newPlayerId,
                transferredFrom: oldPlayerId,
                transferReason: reason,
                transferredAt: new Date(),
                transferredBy: req.user?.id,
                updatedAt: new Date(),
            },
        }, { new: true }).populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent');
        // Log transfer
        await (0, helper_1.logAction)({
            title: "🏆 MVP Transferred",
            description: `MVP transferred to ${updated?.player?.name}`,
            severity: log_interface_1.ELogSeverity.WARNING,
            meta: {
                mvpId: id,
                fromPlayer: oldPlayerId,
                toPlayer: newPlayerId,
                reason,
            },
        });
        res.status(200).json({
            success: true,
            message: "MVP transferred successfully",
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to transfer MVP"),
        });
    }
};
exports.transferMvp = transferMvp;
