// controllers/mvp.controller.ts
import type { Request, Response } from "express";
import { getErrorMessage } from "../../../lib";
import { TSearchKey } from "../../../types";
import { ELogSeverity } from "../../../types/log.interface";
import { logAction } from "../../log/helper";
import PlayerModel from "../../players/player.model";
import MatchModel from "../match.model";
import MvPModel, { IPostMvp } from "./mpv.model";
import { updateMatchEvent } from "../helpers";

// GET /api/mvps
export const getMvps = async (req: Request, res: Response) => {
    try {
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "30", 10);
        const skip = (page - 1) * limit;

        const search = (req.query.mvp_search as TSearchKey) || "";
        const playerId = req.query.playerId as string;
        const matchId = req.query.matchId as string;
        const season = req.query.season as string;

        const regex = new RegExp(search, "i");

        const query: any = {};

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

        const mvps = await MvPModel.find(query)
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent')
            .limit(limit)
            .skip(skip)
            .lean()
            .sort({ createdAt: "desc" });

        const total = await MvPModel.countDocuments(query);

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch MVPs"),
        });
    }
};

// GET /api/mvps/:id

// GET /api/mvps/player/:playerId
export const getMvpsByPlayer = async (req: Request, res: Response) => {
    try {
        const { playerId } = req.params;
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "10", 10);
        const skip = (page - 1) * limit;

        const mvps = await MvPModel.find({ player: playerId })
            .populate('match', 'title date competition opponent')
            .sort({ createdAt: "desc" })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await MvPModel.countDocuments({ player: playerId });

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch player MVPs"),
        });
    }
};

// GET /api/mvps/match/:matchId
export const getMvpByMatch = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;

        const mvp = await MvPModel.findOne({ match: matchId })
            .populate('player', 'name number position avatar')
            .lean();

        res.status(200).json({
            success: true,
            data: mvp || null,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch match MVP"),
        });
    }
};

// GET /api/mvps/stats
export const getMvpStats = async (req: Request, res: Response) => {
    try {
        const stats = await MvPModel.aggregate([
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch MVP statistics"),
        });
    }
};

// POST /api/mvps
export const createMvp = async (req: Request, res: Response) => {
    try {
        const { match, player, description, positionPlayed, season } = req.body as IPostMvp;

        // Validate required fields
        if (!match || !player) {
            return res.status(400).json({
                success: false,
                message: "Match ID and player ID are required",
            });
        }

        // Check if match already has an MVP
        const existingMatch = await MatchModel.findById(match).populate('mvp');

        if (existingMatch?.mvp) {
            return res.status(409).json({
                message: "Match already assigned Man of the Match.",
                success: false
            });
        }

        // Create MVP record
        const savedMVP = await MvPModel.create({
            match,
            player,
            description,
            positionPlayed,
            season: season || existingMatch?.season,

        });

        if (!savedMVP) {
            return res.status(500).json({
                message: "Failed to create MVP.",
                success: false
            });
        }

        // Update Match - add MVP reference
        await MatchModel.findByIdAndUpdate(
            match,
            {
                $set: { mvp: savedMVP._id },
                $push: { mvps: savedMVP._id }
            }
        );

        // Update Player - add MVP reference
        const playerId = typeof player === 'object' ? player._id : player;
        await PlayerModel.findByIdAndUpdate(
            playerId,
            { $push: { mvps: savedMVP._id } }
        );

        // Update match events
        await updateMatchEvent(match?.toString(), {
            type: 'general',
            minute: 'FT',
            title: `🏆 ${typeof player === 'object' ? player.name : 'Player'} awarded Man of the Match`,
            description: description || `Outstanding performance${positionPlayed ? ` playing as ${positionPlayed}` : ''}`,
            timestamp: new Date(),
        });

        // Log action
        await logAction({
            title: "🏆 MVP Awarded",
            description: `${typeof player === 'object' ? player.name : 'Player'} declared Man of the Match. ${description || ''}`,
            severity: ELogSeverity.INFO,

            meta: {
                mvpId: savedMVP._id,
                matchId: match,
                playerId: playerId,
            },
        });

        // Populate for response
        const populatedMVP = await MvPModel.findById(savedMVP._id)
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent')
            .lean();

        res.status(201).json({
            message: "Man of the Match awarded successfully!",
            success: true,
            data: populatedMVP
        });

    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to create MVP"),
            success: false,
        });
    }
};

// PUT /api/mvps/:id
export const updateMvp = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove _id from updates
        delete updates._id;

        const updatedMVP = await MvPModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...updates,
                },
            },
            { new: true, runValidators: true }
        )
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent');

        if (!updatedMVP) {
            return res.status(404).json({
                success: false,
                message: "MVP not found",
            });
        }

        // Log update
        await logAction({
            title: "MVP Record Updated",
            description: `MVP record updated for ${updatedMVP.player?.name}`,
            severity: ELogSeverity.INFO,

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update MVP"),
        });
    }
};

// DELETE /api/mvps/:id
export const deleteMvp = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find MVP first to get details
        const mvpToDelete = await MvPModel.findById(id);

        if (!mvpToDelete) {
            return res.status(404).json({
                success: false,
                message: "MVP not found",
            });
        }

        // Delete the MVP
        const deletedMVP = await MvPModel.findByIdAndDelete(id);

        // Update Match - remove MVP reference
        await MatchModel.findByIdAndUpdate(
            mvpToDelete.match,
            {
                $unset: { mvp: "" },
                $pull: { mvps: id }
            }
        );

        // Update Player - remove MVP reference
        await PlayerModel.findByIdAndUpdate(
            mvpToDelete.player,
            { $pull: { mvps: id } }
        );

        // Log deletion
        await logAction({
            title: "MVP Award Deleted",
            description: `MVP award for ${mvpToDelete.player?.name} deleted`,
            severity: ELogSeverity.CRITICAL,

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to delete MVP"),
        });
    }
};

// GET /api/mvps/leaderboard
export const getMvpLeaderboard = async (req: Request, res: Response) => {
    try {
        const limit = Number.parseInt(req.query.limit as string || "20", 10);
        const season = req.query.season as string;

        const matchFilter: any = {};
        if (season) {
            matchFilter.season = season;
        }

        const leaderboard = await MvPModel.aggregate([
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch MVP leaderboard"),
        });
    }
};

// controllers/mvp.controller.ts (Add these to your existing MVP controller)

// GET /api/mvps/:id
export const getMvpById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const mvp = await MvPModel.findById(id)
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch MVP"),
        });
    }
};

// PUT /api/mvps/:id
export const updateMvpById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const body = req.body;

        // Find current MVP data
        const previousMvpData = await MvPModel.findById(id)


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

            await PlayerModel.findByIdAndUpdate(
                previousMvpData.player._id,
                { $pull: { mvps: id } }
            );
        }

        // Update MVP record
        const updated = await MvPModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...body,
                },
            },
            { new: true, runValidators: true }
        )

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

            await PlayerModel.findByIdAndUpdate(
                typeof body.player === 'object' ? body.player._id : body.player,
                { $push: { mvps: id } }
            );
        }

        // Update match MVP reference
        const matchId = body.match?._id || updated.match?._id;
        if (matchId) {
            await MatchModel.findByIdAndUpdate(
                matchId,
                { $set: { mvp: updated._id } }
            );
        }

        // Log action
        await logAction({
            title: "🏆 MVP Updated",
            description: `MVP record updated for ${updated.player?.name || 'player'}`,
            severity: ELogSeverity.INFO,
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

    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Update failed"),
            success: false
        });
    }
};

// PATCH /api/mvps/:id (partial updates)
export const patchMvpById = async (req: Request, res: Response) => {
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

        const updated = await MvPModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...updates,
                },
            },
            { new: true, runValidators: true }
        ).populate('player', 'name number position avatar')
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update MVP"),
        });
    }
};

// DELETE /api/mvps/:id
export const deleteMvpById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find and delete MVP
        const deleted = await MvPModel.findByIdAndDelete(id)
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
            await PlayerModel.findByIdAndUpdate(
                deleted.player._id,
                { $pull: { mvps: id } }
            );
        }

        // Remove from match's MVP reference
        if (deleted.match) {
            await MatchModel.findByIdAndUpdate(
                deleted.match._id,
                { $set: { mvp: null } }
            );
        }

        // Log deletion
        await logAction({
            title: "🏆 MVP Deleted",
            description: `MVP award for ${deleted.player?.name || 'player'} deleted`,
            severity: ELogSeverity.CRITICAL,
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

    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Delete failed"),
            success: false
        });
    }
};

// POST /api/mvps/:id/transfer (transfer MVP to different player)
export const transferMvp = async (req: Request, res: Response) => {
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
        const currentMvp = await MvPModel.findById(id)
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
            await PlayerModel.findByIdAndUpdate(
                oldPlayerId,
                { $pull: { mvps: id } }
            );
        }

        // Add to new player
        await PlayerModel.findByIdAndUpdate(
            newPlayerId,
            { $push: { mvps: id } }
        );

        // Update MVP record
        const updated = await MvPModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    player: newPlayerId,
                    transferredFrom: oldPlayerId,
                    transferReason: reason,
                },
            },
            { new: true }
        ).populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent');

        // Log transfer
        await logAction({
            title: "🏆 MVP Transferred",
            description: `MVP transferred to ${updated?.player?.name}`,
            severity: ELogSeverity.WARNING,
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to transfer MVP"),
        });
    }
};