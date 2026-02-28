// controllers/match.controller.ts
import { Request, Response } from "express";

//For populating related data, you can import other models as needed
import '../../shared/models.imports'

import { removeEmptyKeys, slugify } from "../../lib";
import { slugIdFilters } from "../../lib/slug";
import { formatDate } from "../../lib/timeAndDate";
import { EArchivesCollection } from "../../types/archive.interface";
import { ELogSeverity } from "../../types/log.interface";
import { EMatchStatus } from "../../types/match.interface";
import { saveToArchive } from "../archives/helper";
import { logAction } from "../log/helper";
import MatchModel, { IPostMatch } from "./match.model";
import PlayerModel from "../../modules/players/player.model";
import mongoose from "mongoose";
console.log('Registered models:', mongoose.modelNames());



// GET /api/matches
export const getMatches = async (req: Request, res: Response) => {
    try {
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "10", 10);
        const skip = (page - 1) * limit;

        const status = req.query.status as EMatchStatus;
        const search = (req.query.match_search as string) || "";
        const fixtureType = (req.query.fixture as string) || "";
        const competition = req.query.competition as string;
        const season = req.query.season as string;
        const teamId = req.query.teamId as string;
        const fromDate = req.query.fromDate as string;
        const toDate = req.query.toDate as string;

        const regex = new RegExp(search, "i");

        const query: Record<string, any> = {};

        // Fixture type filter
        if (fixtureType === 'home') query.isHome = true;
        if (fixtureType === 'away') query.isHome = false;

        // Status filter
        if (status) query.status = status;

        // Competition filter
        if (competition) query.competition = competition;

        // Season filter
        if (season) query.season = season;

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
            if (fromDate) query.date.$gte = new Date(fromDate);
            if (toDate) query.date.$lte = new Date(toDate);
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

        const cleanedFilters = removeEmptyKeys(query);



        const matches = await MatchModel.find(cleanedFilters)
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

        const total = await MatchModel.countDocuments(cleanedFilters);

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch matches",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};



// GET /api/matches/upcoming
export const getUpcomingMatches = async (req: Request, res: Response) => {
    try {
        const limit = Number.parseInt(req.query.limit as string || "5", 10);

        const matches = await MatchModel.find({
            status: { $in: [EMatchStatus.LIVE, EMatchStatus.UPCOMING] },
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch upcoming matches",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// GET /api/matches/recent
export const getRecentMatches = async (req: Request, res: Response) => {
    try {
        const limit = Number.parseInt(req.query.limit as string || "5", 10);

        const matches = await MatchModel.find({
            status: EMatchStatus.FT,
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch recent matches",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
// GET /api/matches/live
export const getLiveMatch = async (req: Request, res: Response) => {
    try {
        const today = new Date().toISOString().split("T")[0]; // "2025-10-18"

        const match = await MatchModel.findOne({
            $or: [
                { date: today },
                { date: new Date().toISOString() },
                { status: "LIVE" }
            ]
        }).populate({ path: "opponent", })
            .populate({ path: "squad", })
            .populate({ path: "goals", })
            .lean()

        res.status(200).json({
            success: true,
            data: match,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch live match",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
// Post /api/matches/go-live
export const goLiveMatch = async (req: Request, res: Response) => {
    try {
        const { _id, playerIds } = req.body;

        await MatchModel.findByIdAndUpdate(_id, {
            $set: { status: EMatchStatus.LIVE },
        });

        //Update match in Every Player
        for (const id of playerIds) {
            await PlayerModel.findByIdAndUpdate(id, { $push: { matches: id } })
        }
        res.status(200).json({ message: "Match is live now", success: true });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to set match live ",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
// PUT /api/matches/live
export const updateLiveMatchEvents = async (req: Request, res: Response) => {
    try {


        const { matchId, event } = req.body

        await MatchModel.findByIdAndUpdate(matchId, {
            $push: { events: event },
        });

        res.status(200).json({ message: "Match Event updated", success: true });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update match event",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// GET /api/matches/season/:season
export const getMatchesBySeason = async (req: Request, res: Response) => {
    try {
        const { season } = req.params;
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "20", 10);
        const skip = (page - 1) * limit;

        const matches = await MatchModel.find({ season })
            .populate({ path: "opponent" })
            .sort({ date: "desc" })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await MatchModel.countDocuments({ season });

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch matches by season",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// POST /api/matches
export const createMatch = async (req: Request, res: Response) => {
    try {
        const formdata: IPostMatch = req.body;

        // Generate slug from title and date
        const slug = slugify(`${formdata?.title}-${formdata?.date}`, false);

        const saved = await MatchModel.create({
            ...formdata,
            slug,
            // createdBy: req.user?.id,
            createdAt: new Date(),
        });

        // Log action
        await logAction({
            title: `Match created - [${saved?.title}]`,
            description: `A match item (${saved?.title}) created on ${formatDate(new Date().toISOString()) ?? ''}.`,
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
    } catch (error) {
        res.status(500).json({
            message: "Failed to create match",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const updateMatchStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!Object.values(EMatchStatus).includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value",
            });
        }

        const updated = await MatchModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    status,
                    updatedAt: new Date(),
                    // updatedBy: req.user?.id,
                }
            },
            { new: true }
        );

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
    } catch (error) {
        res.status(500).json({
            message: "Failed to update match status",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// PATCH /api/matches/:id/result
export const updateMatchResult = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { homeScore, awayScore, result } = req.body;

        const updated = await MatchModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    homeScore,
                    awayScore,
                    result,
                    status: EMatchStatus.FT,
                    updatedAt: new Date(),
                    // updatedBy: req.user?.id,
                }
            },
            { new: true }
        );

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
    } catch (error) {
        res.status(500).json({
            message: "Failed to update match result",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// 
// GET /api/matches/stats
export const getMatchStats = async (req: Request, res: Response) => {
    try {
        const stats = await MatchModel.aggregate([
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
                                status: EMatchStatus.FT,
                                $expr: { $gt: ["$homeScore", "$awayScore"] }
                            }
                        },
                        { $count: "count" }
                    ],
                    awayWins: [
                        {
                            $match: {
                                status: EMatchStatus.FT,
                                $expr: { $lt: ["$homeScore", "$awayScore"] }
                            }
                        },
                        { $count: "count" }
                    ],
                    draws: [
                        {
                            $match: {
                                status: EMatchStatus.FT,
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch match statistics",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};


// controllers/match.controller.ts (Add these to your existing match controller)

// GET /api/matches/:slug
export const getMatch = async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug as string;
        const filter = slugIdFilters(slug);

        const match = await MatchModel.findOne(filter)
            .populate({ path: "opponent",  })
            .populate({ path: "goals", })
            .populate({ path: "squad", })
            .populate({ path: "cards", })
            .populate({ path: "injuries", })
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch match",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// PUT /api/matches/:slug
export const updateMatch = async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug as string;
        const filter = slugIdFilters(slug);
        const body = req.body;

        // Remove _id from updates if present
        delete body._id;

        // Find and update the match
        const updated = await MatchModel.findOneAndUpdate(
            filter,
            {
                $set: {
                    ...body,
                    updatedAt: new Date(),
                    // updatedBy: req.user?.id,
                }
            },
            { new: true, runValidators: true }
        )
            .populate({ path: "opponent",   })
            .populate({ path: "goals" })
            .populate({ path: "squad" });

        if (!updated) {
            return res.status(404).json({
                message: "Match not found",
                success: false
            });
        }

        // Log the update
        await logAction({
            title: `Match updated - [${updated.title}]`,
            description: `Match details updated on ${formatDate(new Date().toISOString())}`,
            severity: ELogSeverity.INFO,
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
    } catch (error) {
        res.status(500).json({
            message: "Update failed",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// PATCH /api/matches/:slug (partial updates)
export const patchMatch = async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug as string;
        const filter = slugIdFilters(slug);
        const updates = req.body;

        // Remove undefined fields
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined || updates[key] === null) {
                delete updates[key];
            }
        });

        // Remove _id if present
        delete updates._id;

        const updated = await MatchModel.findOneAndUpdate(
            filter,
            {
                $set: {
                    ...updates,
                    updatedAt: new Date(),
                    // updatedBy: req.user?.id,
                }
            },
            { new: true, runValidators: true }
        )
            .populate({ path: "opponent",   })
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
    } catch (error) {
        res.status(500).json({
            message: "Update failed",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// DELETE /api/matches/:slug
export const deleteMatch = async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug as string;
        const filter = slugIdFilters(slug);

        // Find and delete the match
        const deleted = await MatchModel.findOneAndDelete(filter).lean();

        if (!deleted) {
            return res.status(404).json({
                message: "Match not found",
                success: false
            });
        }

        // Save to archive
        await saveToArchive(deleted, EArchivesCollection.MATCHES, '', req,);

        // Log the deletion
        await logAction({
            title: `Match deleted - [${deleted?.title}]`,
            description: `Match item (${deleted?.title}) deleted on ${formatDate(new Date().toISOString()) ?? ''}.`,
            severity: ELogSeverity.CRITICAL,
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
    } catch (error) {
        console.error("Delete match error:", error);
        res.status(500).json({
            message: "Delete failed",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// POST /api/matches/:slug/goals (add goal to match)
export const addGoalToMatch = async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug as string;
        const filter = slugIdFilters(slug);
        const goalData = req.body;

        const match = await MatchModel.findOne(filter);
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add goal",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// POST /api/matches/:slug/cards (add card to match)
export const addCardToMatch = async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug as string;
        const filter = slugIdFilters(slug);
        const cardData = req.body;

        const match = await MatchModel.findOne(filter);
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add card",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// POST /api/matches/:slug/injuries (add injury to match)
export const addInjuryToMatch = async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug as string;
        const filter = slugIdFilters(slug);
        const injuryData = req.body;

        const match = await MatchModel.findOne(filter);
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to record injury",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// POST /api/matches/:slug/mvp (set MVP for match)
export const setMatchMVP = async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug as string;
        const filter = slugIdFilters(slug);
        const { playerId } = req.body;

        const match = await MatchModel.findOneAndUpdate(
            filter,
            {
                $set: {
                    mvp: playerId,
                    updatedAt: new Date(),
                    // updatedBy: req.user?.id,
                }
            },
            { new: true }
        ).populate('mvp');

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to set MVP",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};