"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerLeaderboard = exports.getPlayerRankings = exports.getGlobalPlayerStats = exports.getPlayerSummary = exports.getPlayerStats = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const lib_1 = require("../../../lib");
const player_model_1 = __importDefault(require("../player.model"));
// GET /api/stats/players/:playerId
const getPlayerStats = async (req, res) => {
    try {
        const playerId = req.params.playerId;
        if (!mongoose_1.default.Types.ObjectId.isValid(playerId)) {
            return res.status(400).json({
                message: "Invalid player ID",
                success: false
            });
        }
        const player = await player_model_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(playerId),
                    isActive: true
                }
            },
            {
                $lookup: {
                    from: "goals",
                    localField: "goals",
                    foreignField: "_id",
                    as: "goalDetails"
                }
            },
            {
                $lookup: {
                    from: "matches",
                    localField: "matches",
                    foreignField: "_id",
                    as: "matchDetails"
                }
            },
            {
                $project: {
                    firstName: 1,
                    lastName: 1,
                    avatar: 1,
                    number: 1,
                    position: 1,
                    phone: 1,
                    email: 1,
                    height: 1,
                    weight: 1,
                    about: 1,
                    captaincy: 1,
                    manager: 1,
                    playRole: 1,
                    isActive: 1,
                    dateOfBirth: 1,
                    nationality: 1,
                    // Counts
                    goals: { $size: "$goals" },
                    assists: { $size: "$assists" },
                    matchesPlayed: { $size: "$matches" },
                    injuries: { $size: "$injuries" },
                    cards: { $size: "$cards" },
                    mvps: { $size: "$mvps" },
                    // Goal details by minute
                    goalsByMinute: {
                        $map: {
                            input: "$goalDetails",
                            as: "goal",
                            in: {
                                minute: "$$goal.minute",
                                match: "$$goal.match",
                                type: "$$goal.type",
                                opponent: "$$goal.opponent"
                            }
                        }
                    },
                    // Match history summary
                    matchesPlayedDetails: {
                        $map: {
                            input: "$matchDetails",
                            as: "match",
                            in: {
                                date: "$$match.date",
                                opponent: "$$match.opponent",
                                competition: "$$match.competition",
                                score: "$$match.score",
                                isHome: "$$match.isHome"
                            }
                        }
                    },
                    // Ratings
                    ratingAvg: {
                        $cond: [
                            { $gt: [{ $size: "$ratings" }, 0] },
                            { $avg: "$ratings.rating" },
                            0
                        ]
                    },
                    ratingCount: { $size: "$ratings" },
                    ratings: {
                        $slice: ["$ratings", -5] // Last 5 ratings
                    },
                    // Performance metrics
                    performanceScore: {
                        $add: [
                            { $multiply: [{ $size: "$goals" }, 4] },
                            { $multiply: [{ $size: "$assists" }, 3] },
                            { $multiply: [{ $size: "$mvps" }, 5] },
                            { $multiply: ["$ratingAvg", 2] }
                        ]
                    },
                    // Goal contributions per match
                    goalContributionPerMatch: {
                        $cond: [
                            { $gt: [{ $size: "$matches" }, 0] },
                            {
                                $divide: [
                                    { $add: [{ $size: "$goals" }, { $size: "$assists" }] },
                                    { $size: "$matches" }
                                ]
                            },
                            0
                        ]
                    },
                    // Card discipline
                    disciplineScore: {
                        $subtract: [
                            100,
                            { $multiply: [{ $size: "$cards" }, 10] }
                        ]
                    },
                    history: 1,
                    featureMedia: 1,
                }
            },
            { $limit: 1 }
        ]);
        if (!player.length) {
            return res.status(404).json({ error: "Player not found or inactive", success: false });
        }
        res.status(200).json({
            success: true,
            data: player[0]
        });
    }
    catch (error) {
        console.error("Player stats error:", error);
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch player stats"),
        });
    }
};
exports.getPlayerStats = getPlayerStats;
// GET /api/stats/players/:playerId/summary
const getPlayerSummary = async (req, res) => {
    try {
        const playerId = req.params.playerId;
        if (!mongoose_1.default.Types.ObjectId.isValid(playerId)) {
            return res.status(400).json({
                message: "Invalid player ID",
                success: false
            });
        }
        const player = await player_model_1.default.findById(playerId)
            .select('firstName lastName avatar number position goals assists matches injuries cards mvps ratings')
            .lean();
        if (!player) {
            return res.status(404).json({
                success: false,
                message: "Player not found"
            });
        }
        const stats = {
            basic: {
                name: `${player.firstName} ${player.lastName}`,
                number: player.number,
                position: player.position,
                avatar: player.avatar,
            },
            counts: {
                goals: player.goals?.length || 0,
                assists: player.assists?.length || 0,
                matches: player.matches?.length || 0,
                injuries: player.injuries?.length || 0,
                cards: player.cards?.length || 0,
                mvps: player.mvps?.length || 0,
            },
            ratings: {
                average: player.ratings?.length
                    ? player.ratings.reduce((sum, r) => sum + r.rating, 0) / player.ratings.length
                    : 0,
                count: player.ratings?.length || 0,
            },
            performance: {
                goalContributions: (player.goals?.length || 0) + (player.assists?.length || 0),
                contributionsPerMatch: player.matches?.length
                    ? ((player.goals?.length || 0) + (player.assists?.length || 0)) / player.matches.length
                    : 0,
            }
        };
        res.status(200).json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch player summary"),
        });
    }
};
exports.getPlayerSummary = getPlayerSummary;
// GET /api/stats/players/global
const getGlobalPlayerStats = async (req, res) => {
    try {
        // Fetch all active players once
        const players = await player_model_1.default.find({ isActive: true })
            .populate('goals')
            .populate('assists')
            .populate('matches')
            .populate('injuries')
            .populate('cards')
            .populate('mvps')
            .populate('ratings')
            .lean();
        const totalPlayers = players.length;
        // const activePlayers = players.filter(p => p.isActive).length;
        // const inactivePlayers = totalPlayers - activePlayers;
        // Injuries
        const totalInjuries = players.reduce((sum, p) => sum + (p.injuries?.length || 0), 0);
        const playersWithInjuries = players.filter(p => (p.injuries?.length || 0) > 0).length;
        const injuryRate = totalPlayers ? (playersWithInjuries / totalPlayers) * 100 : 0;
        // Goals, Assists, Matches
        const totalGoals = players.reduce((sum, p) => sum + (p.goals?.length || 0), 0);
        const totalAssists = players.reduce((sum, p) => sum + (p.assists?.length || 0), 0);
        const totalMatchesPlayed = players.reduce((sum, p) => sum + (p.matches?.length || 0), 0);
        const totalMVPs = players.reduce((sum, p) => sum + (p.mvp?.length || 0), 0);
        const totalCards = players.reduce((sum, p) => sum + (p.cards?.length || 0), 0);
        // Averages
        const avgGoals = totalPlayers ? Number((totalGoals / totalPlayers).toFixed(2)) : 0;
        const avgAssists = totalPlayers ? Number((totalAssists / totalPlayers).toFixed(2)) : 0;
        const avgMatches = totalPlayers ? Number((totalMatchesPlayed / totalPlayers).toFixed(2)) : 0;
        const avgMVPs = totalPlayers ? Number((totalMVPs / totalPlayers).toFixed(2)) : 0;
        // Position breakdown
        const byPosition = players.reduce((acc, player) => {
            const pos = player.position || 'Unknown';
            if (!acc[pos]) {
                acc[pos] = {
                    count: 0,
                    goals: 0,
                    assists: 0,
                    matches: 0,
                };
            }
            acc[pos].count++;
            acc[pos].goals += player.goals?.length || 0;
            acc[pos].assists += player.assists?.length || 0;
            acc[pos].matches += player.matches?.length || 0;
            return acc;
        }, {});
        // Player performance ranking
        const ranked = players
            .map((p) => {
            const g = p.goals?.length || 0;
            const a = p.assists?.length || 0;
            const mvp = p.mvp?.length || 0;
            const ratings = p.ratings?.map((r) => r.rating) || [];
            const ratingAvg = ratings.length > 0 ? ratings.reduce((s, r) => s + r, 0) / ratings.length : 0;
            const score = g * 4 + a * 3 + mvp * 5 + ratingAvg * 2;
            return {
                _id: p._id,
                name: `${p.firstName} ${p.lastName}`,
                avatar: p.avatar,
                number: p.number,
                position: p.position,
                goals: g,
                assists: a,
                matches: p.matches?.length || 0,
                mvps: mvp,
                ratingAvg: Number(ratingAvg.toFixed(2)),
                performanceScore: Number(score.toFixed(2)),
            };
        })
            .sort((a, b) => b.performanceScore - a.performanceScore);
        const topPerformers = ranked.slice(0, 10);
        // Insights
        const insights = {
            averagePerformanceScore: ranked.length
                ? Number((ranked.reduce((s, p) => s + p.performanceScore, 0) / ranked.length).toFixed(2))
                : 0,
            mostInjuredPlayer: players
                .map(p => ({
                id: p._id,
                name: `${p.firstName} ${p.lastName}`,
                injuries: p.injuries?.length || 0
            }))
                .sort((a, b) => b.injuries - a.injuries)[0] ?? null,
            highestScorer: ranked.sort((a, b) => b.goals - a.goals)[0] ?? null,
            topAssist: ranked.sort((a, b) => b.assists - a.assists)[0] ?? null,
            mostValuable: ranked.sort((a, b) => b.mvps - a.mvps)[0] ?? null,
            mostActive: ranked.sort((a, b) => b.matches - a.matches)[0] ?? null,
        };
        res.status(200).json({
            success: true,
            data: {
                totals: {
                    totalPlayers,
                    // activePlayers,
                    // inactivePlayers,
                    totalInjuries,
                    playersWithInjuries,
                    injuryRate: Number(injuryRate.toFixed(2)),
                    totalGoals,
                    totalAssists,
                    totalMatchesPlayed,
                    totalMVPs,
                    totalCards,
                },
                averages: {
                    avgGoals,
                    avgAssists,
                    avgMatches,
                    avgMVPs,
                },
                byPosition: Object.entries(byPosition).map(([position, stats]) => ({
                    position,
                    ...stats,
                    goalsPerPlayer: Number((stats.goals / stats.count).toFixed(2)),
                })),
                topPerformers,
                insights,
                rankings: {
                    topScorers: ranked.sort((a, b) => b.goals - a.goals).slice(0, 5),
                    topAssisters: ranked.sort((a, b) => b.assists - a.assists).slice(0, 5),
                    topMVPs: ranked.sort((a, b) => b.mvps - a.mvps).slice(0, 5),
                }
            },
        });
    }
    catch (error) {
        console.error("Global player stats error:", error);
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch global player stats"),
        });
    }
};
exports.getGlobalPlayerStats = getGlobalPlayerStats;
// GET /api/stats/players/rankings
const getPlayerRankings = async (req, res) => {
    try {
        const { category = 'performance', limit = 10 } = req.query;
        const numLimit = Number(limit);
        const players = await player_model_1.default.find({ isActive: true })
            .populate('goals')
            .populate('assists')
            .populate('mvps')
            .lean();
        let rankings = players.map((p) => {
            const base = {
                id: p._id,
                name: `${p.firstName} ${p.lastName}`,
                number: p.number,
                position: p.position,
                avatar: p.avatar,
            };
            switch (category) {
                case 'goals':
                    return {
                        ...base,
                        value: p.goals?.length || 0,
                    };
                case 'assists':
                    return {
                        ...base,
                        value: p.assists?.length || 0,
                    };
                case 'mvps':
                    return {
                        ...base,
                        value: p.mvps?.length || 0,
                    };
                case 'appearances':
                    return {
                        ...base,
                        value: p.matches?.length || 0,
                    };
                case 'performance':
                default:
                    const goals = p.goals?.length || 0;
                    const assists = p.assists?.length || 0;
                    const mvps = p.mvps?.length || 0;
                    return {
                        ...base,
                        value: goals * 4 + assists * 3 + mvps * 5,
                    };
            }
        });
        rankings = rankings.sort((a, b) => b.value - a.value).slice(0, numLimit);
        res.status(200).json({
            success: true,
            data: {
                category,
                rankings,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch player rankings"),
        });
    }
};
exports.getPlayerRankings = getPlayerRankings;
// GET /api/stats/players/leaderboard
const getPlayerLeaderboard = async (req, res) => {
    try {
        const leaderboard = await player_model_1.default.aggregate([
            { $match: { isActive: true } },
            {
                $lookup: {
                    from: "goals",
                    localField: "goals",
                    foreignField: "_id",
                    as: "goalDetails"
                }
            },
            {
                $lookup: {
                    from: "matches",
                    localField: "matches",
                    foreignField: "_id",
                    as: "matchDetails"
                }
            },
            {
                $project: {
                    name: { $concat: ["$firstName", " ", "$lastName"] },
                    number: 1,
                    position: 1,
                    avatar: 1,
                    goals: { $size: "$goalDetails" },
                    assists: { $size: "$assists" },
                    matches: { $size: "$matchDetails" },
                    mvps: { $size: "$mvps" },
                    goalContributions: {
                        $add: [{ $size: "$goalDetails" }, { $size: "$assists" }]
                    },
                    ratingAvg: {
                        $cond: [
                            { $gt: [{ $size: "$ratings" }, 0] },
                            { $avg: "$ratings.rating" },
                            0
                        ]
                    }
                }
            },
            {
                $facet: {
                    topScorers: [
                        { $sort: { goals: -1 } },
                        { $limit: 10 },
                        { $project: { value: "$goals", category: "Goals", _id: 0 } }
                    ],
                    topAssisters: [
                        { $sort: { assists: -1 } },
                        { $limit: 10 },
                        { $project: { value: "$assists", category: "Assists", _id: 0 } }
                    ],
                    mostValuable: [
                        { $sort: { mvps: -1 } },
                        { $limit: 10 },
                        { $project: { value: "$mvps", category: "MVPs", _id: 0 } }
                    ],
                    mostAppearances: [
                        { $sort: { matches: -1 } },
                        { $limit: 10 },
                        { $project: { value: "$matches", category: "Appearances", _id: 0 } }
                    ]
                }
            }
        ]);
        res.status(200).json({
            success: true,
            data: leaderboard[0] || {
                topScorers: [],
                topAssisters: [],
                mostValuable: [],
                mostAppearances: []
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch player leaderboard"),
        });
    }
};
exports.getPlayerLeaderboard = getPlayerLeaderboard;
