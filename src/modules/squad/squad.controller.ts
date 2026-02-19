// controllers/squad.controller.ts
import type { Request, Response } from "express";
import { removeEmptyKeys, getErrorMessage } from "../../lib";
import { formatDate } from "../../lib/timeAndDate";
import { EArchivesCollection } from "../../types/archive.interface";
import { ELogSeverity } from "../../types/log.interface";
import { saveToArchive } from "../archives/helper";
import { logAction } from "../logs/helper";
import MatchModel from "../matches/match.model";
import PlayerModel from "../players/player.model";
import SquadModel from "./squad.model";
import { ISquad } from "../../types/squad.interface";
 

// GET /api/squads
export const getSquads = async (req: Request, res: Response) => {
    try {
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "10", 10);
        const skip = (page - 1) * limit;

        const search = (req.query.squad_search as string) || "";
        const matchId = req.query.matchId as string;
        const season = req.query.season as string;

        const regex = new RegExp(search, "i");

        const query: any = {};

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

        const cleaned = removeEmptyKeys(query);

        const squads = await SquadModel.find(cleaned)
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

        const total = await SquadModel.countDocuments(cleaned);

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch squads"),
        });
    }
};

// GET /api/squads/:id
export const getSquadById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const squad = await SquadModel.findById(id)
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch squad"),
        });
    }
};

// GET /api/squads/match/:matchId
export const getSquadByMatch = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;

        const squad = await SquadModel.findOne({ match: matchId })
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch match squad"),
        });
    }
};

// POST /api/squads
export const createSquad = async (req: Request, res: Response) => {
    try {
        const { match, players, assistant, coach, description, formation,   } = req.body as ISquad;

        // Validate required fields
        if (!match || !players || !players.length) {
            return res.status(400).json({
                success: false,
                message: "Match ID and players are required",
            });
        }

        // Check if squad already exists for this match
        const existingSquad = await SquadModel.findOne({ match: match._id || match });
        if (existingSquad) {
            return res.status(409).json({
                success: false,
                message: "Squad already exists for this match",
            });
        }

        // Get match details
        const matchDetails = await MatchModel.findById(match._id || match);
        if (!matchDetails) {
            return res.status(404).json({
                success: false,
                message: "Match not found",
            });
        }

        // Create squad
        const savedSquad = await SquadModel.create({
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
        await MatchModel.findByIdAndUpdate(
            match._id || match,
            { $set: { squad: savedSquad._id } }
        );

        // Update player statistics (optional - track squad appearances)
        for (const player of players) {
            await PlayerModel.findByIdAndUpdate(
                player._id ,
                { $inc: { 'stats.squadAppearances': 1 } }
            );
        }

        // Log action
        await logAction({
            title: "📋 Squad Created",
            description: description || `Squad for ${matchDetails.title} on ${formatDate(matchDetails.date)}`,
            severity: ELogSeverity.INFO,
            
            meta: {
                squadId: savedSquad._id,
                matchId: match._id || match,
                playerCount: players.length,
            },
        });

        // Populate for response
        const populatedSquad = await SquadModel.findById(savedSquad._id)
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

    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to create squad"),
            success: false,
        });
    }
};

// PUT /api/squads/:id
export const updateSquad = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove _id from updates
        delete updates._id;

        const updated = await SquadModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...updates,
                    updatedAt: new Date(),
                    updatedBy: req.user?.id,
                },
            },
            { new: true, runValidators: true }
        )
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
        await logAction({
            title: "📋 Squad Updated",
            description: `Squad for ${updated.title} updated`,
            severity: ELogSeverity.INFO,
            
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update squad"),
        });
    }
};

// PATCH /api/squads/:id/players (add or update players)
export const updateSquadPlayers = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { players } = req.body;

        if (!players || !Array.isArray(players)) {
            return res.status(400).json({
                success: false,
                message: "Players array is required",
            });
        }

        const updated = await SquadModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    players,
                    updatedAt: new Date(),
                    updatedBy: req.user?.id,
                },
            },
            { new: true }
        ).populate('players.player', 'name number position avatar');

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update squad players"),
        });
    }
};

// PATCH /api/squads/:id/substitutions (add substitution)
export const addSubstitution = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { minute, playerIn, playerOut, reason } = req.body;

        if (!minute || !playerIn || !playerOut) {
            return res.status(400).json({
                success: false,
                message: "Minute, playerIn, and playerOut are required",
            });
        }

        const updated = await SquadModel.findByIdAndUpdate(
            id,
            {
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
            },
            { new: true }
        )
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to add substitution"),
        });
    }
};

// PATCH /api/squads/:id/formation
export const updateFormation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { formation, tactics } = req.body;

        const updated = await SquadModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    formation,
                    tactics,
                    updatedAt: new Date(),
                    updatedBy: req.user?.id,
                },
            },
            { new: true }
        );

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update formation"),
        });
    }
};

// DELETE /api/squads/:id
export const deleteSquad = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find squad first
        const squad = await SquadModel.findById(id);

        if (!squad) {
            return res.status(404).json({
                success: false,
                message: "Squad not found",
            });
        }

        // Delete squad
        const deleted = await SquadModel.findByIdAndDelete(id);

        // Remove squad reference from match
        if (squad.match) {
            await MatchModel.findByIdAndUpdate(
                squad.match,
                { $unset: { squad: "" } }
            );
        }

        // Archive the squad
        await saveToArchive({
            data: squad,
            originalId: id+'',
            sourceCollection: EArchivesCollection.SQUADS,
            reason: 'Squad deleted',
            
        });

        // Log deletion
        await logAction({
            title: "📋 Squad Deleted",
            description: `Squad for ${squad.title} deleted on ${formatDate(new Date().toISOString())}`,
            severity: ELogSeverity.CRITICAL,
            
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to delete squad"),
        });
    }
};

// GET /api/squads/stats
export const getSquadStats = async (req: Request, res: Response) => {
    try {
        const stats = await SquadModel.aggregate([
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch squad statistics"),
        });
    }
};