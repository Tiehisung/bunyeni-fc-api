"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePlayerFromTeam = exports.addPlayerToTeam = exports.getTeamStats = exports.deleteTeam = exports.patchTeam = exports.updateTeam = exports.createTeam = exports.getTeamsBySeason = exports.getTeamsByClub = exports.getTeamById = exports.getTeams = void 0;
const lib_1 = require("../../lib");
const timeAndDate_1 = require("../../lib/timeAndDate");
const archive_interface_1 = require("../../types/archive.interface");
const log_interface_1 = require("../../types/log.interface");
const archive_model_1 = __importDefault(require("../archives/archive.model"));
const helper_1 = require("../logs/helper");
const team_model_1 = __importDefault(require("./team.model"));
require("../media/files/file.model");
// GET /api/teams
const getTeams = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const search = req.query.team_search || "";
        const clubId = req.query.clubId;
        const season = req.query.season;
        const league = req.query.league;
        const status = req.query.status;
        const regex = new RegExp(search, "i");
        const query = {};
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
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        const teams = await team_model_1.default.find(cleaned)
            .populate('clubId', 'name logo stadium')
            .populate('players', 'name number position')
            .populate('coach', 'name')
            .populate('logo')
            .limit(limit)
            .skip(skip)
            .lean()
            .sort({ createdAt: "desc" });
        const total = await team_model_1.default.countDocuments(cleaned);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to retrieve teams"),
            data: [],
        });
    }
};
exports.getTeams = getTeams;
// GET /api/teams/:id
const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await team_model_1.default.findById(id)
            .populate('clubId', 'name logo stadium founded')
            .populate('players', 'name number position avatar')
            .populate('coach', 'name email')
            .populate('logo')
            .lean();
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to retrieve team"),
        });
    }
};
exports.getTeamById = getTeamById;
// GET /api/teams/club/:clubId
const getTeamsByClub = async (req, res) => {
    try {
        const { clubId } = req.params;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const teams = await team_model_1.default.find({ clubId })
            .populate('players', 'name number position')
            .populate('logo')
            .skip(skip)
            .limit(limit)
            .lean()
            .sort({ createdAt: "desc" });
        const total = await team_model_1.default.countDocuments({ clubId });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to retrieve club teams"),
        });
    }
};
exports.getTeamsByClub = getTeamsByClub;
// GET /api/teams/season/:season
const getTeamsBySeason = async (req, res) => {
    try {
        const { season } = req.params;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const teams = await team_model_1.default.find({ season })
            .populate('clubId', 'name logo')
            .populate('logo')
            .skip(skip)
            .limit(limit)
            .lean()
            .sort({ name: "asc" });
        const total = await team_model_1.default.countDocuments({ season });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to retrieve teams by season"),
        });
    }
};
exports.getTeamsBySeason = getTeamsBySeason;
// POST /api/teams
const createTeam = async (req, res) => {
    try {
        const teamData = req.body;
        // Check if team with same name and season already exists
        const existingTeam = await team_model_1.default.findOne({
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
        const createdTeam = await team_model_1.default.create({
            ...teamData,
            createdBy: req.user?.id,
            createdAt: new Date(),
        });
        if (!createdTeam) {
            return res.status(500).json({
                success: false,
                message: "Team creation failed",
            });
        }
        // Log action
        await (0, helper_1.logAction)({
            title: `Team Created - ${createdTeam.name}`,
            description: `New team ${createdTeam.name} created for season ${createdTeam.season}`,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: {
                teamId: createdTeam._id,
                clubId: createdTeam.clubId,
                season: createdTeam.season,
            },
        });
        // Populate for response
        const populatedTeam = await team_model_1.default.findById(createdTeam._id)
            .populate('clubId', 'name logo')
            .populate('logo')
            .lean();
        res.status(201).json({
            success: true,
            message: "Team created successfully",
            data: populatedTeam,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to create team"),
            error: error,
        });
    }
};
exports.createTeam = createTeam;
// PUT /api/teams/:id
const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const teamData = req.body;
        // Remove _id from updates
        delete teamData._id;
        const updated = await team_model_1.default.findByIdAndUpdate(id, {
            $set: {
                ...teamData,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true, runValidators: true })
            .populate('clubId', 'name logo')
            .populate('logo');
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }
        // Log action
        await (0, helper_1.logAction)({
            title: `Team Updated - ${updated.name}`,
            description: `Team details updated`,
            severity: log_interface_1.ELogSeverity.INFO,
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update team"),
            error: error,
        });
    }
};
exports.updateTeam = updateTeam;
// PATCH /api/teams/:id (partial updates)
const patchTeam = async (req, res) => {
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
        const updated = await team_model_1.default.findByIdAndUpdate(id, {
            $set: {
                ...updates,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true, runValidators: true })
            .populate('clubId', 'name logo')
            .populate('logo');
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update team"),
        });
    }
};
exports.patchTeam = patchTeam;
// DELETE /api/teams/:id
const deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        // Find team first
        const teamToDelete = await team_model_1.default.findById(id);
        if (!teamToDelete) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }
        // Delete team
        const deleted = await team_model_1.default.findByIdAndDelete(id);
        // Archive the deleted team
        await archive_model_1.default.create({
            sourceCollection: archive_interface_1.EArchivesCollection.TEAMS,
            originalId: id,
            data: teamToDelete,
            archivedAt: new Date(),
            archivedBy: req.user?.id,
            reason: 'Team deleted',
        });
        // Log action
        await (0, helper_1.logAction)({
            title: `Team Deleted - ${teamToDelete.name}`,
            description: `Team ${teamToDelete.name} deleted on ${(0, timeAndDate_1.formatDate)(new Date().toISOString())}`,
            severity: log_interface_1.ELogSeverity.CRITICAL,
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to delete team"),
            error: error,
        });
    }
};
exports.deleteTeam = deleteTeam;
// GET /api/teams/stats
const getTeamStats = async (req, res) => {
    try {
        const stats = await team_model_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch team statistics"),
        });
    }
};
exports.getTeamStats = getTeamStats;
// POST /api/teams/:id/players (add player to team)
const addPlayerToTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { playerId } = req.body;
        if (!playerId) {
            return res.status(400).json({
                success: false,
                message: "Player ID is required",
            });
        }
        const team = await team_model_1.default.findByIdAndUpdate(id, {
            $addToSet: { players: playerId },
            $set: { updatedAt: new Date() },
        }, { new: true }).populate('players');
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to add player to team"),
        });
    }
};
exports.addPlayerToTeam = addPlayerToTeam;
// DELETE /api/teams/:id/players/:playerId (remove player from team)
const removePlayerFromTeam = async (req, res) => {
    try {
        const { id, playerId } = req.params;
        const team = await team_model_1.default.findByIdAndUpdate(id, {
            $pull: { players: playerId },
            $set: { updatedAt: new Date() },
        }, { new: true }).populate('players');
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to remove player from team"),
        });
    }
};
exports.removePlayerFromTeam = removePlayerFromTeam;
