// controllers/captaincy.controller.ts
import { Request, Response } from "express";

import { QueryFilter } from "mongoose";
import { removeEmptyKeys, getErrorMessage } from "../../lib";
import { ELogSeverity } from "../../types/log.interface";
import { IPlayerMini } from "../../types/player.interface";
import { logAction } from "../logs/helper";
import PlayerModel from "../players/player.model";
import FileModel from "../media/files/file.model";
import CaptaincyModel from "./captain.model";

export type ICaptain = {
    isActive?: boolean;
    _id: string;
    player: Partial<IPlayerMini>;
    role: "captain" | "vice";
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
};

interface ICap {
    player: IPlayerMini;
    role: ICaptain["role"];
}

// GET /api/captains
export const getCaptains = async (req: Request, res: Response) => {
    try {
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "10", 10);
        const skip = (page - 1) * limit;

        const search = (req.query.captain_search as string) || "";
        const isActive = req.query.isActive === 'true';
        const role = req.query.role as string;
        const fromDate = req.query.fromDate as string;
        const toDate = req.query.toDate as string;

        const regex = new RegExp(search, "i");

        const query: any = {};

        // Search filter
        if (search) {
            query.$or = [
                { "player.firstName": regex },
                { "player.lastName": regex },
                { "player.name": regex },
                { "role": regex },
            ];
        }

        // Active status filter
        if (req.query.isActive !== undefined) {
            query.isActive = isActive;
        }

        // Role filter
        if (role) {
            query.role = role;
        }

        // Date range filter (for historical captaincy periods)
        if (fromDate || toDate) {
            query.startDate = {};
            if (fromDate) query.startDate.$gte = new Date(fromDate);
            if (toDate) query.startDate.$lte = new Date(toDate);
        }

        const cleaned = removeEmptyKeys(query);

        const captains = await CaptaincyModel.find(cleaned)
            .populate('player', 'name firstName lastName number position avatar')
            .sort({ createdAt: -1, startDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await CaptaincyModel.countDocuments(cleaned);

        // Get current active captains for quick reference
        const activeCaptains = await CaptaincyModel.find({ isActive: true })
            .populate('player', 'name firstName lastName number position avatar')
            .lean();

        res.status(200).json({
            success: true,
            data: {
                captains,
                activeCaptains,
            },
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
            message: getErrorMessage(error, "Failed to fetch captains"),
        });
    }
};

// GET /api/captains/active
export const getActiveCaptains = async (req: Request, res: Response) => {
    try {
        const captains = await CaptaincyModel.find({ isActive: true })
            .populate('player', 'name firstName lastName number position avatar')
            .sort({ role: 1 })
            .lean();

        res.status(200).json({
            success: true,
            data: captains,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch active captains"),
        });
    }
};

// GET /api/captains/player/:playerId
export const getCaptaincyByPlayer = async (req: Request, res: Response) => {
    try {
        const { playerId } = req.params;

        const captaincies = await CaptaincyModel.find({ 'player._id': playerId })
            .sort({ startDate: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: captaincies,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch player captaincy history"),
        });
    }
};

// GET /api/captains/history/:role
export const getCaptaincyHistoryByRole = async (req: Request, res: Response) => {
    try {
        const { role } = req.params;
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "20", 10);
        const skip = (page - 1) * limit;

        const history = await CaptaincyModel.find({ role })
            .populate('player', 'name firstName lastName number position avatar')
            .sort({ startDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await CaptaincyModel.countDocuments({ role });

        res.status(200).json({
            success: true,
            data: history,
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
            message: getErrorMessage(error, "Failed to fetch captaincy history"),
        });
    }
};

// GET /api/captains/:id
export const getCaptaincyById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const captaincy = await CaptaincyModel.findById(id)
            .populate('player', 'name firstName lastName number position avatar')
            .lean();

        if (!captaincy) {
            return res.status(404).json({
                success: false,
                message: "Captaincy record not found",
            });
        }

        res.status(200).json({
            success: true,
            data: captaincy,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch captaincy record"),
        });
    }
};

// POST /api/captains
export const assignCaptain = async (req: Request, res: Response) => {
    try {
        const { player, role }: ICap = req.body;

        // Validate required fields
        if (!player || !role) {
            return res.status(400).json({
                success: false,
                message: "Player and role are required",
            });
        }

        // Check if player exists
        const playerExists = await PlayerModel.findById(player._id);
        if (!playerExists) {
            return res.status(404).json({
                success: false,
                message: "Player not found",
            });
        }

        // End current captain's reign for this role
        const currentCaptain = await CaptaincyModel.findOne({
            isActive: true,
            role: role
        });

        if (currentCaptain) {
            await CaptaincyModel.updateMany(
                { isActive: true, role: role },
                {
                    $set: {
                        isActive: false,
                        endDate: new Date(),
                        updatedAt: new Date(),
                        endedBy: req.user?.id,
                    }
                }
            );
        }

        // Create new captaincy record
        const newCaptain = await CaptaincyModel.create({
            player: {
                _id: player._id,
                name: player.name ,
                number: player.number,
                
            },
            role,
            isActive: true,
            startDate: new Date(),
            appointedBy: req.user?.id,
            createdAt: new Date(),
        });

        // Log action
        await logAction({
            title: "👑 Captain Assigned",
            description: `${player.name } appointed as ${role}`,
            severity: ELogSeverity.INFO,
            meta: {
                captaincyId: newCaptain._id,
                playerId: player._id,
                role,
                previousCaptain: currentCaptain?._id,
            },
        });

        // Populate for response
        const populatedCaptain = await CaptaincyModel.findById(newCaptain._id)
            .populate('player', 'name firstName lastName number position avatar')
            .lean();

        res.status(201).json({
            message: "Captain assigned successfully.",
            success: true,
            data: populatedCaptain,
        });
    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to assign captain"),
            success: false,
        });
    }
};

// POST /api/captains/bulk
export const assignMultipleCaptains = async (req: Request, res: Response) => {
    try {
        const { assignments } = req.body;

        if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Assignments array is required",
            });
        }

        const results = [];
        const errors = [];

        for (const assignment of assignments) {
            try {
                const { player, role } = assignment;

                // End current captain's reign
                await CaptaincyModel.updateMany(
                    { isActive: true, role },
                    {
                        $set: {
                            isActive: false,
                            endDate: new Date(),
                            endedBy: req.user?.id,
                        }
                    }
                );

                // Create new captain
                const newCaptain = await CaptaincyModel.create({
                    player,
                    role,
                    isActive: true,
                    startDate: new Date(),
                    appointedBy: req.user?.id,
                });

                results.push(newCaptain);
            } catch (error) {
                errors.push({ assignment, error: getErrorMessage(error) });
            }
        }

        // Log bulk action
        await logAction({
            title: "👑 Multiple Captains Assigned",
            description: `${results.length} captains assigned, ${errors.length} failed`,
            severity: errors.length > 0 ? ELogSeverity.WARNING : ELogSeverity.INFO,
            meta: { results, errors },
        });

        res.status(201).json({
            message: "Captains assigned successfully",
            success: true,
            data: {
                successful: results,
                failed: errors,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to assign captains"),
            success: false,
        });
    }
};

// PUT /api/captains/:id/end
export const endCaptaincy = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const captaincy = await CaptaincyModel.findById(id);

        if (!captaincy) {
            return res.status(404).json({
                success: false,
                message: "Captaincy record not found",
            });
        }

        if (!captaincy.isActive) {
            return res.status(400).json({
                success: false,
                message: "This captaincy has already ended",
            });
        }

        const updated = await CaptaincyModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    isActive: false,
                    endDate: new Date(),
                    endReason: reason || 'End of tenure',
                    endedBy: req.user?.id,
                    updatedAt: new Date(),
                },
            },
            { new: true }
        ).populate('player', 'name firstName lastName number position avatar');

        // Log action
        await logAction({
            title: "👑 Captaincy Ended",
            description: `${captaincy.player?.name}'s tenure as ${captaincy.role} ended`,
            severity: ELogSeverity.INFO,
            meta: {
                captaincyId: id,
                playerId: captaincy.player?._id,
                role: captaincy.role,
                reason,
            },
        });

        res.status(200).json({
            success: true,
            message: "Captaincy ended successfully",
            data: updated,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to end captaincy"),
        });
    }
};

// PUT /api/captains/:id
export const updateCaptaincy = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove _id from updates
        delete updates._id;

        const updated = await CaptaincyModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...updates,
                    updatedAt: new Date(),
                    updatedBy: req.user?.id,
                },
            },
            { new: true, runValidators: true }
        ).populate('player', 'name firstName lastName number position avatar');

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Captaincy record not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Captaincy record updated",
            data: updated,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update captaincy record"),
        });
    }
};

// DELETE /api/captains/:id
export const deleteCaptaincy = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const captaincy = await CaptaincyModel.findById(id);

        if (!captaincy) {
            return res.status(404).json({
                success: false,
                message: "Captaincy record not found",
            });
        }

        const deleted = await CaptaincyModel.findByIdAndDelete(id);

        // Log action
        await logAction({
            title: "👑 Captaincy Record Deleted",
            description: `${captaincy.player?.name}'s captaincy record deleted`,
            severity: ELogSeverity.CRITICAL,
            meta: {
                captaincyId: id,
                playerId: captaincy.player?._id,
                role: captaincy.role,
            },
        });

        res.status(200).json({
            success: true,
            message: "Captaincy record deleted",
            data: deleted,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to delete captaincy record"),
        });
    }
};

// GET /api/captains/stats
export const getCaptaincyStats = async (req: Request, res: Response) => {
    try {
        const stats = await CaptaincyModel.aggregate([
            {
                $facet: {
                    totalAppointments: [{ $count: "count" }],
                    byRole: [
                        {
                            $group: {
                                _id: "$role",
                                count: { $sum: 1 },
                                active: {
                                    $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
                                },
                            },
                        },
                    ],
                    activeCaptains: [
                        {
                            $match: { isActive: true }
                        },
                        {
                            $group: {
                                _id: "$role",
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    longestTenure: [
                        {
                            $match: { isActive: false, endDate: { $exists: true } }
                        },
                        {
                            $addFields: {
                                tenureDays: {
                                    $divide: [
                                        { $subtract: ["$endDate", "$startDate"] },
                                        1000 * 60 * 60 * 24
                                    ]
                                }
                            }
                        },
                        {
                            $sort: { tenureDays: -1 }
                        },
                        {
                            $limit: 5
                        },
                        {
                            $lookup: {
                                from: "players",
                                localField: "player._id",
                                foreignField: "_id",
                                as: "playerDetails",
                            },
                        },
                        {
                            $project: {
                                playerName: { $arrayElemAt: ["$playerDetails.name", 0] },
                                role: 1,
                                tenureDays: 1,
                                startDate: 1,
                                endDate: 1,
                            },
                        },
                    ],
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalAppointments: stats[0]?.totalAppointments[0]?.count || 0,
                byRole: stats[0]?.byRole || [],
                activeCaptains: stats[0]?.activeCaptains || [],
                longestTenure: stats[0]?.longestTenure || [],
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch captaincy statistics"),
        });
    }
};