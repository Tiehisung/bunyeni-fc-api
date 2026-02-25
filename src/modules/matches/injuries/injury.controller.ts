// controllers/injury.controller.ts
import type { Request, Response } from "express";
import { removeEmptyKeys, getErrorMessage } from "../../../lib";
import { EInjurySeverity, IInjury } from "../../../types/injury.interface";
import { ELogSeverity } from "../../../types/log.interface";
import { logAction } from "../../log/helper";
import PlayerModel from "../../players/player.model";
import MatchModel from "../match.model";
import InjuryModel from "./injury.model";

// GET /api/injuries
export const getInjuries = async (req: Request, res: Response) => {
    try {
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "10", 10);
        const skip = (page - 1) * limit;

        const search = (req.query.injury_search as string) || "";
        const matchId = req.query.matchId as string;
        const playerId = req.query.playerId as string;
        const severity = req.query.severity as string;
        const status = req.query.status as string;

        const regex = new RegExp(search, "i");

        const query: any = {};

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

        const cleaned = removeEmptyKeys(query);

        const injuries = await InjuryModel.find(cleaned)
            .limit(limit)
            .skip(skip)
            .lean()
            .sort({ createdAt: "desc" });

        const total = await InjuryModel.countDocuments(cleaned);

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch injuries"),
        });
    }
};

// GET /api/injuries/:id
export const getInjuryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const injury = await InjuryModel.findById(id)
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch injury"),
        });
    }
};

// GET /api/injuries/player/:playerId
export const getInjuriesByPlayer = async (req: Request, res: Response) => {
    try {
        const { playerId } = req.params;
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "10", 10);
        const skip = (page - 1) * limit;

        const injuries = await InjuryModel.find({ player: playerId })
            .sort({ createdAt: "desc" })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await InjuryModel.countDocuments({ player: playerId });

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch player injuries"),
        });
    }
};

// GET /api/injuries/match/:matchId
export const getInjuriesByMatch = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;

        const injuries = await InjuryModel.find({ match: matchId })
            .sort({ minute: "asc" })
            .lean();

        res.status(200).json({
            success: true,
            data: injuries,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch match injuries"),
        });
    }
};

// GET /api/injuries/active
export const getActiveInjuries = async (req: Request, res: Response) => {
    try {
        const injuries = await InjuryModel.find({
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch active injuries"),
        });
    }
};

// POST /api/injuries
export const createInjury = async (req: Request, res: Response) => {
    try {
        const { match, minute, player, description, severity, title, status } = req.body as IInjury;

        // Create injury record
        const savedInjury = await InjuryModel.create({
            minute,
            description,
            severity: severity || 'minor',
            match,
            player,
            title: title || `${player.name} Injury`,
            status: status || 'active',
            // createdBy: req.user?.id,
            createdAt: new Date(),
        });

        if (!savedInjury) {
            return res.status(500).json({
                message: "Failed to create injury.",
                success: false
            });
        }

        // Update Player - add injury reference
        await PlayerModel.findByIdAndUpdate(
            player?._id || player,
            { $push: { injuries: savedInjury._id } }
        );

        // Update Match - add injury reference if match exists
        if (match) {
            await MatchModel.findByIdAndUpdate(
                match,
                { $push: { injuries: savedInjury._id } }
            );
        }

        // Log action
        await logAction({
            title: `🤕 Injury Created - ${title || player.name}`,
            description: description || `${player.name} injured at ${minute}'`,
            severity: (severity === EInjurySeverity.MAJOR || severity == EInjurySeverity.SEVERE) ? ELogSeverity.CRITICAL : ELogSeverity.INFO,
            meta: {
                injuryId: savedInjury._id,
                playerId: player._id || player,
                matchId: match,
                minute,
                severity,
            },
        });

        // Populate for response
        const populatedInjury = await InjuryModel.findById(savedInjury._id)
            .lean();

        res.status(201).json({
            message: "Injury recorded successfully!",
            success: true,
            data: populatedInjury
        });

    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to create injury"),
            success: false,
        });
    }
};

// PUT /api/injuries/:id
export const updateInjury = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove _id from updates
        delete updates._id;

        const updatedInjury = await InjuryModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...updates,
                    updatedAt: new Date(),
                    // updatedBy: req.user?.id,
                },
            },
            { new: true, runValidators: true }
        )

        if (!updatedInjury) {
            return res.status(404).json({
                success: false,
                message: "Injury not found",
            });
        }

        // Log update
        await logAction({
            title: `Injury Updated - ${updatedInjury.title}`,
            description: `Injury record updated`,
            severity: ELogSeverity.INFO,
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update injury"),
        });
    }
};

// PATCH /api/injuries/:id/status
export const updateInjuryStatus = async (req: Request, res: Response) => {
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

        const updatedInjury = await InjuryModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    status,
                    updatedAt: new Date(),
                    // updatedBy: req.user?.id,
                    recoveredAt: status === 'recovered' ? new Date() : undefined,
                },
            },
            { new: true }
        ).populate('player', 'name number position avatar');

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update injury status"),
        });
    }
};

// DELETE /api/injuries/:id
export const deleteInjury = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find injury first to get details
        const injuryToDelete = await InjuryModel.findById(id);

        if (!injuryToDelete) {
            return res.status(404).json({
                success: false,
                message: "Injury not found",
            });
        }

        // Delete the injury
        const deletedInjury = await InjuryModel.findByIdAndDelete(id);

        // Update Player - remove injury reference
        await PlayerModel.findByIdAndUpdate(
            injuryToDelete.player,
            { $pull: { injuries: id } }
        );

        // Update Match - remove injury reference
        if (injuryToDelete.match) {
            await MatchModel.findByIdAndUpdate(
                injuryToDelete.match,
                { $pull: { injuries: id } }
            );
        }

        // Log deletion
        await logAction({
            title: `Injury Deleted - ${injuryToDelete.title}`,
            description: `Injury record deleted`,
            severity: ELogSeverity.CRITICAL,
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to delete injury"),
        });
    }
};

// GET /api/injuries/stats
export const getInjuryStats = async (req: Request, res: Response) => {
    try {
        const stats = await InjuryModel.aggregate([
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch injury statistics"),
        });
    }
};