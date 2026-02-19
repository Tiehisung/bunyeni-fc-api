// controllers/metrics.controller.ts
import type { Request, Response } from "express";
import { getErrorMessage } from "../../lib";
import { IMatch } from "../../types/match.interface";
import { EPlayerStatus } from "../../types/player.interface";
import MatchModel from "../matches/match.model";
import PlayerModel from "../players/player.model";
import { checkMatchMetrics } from "../../lib/compute/match";
 

// GET /api/metrics/dashboard
export const getDashboardMetrics = async (req: Request, res: Response) => {
    try {
        // Get all completed matches
        const matches = await MatchModel.find({ status: 'FT' })
            .populate('opponent')
            .populate('goals')
            .populate('cards')
            .populate('injuries')
            .lean() as IMatch[];

        // Calculate match metrics
        const matchMetrics = matches?.map(m => checkMatchMetrics(m));

        const matchStats = {
            wins: matchMetrics?.filter(m => m?.winStatus === 'win') || [],
            draws: matchMetrics?.filter(m => m?.winStatus === 'draw') || [],
            losses: matchMetrics?.filter(m => m?.winStatus === 'loss') || [],
        };

        const winRate = matchMetrics?.length > 0
            ? ((matchStats.wins.length / matchMetrics.length) * 100).toPrecision(3)
            : '0';

        // Calculate goals
        const goalsScored = matchMetrics?.reduce((total, mm) =>
            total + (mm.goals?.kfc?.length || 0), 0) || 0;

        const goalsConceded = matchMetrics?.reduce((total, mm) =>
            total + (mm.goals?.opponent?.length || 0), 0) || 0;

        // Get active players count
        const activePlayers = await PlayerModel.countDocuments({
            status: EPlayerStatus.CURRENT
        });

        // Get recent form (last 5 matches)
        const recentMatches = matchMetrics?.slice(0, 5).map(m => ({
            result: m.winStatus,
            // score: m.score,
            // opponent: m.opponent,
        })) || [];

        res.status(200).json({
            success: true,
            data: {
                activePlayers,
                matchStats: {
                    wins: matchStats.wins.length,
                    draws: matchStats.draws.length,
                    losses: matchStats.losses.length,
                    totalMatches: matchMetrics.length || 0,
                    winRate: winRate + '%',
                    goalsScored,
                    goalsConceded,
                    goalDifference: goalsScored - goalsConceded,
                    metrics: matchMetrics,
                    recentForm: recentMatches,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch dashboard metrics"),
        });
    }
};

// GET /api/metrics/season/:season
export const getSeasonMetrics = async (req: Request, res: Response) => {
    try {
        const { season } = req.params;

        const matches = await MatchModel.find({
            status: 'FT',
            season
        })
            .populate('opponent')
            .populate('goals')
            .lean() as IMatch[];

        const matchMetrics = matches?.map(m => checkMatchMetrics(m));

        const matchStats = {
            wins: matchMetrics?.filter(m => m?.winStatus === 'win') || [],
            draws: matchMetrics?.filter(m => m?.winStatus === 'draw') || [],
            losses: matchMetrics?.filter(m => m?.winStatus === 'loss') || [],
        };

        const winRate = matchMetrics?.length > 0
            ? ((matchStats.wins.length / matchMetrics.length) * 100).toPrecision(3)
            : '0';

        const goalsScored = matchMetrics?.reduce((total, mm) =>
            total + (mm.goals?.kfc?.length || 0), 0) || 0;

        const goalsConceded = matchMetrics?.reduce((total, mm) =>
            total + (mm.goals?.opponent?.length || 0), 0) || 0;

        res.status(200).json({
            success: true,
            data: {
                season,
                matchStats: {
                    wins: matchStats.wins.length,
                    draws: matchStats.draws.length,
                    losses: matchStats.losses.length,
                    totalMatches: matchMetrics.length || 0,
                    winRate: winRate + '%',
                    goalsScored,
                    goalsConceded,
                    goalDifference: goalsScored - goalsConceded,
                    metrics: matchMetrics,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch season metrics"),
        });
    }
};

// GET /api/metrics/head-to-head/:opponentId
export const getHeadToHeadMetrics = async (req: Request, res: Response) => {
    try {
        const { opponentId } = req.params;

        const matches = await MatchModel.find({
            opponent: opponentId,
            status: 'FT'
        })
            .populate('opponent')
            .populate('goals')
            .lean() as IMatch[];

        const matchMetrics = matches?.map(m => checkMatchMetrics(m));

        const stats = {
            wins: matchMetrics?.filter(m => m?.winStatus === 'win') || [],
            draws: matchMetrics?.filter(m => m?.winStatus === 'draw') || [],
            losses: matchMetrics?.filter(m => m?.winStatus === 'loss') || [],
        };

        const goalsScored = matchMetrics?.reduce((total, mm) =>
            total + (mm.goals?.kfc?.length || 0), 0) || 0;

        const goalsConceded = matchMetrics?.reduce((total, mm) =>
            total + (mm.goals?.opponent?.length || 0), 0) || 0;

        res.status(200).json({
            success: true,
            data: {
                opponent: matches[0]?.opponent,
                totalMatches: matches.length,
                wins: stats.wins.length,
                draws: stats.draws.length,
                losses: stats.losses.length,
                winRate: matches.length > 0
                    ? ((stats.wins.length / matches.length) * 100).toPrecision(3) + '%'
                    : '0%',
                goalsScored,
                goalsConceded,
                goalDifference: goalsScored - goalsConceded,
                matches: matchMetrics,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch head-to-head metrics"),
        });
    }
};

// GET /api/metrics/player/:playerId
export const getPlayerMetrics = async (req: Request, res: Response) => {
    try {
        const { playerId } = req.params;

        const player = await PlayerModel.findById(playerId)
            .populate('goals')
            .populate('assists')
            .populate('cards')
            .populate('injuries')
            .populate('mvps')
            .lean();

        if (!player) {
            return res.status(404).json({
                success: false,
                message: "Player not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                player: {
                    id: player._id,
                    name: `${player.firstName} ${player.lastName}`,
                    number: player.number,
                    position: player.position,
                },
                stats: {
                    goals: player.goals?.length || 0,
                    assists: player.assists?.length || 0,
                    goalContributions: (player.goals?.length || 0) + (player.assists?.length || 0),
                    cards: {
                        yellow: player.cards?.filter((c: any) => c.type === 'yellow').length || 0,
                        red: player.cards?.filter((c: any) => c.type === 'red').length || 0,
                        total: player.cards?.length || 0,
                    },
                    injuries: player.injuries?.length || 0,
                    mvps: player.mvps?.length || 0,
                    appearances: player.stats?.appearances || 0,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch player metrics"),
        });
    }
};

// GET /api/metrics/overview
export const getOverviewMetrics = async (req: Request, res: Response) => {
    try {
        // Get all completed matches
        const matches = await MatchModel.find({ status: 'FT' })
            .populate('opponent')
            .populate('goals')
            .lean() as IMatch[];

        const matchMetrics = matches?.map(m => checkMatchMetrics(m));

        // Calculate match statistics
        const matchStats = {
            wins: matchMetrics?.filter(m => m?.winStatus === 'win') || [],
            draws: matchMetrics?.filter(m => m?.winStatus === 'draw') || [],
            losses: matchMetrics?.filter(m => m?.winStatus === 'loss') || [],
        };

        // Get player statistics
        const playerStats = await PlayerModel.aggregate([
            {
                $facet: {
                    totalPlayers: [{ $count: "count" }],
                    byPosition: [
                        {
                            $group: {
                                _id: "$position",
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    topScorers: [
                        {
                            $lookup: {
                                from: "goals",
                                localField: "goals",
                                foreignField: "_id",
                                as: "goalDetails",
                            },
                        },
                        {
                            $addFields: {
                                goalCount: { $size: "$goalDetails" },
                            },
                        },
                        {
                            $sort: { goalCount: -1 }
                        },
                        {
                            $limit: 5
                        },
                        {
                            $project: {
                                name: { $concat: ["$firstName", " ", "$lastName"] },
                                number: 1,
                                position: 1,
                                goalCount: 1,
                            },
                        },
                    ],
                    topAssists: [
                        {
                            $lookup: {
                                from: "goals",
                                localField: "assists",
                                foreignField: "_id",
                                as: "assistDetails",
                            },
                        },
                        {
                            $addFields: {
                                assistCount: { $size: "$assistDetails" },
                            },
                        },
                        {
                            $sort: { assistCount: -1 }
                        },
                        {
                            $limit: 5
                        },
                        {
                            $project: {
                                name: { $concat: ["$firstName", " ", "$lastName"] },
                                number: 1,
                                position: 1,
                                assistCount: 1,
                            },
                        },
                    ],
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                matches: {
                    total: matches.length,
                    wins: matchStats.wins.length,
                    draws: matchStats.draws.length,
                    losses: matchStats.losses.length,
                    winRate: matches.length > 0
                        ? ((matchStats.wins.length / matches.length) * 100).toPrecision(3) + '%'
                        : '0%',
                },
                players: {
                    total: playerStats[0]?.totalPlayers[0]?.count || 0,
                    byPosition: playerStats[0]?.byPosition || [],
                    topScorers: playerStats[0]?.topScorers || [],
                    topAssists: playerStats[0]?.topAssists || [],
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch overview metrics"),
        });
    }
};

// GET /api/metrics/trends
export const getMetricTrends = async (req: Request, res: Response) => {
    try {
        const { months = 6 } = req.query;
        const numMonths = Number(months);

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - numMonths);

        const matches = await MatchModel.find({
            status: 'FT',
            date: { $gte: startDate }
        })
            .populate('goals')
            .sort({ date: 1 })
            .lean() as IMatch[];

        // Group by month
        const monthlyTrends = matches.reduce((acc: any, match) => {
            const date = new Date(match.date);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!acc[monthYear]) {
                acc[monthYear] = {
                    month: monthYear,
                    matches: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    goalsScored: 0,
                    goalsConceded: 0,
                };
            }

            const metrics = checkMatchMetrics(match);

            acc[monthYear].matches++;
            if (metrics.winStatus === 'win') acc[monthYear].wins++;
            if (metrics.winStatus === 'draw') acc[monthYear].draws++;
            if (metrics.winStatus === 'loss') acc[monthYear].losses++;
            acc[monthYear].goalsScored += metrics.goals?.kfc?.length || 0;
            acc[monthYear].goalsConceded += metrics.goals?.opponent?.length || 0;

            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                trends: Object.values(monthlyTrends),
                period: `${numMonths} months`,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch metric trends"),
        });
    }
};