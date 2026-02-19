"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetricTrends = exports.getOverviewMetrics = exports.getPlayerMetrics = exports.getHeadToHeadMetrics = exports.getSeasonMetrics = exports.getDashboardMetrics = void 0;
const lib_1 = require("../../lib");
const player_interface_1 = require("../../types/player.interface");
const match_model_1 = __importDefault(require("../matches/match.model"));
const player_model_1 = __importDefault(require("../players/player.model"));
const match_1 = require("../../lib/compute/match");
// GET /api/metrics/dashboard
const getDashboardMetrics = async (req, res) => {
    try {
        // Get all completed matches
        const matches = await match_model_1.default.find({ status: 'FT' })
            .populate('opponent')
            .populate('goals')
            .populate('cards')
            .populate('injuries')
            .lean();
        // Calculate match metrics
        const matchMetrics = matches?.map(m => (0, match_1.checkMatchMetrics)(m));
        const matchStats = {
            wins: matchMetrics?.filter(m => m?.winStatus === 'win') || [],
            draws: matchMetrics?.filter(m => m?.winStatus === 'draw') || [],
            losses: matchMetrics?.filter(m => m?.winStatus === 'loss') || [],
        };
        const winRate = matchMetrics?.length > 0
            ? ((matchStats.wins.length / matchMetrics.length) * 100).toPrecision(3)
            : '0';
        // Calculate goals
        const goalsScored = matchMetrics?.reduce((total, mm) => total + (mm.goals?.kfc?.length || 0), 0) || 0;
        const goalsConceded = matchMetrics?.reduce((total, mm) => total + (mm.goals?.opponent?.length || 0), 0) || 0;
        // Get active players count
        const activePlayers = await player_model_1.default.countDocuments({
            status: player_interface_1.EPlayerStatus.CURRENT
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch dashboard metrics"),
        });
    }
};
exports.getDashboardMetrics = getDashboardMetrics;
// GET /api/metrics/season/:season
const getSeasonMetrics = async (req, res) => {
    try {
        const { season } = req.params;
        const matches = await match_model_1.default.find({
            status: 'FT',
            season
        })
            .populate('opponent')
            .populate('goals')
            .lean();
        const matchMetrics = matches?.map(m => (0, match_1.checkMatchMetrics)(m));
        const matchStats = {
            wins: matchMetrics?.filter(m => m?.winStatus === 'win') || [],
            draws: matchMetrics?.filter(m => m?.winStatus === 'draw') || [],
            losses: matchMetrics?.filter(m => m?.winStatus === 'loss') || [],
        };
        const winRate = matchMetrics?.length > 0
            ? ((matchStats.wins.length / matchMetrics.length) * 100).toPrecision(3)
            : '0';
        const goalsScored = matchMetrics?.reduce((total, mm) => total + (mm.goals?.kfc?.length || 0), 0) || 0;
        const goalsConceded = matchMetrics?.reduce((total, mm) => total + (mm.goals?.opponent?.length || 0), 0) || 0;
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch season metrics"),
        });
    }
};
exports.getSeasonMetrics = getSeasonMetrics;
// GET /api/metrics/head-to-head/:opponentId
const getHeadToHeadMetrics = async (req, res) => {
    try {
        const { opponentId } = req.params;
        const matches = await match_model_1.default.find({
            opponent: opponentId,
            status: 'FT'
        })
            .populate('opponent')
            .populate('goals')
            .lean();
        const matchMetrics = matches?.map(m => (0, match_1.checkMatchMetrics)(m));
        const stats = {
            wins: matchMetrics?.filter(m => m?.winStatus === 'win') || [],
            draws: matchMetrics?.filter(m => m?.winStatus === 'draw') || [],
            losses: matchMetrics?.filter(m => m?.winStatus === 'loss') || [],
        };
        const goalsScored = matchMetrics?.reduce((total, mm) => total + (mm.goals?.kfc?.length || 0), 0) || 0;
        const goalsConceded = matchMetrics?.reduce((total, mm) => total + (mm.goals?.opponent?.length || 0), 0) || 0;
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch head-to-head metrics"),
        });
    }
};
exports.getHeadToHeadMetrics = getHeadToHeadMetrics;
// GET /api/metrics/player/:playerId
const getPlayerMetrics = async (req, res) => {
    try {
        const { playerId } = req.params;
        const player = await player_model_1.default.findById(playerId)
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
                        yellow: player.cards?.filter((c) => c.type === 'yellow').length || 0,
                        red: player.cards?.filter((c) => c.type === 'red').length || 0,
                        total: player.cards?.length || 0,
                    },
                    injuries: player.injuries?.length || 0,
                    mvps: player.mvps?.length || 0,
                    appearances: player.stats?.appearances || 0,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch player metrics"),
        });
    }
};
exports.getPlayerMetrics = getPlayerMetrics;
// GET /api/metrics/overview
const getOverviewMetrics = async (req, res) => {
    try {
        // Get all completed matches
        const matches = await match_model_1.default.find({ status: 'FT' })
            .populate('opponent')
            .populate('goals')
            .lean();
        const matchMetrics = matches?.map(m => (0, match_1.checkMatchMetrics)(m));
        // Calculate match statistics
        const matchStats = {
            wins: matchMetrics?.filter(m => m?.winStatus === 'win') || [],
            draws: matchMetrics?.filter(m => m?.winStatus === 'draw') || [],
            losses: matchMetrics?.filter(m => m?.winStatus === 'loss') || [],
        };
        // Get player statistics
        const playerStats = await player_model_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch overview metrics"),
        });
    }
};
exports.getOverviewMetrics = getOverviewMetrics;
// GET /api/metrics/trends
const getMetricTrends = async (req, res) => {
    try {
        const { months = 6 } = req.query;
        const numMonths = Number(months);
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - numMonths);
        const matches = await match_model_1.default.find({
            status: 'FT',
            date: { $gte: startDate }
        })
            .populate('goals')
            .sort({ date: 1 })
            .lean();
        // Group by month
        const monthlyTrends = matches.reduce((acc, match) => {
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
            const metrics = (0, match_1.checkMatchMetrics)(match);
            acc[monthYear].matches++;
            if (metrics.winStatus === 'win')
                acc[monthYear].wins++;
            if (metrics.winStatus === 'draw')
                acc[monthYear].draws++;
            if (metrics.winStatus === 'loss')
                acc[monthYear].losses++;
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch metric trends"),
        });
    }
};
exports.getMetricTrends = getMetricTrends;
