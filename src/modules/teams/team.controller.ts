// controllers/team.controller.ts
import type { Request, Response } from "express";

import { removeEmptyKeys, getErrorMessage } from "../../lib";
import { formatDate } from "../../lib/timeAndDate";
import { EArchivesCollection } from "../../types/archive.interface";
import { ELogSeverity } from "../../types/log.interface";
import ArchiveModel from "../archives/archive.model";
import { logAction } from "../log/helper";
import TeamModel from "./team.model";
import { IPostTeam } from "../../types/team";
import "../media/files/file.model";

// GET /api/teams
export const getTeams = async (req: Request, res: Response) => {
    try {
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "10", 10);
        const skip = (page - 1) * limit;

        const search = (req.query.team_search as string) || "";
        const clubId = req.query.clubId as string;
        const season = req.query.season as string;
        const league = req.query.league as string;
        const status = req.query.status as string;

        const regex = new RegExp(search, "i");

        const query: any = {};

        if (search) {
            query.$or = [
                { "name": regex },
                { "alias": regex },
                { "community": regex },
                { "league": regex },
                { "division": regex },
            ];
        }

        if (clubId) {
            query.clubId = clubId;
        }

        if (season) {
            query.season = season;
        }

        if (league) {
            query.league = league;
        }

        if (status) {
            query.status = status;
        }

        const cleaned = removeEmptyKeys(query);

        const teams = await TeamModel.find(cleaned)
            .limit(limit)
            .skip(skip)
            .lean()
            .sort({ createdAt: "desc" });

        const total = await TeamModel.countDocuments(cleaned);

        res.status(200).json({
            success: true,
            data: teams,
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
            message: getErrorMessage(error, "Failed to retrieve teams"),
            data: [],
        });
    }
};

// GET /api/teams/:id
export const getTeamById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const team = await TeamModel.findById(id).lean();



        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }

        res.status(200).json({
            success: true,
            data: team,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to retrieve team"),
        });
    }
};

// GET /api/teams/club/:clubId
export const getTeamsByClub = async (req: Request, res: Response) => {
    try {
        const { clubId } = req.params;
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "10", 10);
        const skip = (page - 1) * limit;

        const teams = await TeamModel.find({ clubId })
            .populate('players', 'name number position')
            .populate('logo')
            .skip(skip)
            .limit(limit)
            .lean()
            .sort({ createdAt: "desc" });

        const total = await TeamModel.countDocuments({ clubId });

        res.status(200).json({
            success: true,
            data: teams,
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
            message: getErrorMessage(error, "Failed to retrieve club teams"),
        });
    }
};

// GET /api/teams/season/:season
export const getTeamsBySeason = async (req: Request, res: Response) => {
    try {
        const { season } = req.params;
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "10", 10);
        const skip = (page - 1) * limit;

        const teams = await TeamModel.find({ season })
            .populate('clubId', 'name logo')
            .populate('logo')
            .skip(skip)
            .limit(limit)
            .lean()
            .sort({ name: "asc" });

        const total = await TeamModel.countDocuments({ season });

        res.status(200).json({
            success: true,
            data: teams,
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
            message: getErrorMessage(error, "Failed to retrieve teams by season"),
        });
    }
};

// POST /api/teams
export const createTeam = async (req: Request, res: Response) => {
    try {
        const teamData: IPostTeam = req.body;

        console.log(teamData)

        // Check if team with same name and season already exists
        const existingTeam = await TeamModel.findOne({
            name: teamData.name,
            // season: teamData.season,
            // clubId: teamData.clubId,
        });

        if (existingTeam) {
            return res.status(409).json({
                success: false,
                message: "Team with this name already exists for this season",
            });
        }

        // Create team
        const createdTeam = await TeamModel.create({
            ...teamData,
            // createdBy: req.user?.id,
            createdAt: new Date(),
        });

        if (!createdTeam) {
            return res.status(500).json({
                success: false,
                message: "Team creation failed",
            });
        }

        // Log action
        await logAction({
            title: `Team Created - ${createdTeam.name}`,
            description: `New team ${createdTeam.name} created for season ${createdTeam.season}`,
            severity: ELogSeverity.INFO,
            meta: {
                teamId: createdTeam._id,
                clubId: createdTeam.clubId,
                season: createdTeam.season,
            },
        });

        // Populate for response
        const populatedTeam = await TeamModel.findById(createdTeam._id)
            .lean();

        res.status(201).json({
            success: true,
            message: "Team created successfully",
            data: populatedTeam,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to create team"),
            error: error,
        });
    }
};

// PUT /api/teams/:id
export const updateTeam = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const teamData = req.body;

        // Remove _id from updates
        delete teamData._id;

        const updated = await TeamModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...teamData,
                    updatedAt: new Date(),
                    // updatedBy: req.user?.id,
                },
            },
            { new: true, runValidators: true }
        )


        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }

        // Log action
        await logAction({
            title: `Team Updated - ${updated.name}`,
            description: `Team details updated`,
            severity: ELogSeverity.INFO,
            meta: {
                teamId: id,
                updates: Object.keys(teamData),
            },
        });

        res.status(200).json({
            success: true,
            message: "Team updated successfully",
            data: updated,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update team"),
            error: error,
        });
    }
};

// PATCH /api/teams/:id (partial updates)
export const patchTeam = async (req: Request, res: Response) => {
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

        const updated = await TeamModel.findByIdAndUpdate(
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


        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Team updated successfully",
            data: updated,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update team"),
        });
    }
};

// DELETE /api/teams/:id
export const deleteTeam = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find team first
        const teamToDelete = await TeamModel.findById(id);

        if (!teamToDelete) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }

        // Delete team
        const deleted = await TeamModel.findByIdAndDelete(id);

        // Archive the deleted team
        await ArchiveModel.create({
            sourceCollection: EArchivesCollection.TEAMS,
            originalId: id,
            data: teamToDelete,
            archivedAt: new Date(),
            // archivedBy: req.user?.id,
            reason: 'Team deleted',
        });

        // Log action
        await logAction({
            title: `Team Deleted - ${teamToDelete.name}`,
            description: `Team ${teamToDelete.name} deleted on ${formatDate(new Date().toISOString())}`,
            severity: ELogSeverity.CRITICAL,
            meta: {
                teamId: id,
                clubId: teamToDelete.clubId,
                season: teamToDelete.season,
            },
        });

        res.status(200).json({
            success: true,
            message: "Team deleted successfully",
            data: {
                id: deleted?._id,
                name: teamToDelete.name,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to delete team"),
            error: error,
        });
    }
};

// GET /api/teams/stats
export const getTeamStats = async (req: Request, res: Response) => {
    try {
        const stats = await TeamModel.aggregate([
            {
                $facet: {
                    totalTeams: [{ $count: "count" }],
                    bySeason: [
                        {
                            $group: {
                                _id: "$season",
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { "_id": -1 } },
                    ],
                    byLeague: [
                        {
                            $group: {
                                _id: "$league",
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { count: -1 } },
                        { $limit: 10 },
                    ],
                    byStatus: [
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 },
                            },
                        },
                    ],
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalTeams: stats[0]?.totalTeams[0]?.count || 0,
                bySeason: stats[0]?.bySeason || [],
                byLeague: stats[0]?.byLeague || [],
                byStatus: stats[0]?.byStatus || [],
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch team statistics"),
        });
    }
};

// POST /api/teams/:id/players (add player to team)
export const addPlayerToTeam = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { playerId } = req.body;

        if (!playerId) {
            return res.status(400).json({
                success: false,
                message: "Player ID is required",
            });
        }

        const team = await TeamModel.findByIdAndUpdate(
            id,
            {
                $addToSet: { players: playerId },
                $set: { updatedAt: new Date() },
            },
            { new: true }
        ).populate('players');

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Player added to team",
            data: team,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to add player to team"),
        });
    }
};

// DELETE /api/teams/:id/players/:playerId (remove player from team)
export const removePlayerFromTeam = async (req: Request, res: Response) => {
    try {
        const { id, playerId } = req.params;

        const team = await TeamModel.findByIdAndUpdate(
            id,
            {
                $pull: { players: playerId },
                $set: { updatedAt: new Date() },
            },
            { new: true }
        ).populate('players');

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Player removed from team",
            data: team,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to remove player from team"),
        });
    }
};