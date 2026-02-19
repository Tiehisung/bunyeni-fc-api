"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMatchMVP = exports.addInjuryToMatch = exports.addCardToMatch = exports.addGoalToMatch = exports.deleteMatchBySlugOrId = exports.patchMatchBySlugOrId = exports.updateMatchBySlugOrId = exports.getMatchBySlugOrId = exports.getMatchStats = exports.deleteMatch = exports.updateMatchResult = exports.updateMatchStatus = exports.updateMatch = exports.createMatch = exports.getMatchesBySeason = exports.updateLiveMatchEvents = exports.goLiveMatch = exports.getLiveMatch = exports.getRecentMatches = exports.getUpcomingMatches = exports.getMatches = void 0;
const lib_1 = require("../../lib");
const slug_1 = require("../../lib/slug");
const timeAndDate_1 = require("../../lib/timeAndDate");
const archive_interface_1 = require("../../types/archive.interface");
const log_interface_1 = require("../../types/log.interface");
const match_interface_1 = require("../../types/match.interface");
const helper_1 = require("../archives/helper");
const helper_2 = require("../logs/helper");
const match_model_1 = __importDefault(require("./match.model"));
//For populating related data, you can import other models as needed
require("../../modules/teams/team.model");
require("../media/files/file.model");
require("../../modules/players/player.model");
require("./goals/goals.model");
const player_model_1 = __importDefault(require("../../modules/players/player.model"));
// GET /api/matches
const getMatches = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const status = req.query.status;
        const search = req.query.match_search || "";
        const fixtureType = req.query.fixture || "";
        const competition = req.query.competition;
        const season = req.query.season;
        const teamId = req.query.teamId;
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        const regex = new RegExp(search, "i");
        const query = {};
        // Fixture type filter
        if (fixtureType === 'home')
            query.isHome = true;
        if (fixtureType === 'away')
            query.isHome = false;
        // Status filter
        if (status)
            query.status = status;
        // Competition filter
        if (competition)
            query.competition = competition;
        // Season filter
        if (season)
            query.season = season;
        // Team filter (if looking for matches involving a specific team)
        if (teamId) {
            query.$or = [
                { opponent: teamId },
                { 'squad.team': teamId }
            ];
        }
        // Date range filter
        if (fromDate || toDate) {
            query.date = {};
            if (fromDate)
                query.date.$gte = new Date(fromDate);
            if (toDate)
                query.date.$lte = new Date(toDate);
        }
        // Search filter
        if (search) {
            query.$or = [
                ...(query.$or || []),
                { "title": regex },
                { "competition": regex },
                { "venue": regex },
            ];
        }
        const cleanedFilters = (0, lib_1.removeEmptyKeys)(query);
        const matches = await match_model_1.default.find(cleanedFilters)
            .populate({ path: "opponent" })
            .populate({ path: "squad" })
            .populate({ path: "goals" })
            .populate({ path: "cards" })
            .populate({ path: "injuries" })
            .populate({ path: "mvp" })
            .limit(limit)
            .skip(skip)
            .lean()
            .sort({ date: "desc" });
        const total = await match_model_1.default.countDocuments(cleanedFilters);
        res.status(200).json({
            success: true,
            data: matches,
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
            message: "Failed to fetch matches",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getMatches = getMatches;
// GET /api/matches/upcoming
const getUpcomingMatches = async (req, res) => {
    try {
        const limit = Number.parseInt(req.query.limit || "5", 10);
        const matches = await match_model_1.default.find({
            status: { $in: [match_interface_1.EMatchStatus.LIVE, match_interface_1.EMatchStatus.UPCOMING] },
            date: { $gte: new Date() }
        })
            .populate({ path: "opponent" })
            .sort({ date: "asc" })
            .limit(limit)
            .lean();
        res.status(200).json({
            success: true,
            data: matches,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch upcoming matches",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getUpcomingMatches = getUpcomingMatches;
// GET /api/matches/recent
const getRecentMatches = async (req, res) => {
    try {
        const limit = Number.parseInt(req.query.limit || "5", 10);
        const matches = await match_model_1.default.find({
            status: match_interface_1.EMatchStatus.FT,
            date: { $lte: new Date() }
        })
            .populate({ path: "opponent" })
            .populate({ path: "goals" })
            .sort({ date: "desc" })
            .limit(limit)
            .lean();
        res.status(200).json({
            success: true,
            data: matches,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch recent matches",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getRecentMatches = getRecentMatches;
// GET /api/matches/live
const getLiveMatch = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0]; // "2025-10-18"
        const match = await match_model_1.default.findOne({
            $or: [
                { date: today },
                { date: new Date().toISOString() },
                { status: "LIVE" }
            ]
        }).populate({ path: "opponent", })
            .populate({ path: "squad", })
            .populate({ path: "goals", })
            .lean();
        res.status(200).json({
            success: true,
            data: match,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch live match",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getLiveMatch = getLiveMatch;
// Post /api/matches/go-live
const goLiveMatch = async (req, res) => {
    try {
        const { _id, playerIds } = req.body;
        await match_model_1.default.findByIdAndUpdate(_id, {
            $set: { status: match_interface_1.EMatchStatus.LIVE },
        });
        //Update match in Every Player
        for (const id of playerIds) {
            await player_model_1.default.findByIdAndUpdate(id, { $push: { matches: id } });
        }
        res.status(200).json({ message: "Match is live now", success: true });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to set match live ",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.goLiveMatch = goLiveMatch;
// PUT /api/matches/live
const updateLiveMatchEvents = async (req, res) => {
    try {
        const { matchId, event } = req.body;
        await match_model_1.default.findByIdAndUpdate(matchId, {
            $push: { events: event },
        });
        res.status(200).json({ message: "Match Event updated", success: true });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update match event",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.updateLiveMatchEvents = updateLiveMatchEvents;
// GET /api/matches/season/:season
const getMatchesBySeason = async (req, res) => {
    try {
        const { season } = req.params;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "20", 10);
        const skip = (page - 1) * limit;
        const matches = await match_model_1.default.find({ season })
            .populate({ path: "opponent" })
            .sort({ date: "desc" })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await match_model_1.default.countDocuments({ season });
        res.status(200).json({
            success: true,
            data: matches,
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
            message: "Failed to fetch matches by season",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getMatchesBySeason = getMatchesBySeason;
// POST /api/matches
const createMatch = async (req, res) => {
    try {
        const formdata = req.body;
        // Generate slug from title and date
        const slug = (0, lib_1.slugify)(`${formdata?.title}-${formdata?.date}`, false);
        const saved = await match_model_1.default.create({
            ...formdata,
            slug,
            createdBy: req.user?.id,
            createdAt: new Date(),
        });
        // Log action
        await (0, helper_2.logAction)({
            title: `Match created - [${saved?.title}]`,
            description: `A match item (${saved?.title}) created on ${(0, timeAndDate_1.formatDate)(new Date().toISOString()) ?? ''}.`,
            meta: {
                slug: saved._id,
                title: saved.title,
                date: saved.date,
                opponent: saved.opponent,
            },
        });
        res.status(201).json({
            message: "Fixture created successfully",
            success: true,
            data: saved,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to create match",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.createMatch = createMatch;
// PUT /api/matches/:id
const updateMatch = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        const updates = req.body;
        // Remove _id from updates if present
        delete updates._id;
        // If title or date changed, update slug
        if (updates.title || updates.date) {
            const existingMatch = await match_model_1.default.findOne(filter);
            if (existingMatch) {
                const newTitle = updates.title || existingMatch.title;
                const newDate = updates.date || existingMatch.date;
                updates.slug = (0, lib_1.slugify)(`${newTitle}-${newDate}`, false);
            }
        }
        const updated = await match_model_1.default.findOneAndUpdate(filter, {
            $set: {
                ...updates,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            }
        }, { new: true, runValidators: true });
        if (!updated) {
            return res.status(404).json({
                message: "Match not found",
                success: false
            });
        }
        // Log action
        await (0, helper_2.logAction)({
            title: `Match updated - [${updated.title}]`,
            description: `Match details updated`,
            meta: {
                slug: updated._id,
                updates: Object.keys(updates),
            },
        });
        res.status(200).json({
            message: "Match updated successfully",
            success: true,
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Update failed",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.updateMatch = updateMatch;
// PATCH /api/matches/:id/status
const updateMatchStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!Object.values(match_interface_1.EMatchStatus).includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value",
            });
        }
        const updated = await match_model_1.default.findByIdAndUpdate(id, {
            $set: {
                status,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            }
        }, { new: true });
        if (!updated) {
            return res.status(404).json({
                message: "Match not found",
                success: false
            });
        }
        res.status(200).json({
            message: "Match status updated successfully",
            success: true,
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to update match status",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.updateMatchStatus = updateMatchStatus;
// PATCH /api/matches/:id/result
const updateMatchResult = async (req, res) => {
    try {
        const { id } = req.params;
        const { homeScore, awayScore, result } = req.body;
        const updated = await match_model_1.default.findByIdAndUpdate(id, {
            $set: {
                homeScore,
                awayScore,
                result,
                status: match_interface_1.EMatchStatus.FT,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            }
        }, { new: true });
        if (!updated) {
            return res.status(404).json({
                message: "Match not found",
                success: false
            });
        }
        res.status(200).json({
            message: "Match result updated successfully",
            success: true,
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to update match result",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.updateMatchResult = updateMatchResult;
// DELETE /api/matches/:id
const deleteMatch = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        const deleted = await match_model_1.default.findOneAndDelete(filter);
        if (!deleted) {
            return res.status(404).json({
                message: "Match not found",
                success: false
            });
        }
        // Log action
        await (0, helper_2.logAction)({
            title: `Match deleted - [${deleted.title}]`,
            description: `Match was deleted`,
            severity: log_interface_1.ELogSeverity.CRITICAL,
            meta: {
                slug: deleted._id,
                title: deleted.title,
                date: deleted.date,
            },
        });
        res.status(200).json({
            message: "Match deleted successfully",
            success: true,
            data: { id: deleted._id, title: deleted.title },
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Delete failed",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteMatch = deleteMatch;
// GET /api/matches/stats
const getMatchStats = async (req, res) => {
    try {
        const stats = await match_model_1.default.aggregate([
            {
                $facet: {
                    totalMatches: [{ $count: "count" }],
                    byStatus: [
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    byCompetition: [
                        {
                            $group: {
                                _id: "$competition",
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { count: -1 } },
                        { $limit: 10 },
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
                    homeWins: [
                        {
                            $match: {
                                status: match_interface_1.EMatchStatus.FT,
                                $expr: { $gt: ["$homeScore", "$awayScore"] }
                            }
                        },
                        { $count: "count" }
                    ],
                    awayWins: [
                        {
                            $match: {
                                status: match_interface_1.EMatchStatus.FT,
                                $expr: { $lt: ["$homeScore", "$awayScore"] }
                            }
                        },
                        { $count: "count" }
                    ],
                    draws: [
                        {
                            $match: {
                                status: match_interface_1.EMatchStatus.FT,
                                $expr: { $eq: ["$homeScore", "$awayScore"] }
                            }
                        },
                        { $count: "count" }
                    ],
                },
            },
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalMatches: stats[0]?.totalMatches[0]?.count || 0,
                byStatus: stats[0]?.byStatus || [],
                byCompetition: stats[0]?.byCompetition || [],
                bySeason: stats[0]?.bySeason || [],
                results: {
                    homeWins: stats[0]?.homeWins[0]?.count || 0,
                    awayWins: stats[0]?.awayWins[0]?.count || 0,
                    draws: stats[0]?.draws[0]?.count || 0,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch match statistics",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getMatchStats = getMatchStats;
// controllers/match.controller.ts (Add these to your existing match controller)
// GET /api/matches/:slug
const getMatchBySlugOrId = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        const match = await match_model_1.default.findOne(filter)
            .populate({ path: "opponent", populate: { path: "logo" } })
            .populate({ path: "goals", populate: { path: "scorer assistant" } })
            .populate({ path: "squad", populate: { path: "players.player" } })
            .populate({ path: "cards", populate: { path: "player" } })
            .populate({ path: "injuries", populate: { path: "player" } })
            .populate({ path: "mvp" })
            .lean();
        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Match not found",
            });
        }
        res.status(200).json({
            success: true,
            data: match,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch match",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getMatchBySlugOrId = getMatchBySlugOrId;
// PUT /api/matches/:slug
const updateMatchBySlugOrId = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        const body = req.body;
        // Remove _id from updates if present
        delete body._id;
        // Find and update the match
        const updated = await match_model_1.default.findOneAndUpdate(filter, {
            $set: {
                ...body,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            }
        }, { new: true, runValidators: true })
            .populate({ path: "opponent", populate: { path: "logo" } })
            .populate({ path: "goals" })
            .populate({ path: "squad" });
        if (!updated) {
            return res.status(404).json({
                message: "Match not found",
                success: false
            });
        }
        // Log the update
        await (0, helper_2.logAction)({
            title: `Match updated - [${updated.title}]`,
            description: `Match details updated on ${(0, timeAndDate_1.formatDate)(new Date().toISOString())}`,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: {
                slug: updated._id,
                updates: Object.keys(body),
            },
        });
        res.status(200).json({
            message: "Match updated successfully",
            success: true,
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Update failed",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.updateMatchBySlugOrId = updateMatchBySlugOrId;
// PATCH /api/matches/:slug (partial updates)
const patchMatchBySlugOrId = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        const updates = req.body;
        // Remove undefined fields
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined || updates[key] === null) {
                delete updates[key];
            }
        });
        // Remove _id if present
        delete updates._id;
        const updated = await match_model_1.default.findOneAndUpdate(filter, {
            $set: {
                ...updates,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            }
        }, { new: true, runValidators: true })
            .populate({ path: "opponent", populate: { path: "logo" } })
            .populate({ path: "goals" })
            .populate({ path: "squad" });
        if (!updated) {
            return res.status(404).json({
                message: "Match not found",
                success: false
            });
        }
        res.status(200).json({
            message: "Match updated successfully",
            success: true,
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Update failed",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.patchMatchBySlugOrId = patchMatchBySlugOrId;
// DELETE /api/matches/:slug
const deleteMatchBySlugOrId = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        // Find and delete the match
        const deleted = await match_model_1.default.findOneAndDelete(filter).lean();
        if (!deleted) {
            return res.status(404).json({
                message: "Match not found",
                success: false
            });
        }
        // Save to archive
        await (0, helper_1.saveToArchive)({
            sourceCollection: archive_interface_1.EArchivesCollection.MATCHES,
            originalId: deleted._id?.toString(),
            data: {
                ...deleted,
                isLatest: false,
                deletedAt: new Date(),
                deletedBy: req.user?.id,
            },
            reason: 'Match deleted',
        });
        // Log the deletion
        await (0, helper_2.logAction)({
            title: `Match deleted - [${deleted?.title}]`,
            description: `Match item (${deleted?.title}) deleted on ${(0, timeAndDate_1.formatDate)(new Date().toISOString()) ?? ''}.`,
            severity: log_interface_1.ELogSeverity.CRITICAL,
            meta: {
                slug: deleted._id,
                title: deleted.title,
                date: deleted.date,
                opponent: deleted.opponent,
            },
        });
        res.status(200).json({
            message: "Match deleted successfully",
            success: true,
            data: {
                id: deleted._id,
                title: deleted.title,
            },
        });
    }
    catch (error) {
        console.error("Delete match error:", error);
        res.status(500).json({
            message: "Delete failed",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteMatchBySlugOrId = deleteMatchBySlugOrId;
// POST /api/matches/:slug/goals (add goal to match)
const addGoalToMatch = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        const goalData = req.body;
        const match = await match_model_1.default.findOne(filter);
        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Match not found",
            });
        }
        // Add goal to match (assuming goals are embedded or referenced)
        // This depends on your schema structure
        // Example for embedded goals:
        match.goals.push(goalData);
        await match.save();
        res.status(200).json({
            success: true,
            message: "Goal added successfully",
            data: match,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add goal",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.addGoalToMatch = addGoalToMatch;
// POST /api/matches/:slug/cards (add card to match)
const addCardToMatch = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        const cardData = req.body;
        const match = await match_model_1.default.findOne(filter);
        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Match not found",
            });
        }
        // Add card to match
        match.cards.push(cardData);
        await match.save();
        res.status(200).json({
            success: true,
            message: "Card added successfully",
            data: match,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add card",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.addCardToMatch = addCardToMatch;
// POST /api/matches/:slug/injuries (add injury to match)
const addInjuryToMatch = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        const injuryData = req.body;
        const match = await match_model_1.default.findOne(filter);
        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Match not found",
            });
        }
        // Add injury to match
        match.injuries.push(injuryData);
        await match.save();
        res.status(200).json({
            success: true,
            message: "Injury recorded successfully",
            data: match,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to record injury",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.addInjuryToMatch = addInjuryToMatch;
// POST /api/matches/:slug/mvp (set MVP for match)
const setMatchMVP = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        const { playerId } = req.body;
        const match = await match_model_1.default.findOneAndUpdate(filter, {
            $set: {
                mvp: playerId,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            }
        }, { new: true }).populate('mvp');
        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Match not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "MVP set successfully",
            data: match,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to set MVP",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.setMatchMVP = setMatchMVP;
