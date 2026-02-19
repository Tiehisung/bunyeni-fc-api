"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStreaks = exports.getFormGuide = exports.getHomeAwayStats = exports.getDetailedMatchStats = exports.getMatchStats = void 0;
const lib_1 = require("../../../lib");
const match_model_1 = __importDefault(require("../match.model"));
// GET /api/stats/matches
const getMatchStats = async (req, res) => {
    try {
        // Win, draw, loss counts
        const [wins, draws, losses] = await Promise.all([
            match_model_1.default.countDocuments({
                $expr: { $gt: ["$score.kfc", "$score.opponent"] },
            }),
            match_model_1.default.countDocuments({
                $expr: { $eq: ["$score.kfc", "$score.opponent"] },
            }),
            match_model_1.default.countDocuments({
                $expr: { $lt: ["$score.kfc", "$score.opponent"] },
            }),
        ]);
        // Goals For
        const goalsForAgg = await match_model_1.default.aggregate([
            { $group: { _id: null, total: { $sum: "$score.kfc" } } },
        ]);
        const goalsFor = goalsForAgg[0]?.total ?? 0;
        // Goals Against
        const goalsAgainstAgg = await match_model_1.default.aggregate([
            { $group: { _id: null, total: { $sum: "$score.opponent" } } },
        ]);
        const goalsAgainst = goalsAgainstAgg[0]?.total ?? 0;
        const totalMatches = wins + draws + losses;
        res.status(200).json({
            success: true,
            data: {
                wins,
                draws,
                losses,
                goalsFor,
                goalsAgainst,
                goalDifference: goalsFor - goalsAgainst,
                totalMatches,
                winRate: totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0,
            },
        });
    }
    catch (err) {
        console.error("Match stats error:", err);
        res.status(500).json({
            success: false,
            error: (0, lib_1.getErrorMessage)(err, "Failed to calculate match stats"),
        });
    }
};
exports.getMatchStats = getMatchStats;
// GET /api/stats/matches/detailed
const getDetailedMatchStats = async (req, res) => {
    try {
        const { season, fromDate, toDate } = req.query;
        // Build date filter
        const dateFilter = {};
        if (fromDate)
            dateFilter.$gte = new Date(fromDate);
        if (toDate)
            dateFilter.$lte = new Date(toDate);
        // Build season filter
        const seasonFilter = season ? { season } : {};
        const matchStats = await match_model_1.default.aggregate([
            {
                $match: {
                    ...seasonFilter,
                    ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
                },
            },
            {
                $facet: {
                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalMatches: { $sum: 1 },
                                totalGoalsFor: { $sum: "$score.kfc" },
                                totalGoalsAgainst: { $sum: "$score.opponent" },
                                avgGoalsFor: { $avg: "$score.kfc" },
                                avgGoalsAgainst: { $avg: "$score.opponent" },
                                wins: {
                                    $sum: {
                                        $cond: [
                                            { $gt: ["$score.kfc", "$score.opponent"] },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                                draws: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$score.kfc", "$score.opponent"] },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                                losses: {
                                    $sum: {
                                        $cond: [
                                            { $lt: ["$score.kfc", "$score.opponent"] },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                                cleanSheets: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$score.opponent", 0] },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                                matchesScored: {
                                    $sum: {
                                        $cond: [
                                            { $gt: ["$score.kfc", 0] },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                            },
                        },
                    ],
                    byCompetition: [
                        {
                            $group: {
                                _id: "$competition",
                                matches: { $sum: 1 },
                                goalsFor: { $sum: "$score.kfc" },
                                goalsAgainst: { $sum: "$score.opponent" },
                                wins: {
                                    $sum: {
                                        $cond: [
                                            { $gt: ["$score.kfc", "$score.opponent"] },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                            },
                        },
                        { $sort: { matches: -1 } },
                    ],
                    byMonth: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: "$date" },
                                    month: { $month: "$date" },
                                },
                                matches: { $sum: 1 },
                                goalsFor: { $sum: "$score.kfc" },
                                goalsAgainst: { $sum: "$score.opponent" },
                            },
                        },
                        { $sort: { "_id.year": -1, "_id.month": -1 } },
                    ],
                    biggestWin: [
                        {
                            $match: {
                                $expr: { $gt: ["$score.kfc", "$score.opponent"] },
                            },
                        },
                        {
                            $addFields: {
                                goalDifference: {
                                    $subtract: ["$score.kfc", "$score.opponent"],
                                },
                            },
                        },
                        { $sort: { goalDifference: -1 } },
                        { $limit: 1 },
                        {
                            $project: {
                                opponent: 1,
                                score: 1,
                                date: 1,
                                goalDifference: 1,
                            },
                        },
                    ],
                    biggestLoss: [
                        {
                            $match: {
                                $expr: { $lt: ["$score.kfc", "$score.opponent"] },
                            },
                        },
                        {
                            $addFields: {
                                goalDifference: {
                                    $subtract: ["$score.opponent", "$score.kfc"],
                                },
                            },
                        },
                        { $sort: { goalDifference: -1 } },
                        { $limit: 1 },
                        {
                            $project: {
                                opponent: 1,
                                score: 1,
                                date: 1,
                                goalDifference: 1,
                            },
                        },
                    ],
                },
            },
        ]);
        const summary = matchStats[0]?.summary[0] || {};
        const totalMatches = summary.totalMatches || 0;
        res.status(200).json({
            success: true,
            data: {
                summary: {
                    ...summary,
                    winRate: totalMatches > 0
                        ? Math.round((summary.wins || 0) / totalMatches * 100)
                        : 0,
                },
                byCompetition: matchStats[0]?.byCompetition || [],
                byMonth: matchStats[0]?.byMonth || [],
                biggestWin: matchStats[0]?.biggestWin[0] || null,
                biggestLoss: matchStats[0]?.biggestLoss[0] || null,
            },
        });
    }
    catch (err) {
        console.error("Detailed match stats error:", err);
        res.status(500).json({
            success: false,
            error: (0, lib_1.getErrorMessage)(err, "Failed to calculate detailed match stats"),
        });
    }
};
exports.getDetailedMatchStats = getDetailedMatchStats;
// GET /api/stats/matches/home-away
const getHomeAwayStats = async (req, res) => {
    try {
        const [homeStats, awayStats] = await Promise.all([
            // Home matches stats
            match_model_1.default.aggregate([
                { $match: { isHome: true } },
                {
                    $group: {
                        _id: null,
                        matches: { $sum: 1 },
                        wins: {
                            $sum: {
                                $cond: [
                                    { $gt: ["$score.kfc", "$score.opponent"] },
                                    1,
                                    0,
                                ],
                            },
                        },
                        draws: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$score.kfc", "$score.opponent"] },
                                    1,
                                    0,
                                ],
                            },
                        },
                        losses: {
                            $sum: {
                                $cond: [
                                    { $lt: ["$score.kfc", "$score.opponent"] },
                                    1,
                                    0,
                                ],
                            },
                        },
                        goalsFor: { $sum: "$score.kfc" },
                        goalsAgainst: { $sum: "$score.opponent" },
                    },
                },
            ]),
            // Away matches stats
            match_model_1.default.aggregate([
                { $match: { isHome: false } },
                {
                    $group: {
                        _id: null,
                        matches: { $sum: 1 },
                        wins: {
                            $sum: {
                                $cond: [
                                    { $gt: ["$score.kfc", "$score.opponent"] },
                                    1,
                                    0,
                                ],
                            },
                        },
                        draws: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$score.kfc", "$score.opponent"] },
                                    1,
                                    0,
                                ],
                            },
                        },
                        losses: {
                            $sum: {
                                $cond: [
                                    { $lt: ["$score.kfc", "$score.opponent"] },
                                    1,
                                    0,
                                ],
                            },
                        },
                        goalsFor: { $sum: "$score.kfc" },
                        goalsAgainst: { $sum: "$score.opponent" },
                    },
                },
            ]),
        ]);
        const home = homeStats[0] || { matches: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
        const away = awayStats[0] || { matches: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
        res.status(200).json({
            success: true,
            data: {
                home: {
                    ...home,
                    winRate: home.matches > 0 ? Math.round((home.wins / home.matches) * 100) : 0,
                },
                away: {
                    ...away,
                    winRate: away.matches > 0 ? Math.round((away.wins / away.matches) * 100) : 0,
                },
                total: {
                    homeWins: home.wins,
                    awayWins: away.wins,
                    homeWinPercentage: (home.wins + away.wins) > 0
                        ? Math.round((home.wins / (home.wins + away.wins)) * 100)
                        : 0,
                },
            },
        });
    }
    catch (err) {
        console.error("Home/away stats error:", err);
        res.status(500).json({
            success: false,
            error: (0, lib_1.getErrorMessage)(err, "Failed to calculate home/away stats"),
        });
    }
};
exports.getHomeAwayStats = getHomeAwayStats;
// GET /api/stats/matches/form
const getFormGuide = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const numLimit = Number(limit);
        const recentMatches = await match_model_1.default.find({
            $expr: { $ne: ["$score.kfc", null] }, // Only matches with scores
        })
            .populate('opponent', 'name logo')
            .sort({ date: -1 })
            .limit(numLimit)
            .lean();
        const formGuide = recentMatches.map(match => ({
            id: match._id,
            date: match.date,
            opponent: match.opponent,
            competition: match.competition,
            isHome: match.isHome,
            score: match.score,
            result: match.score.kfc > match.score.opponent ? 'W' :
                match.score.kfc < match.score.opponent ? 'L' : 'D',
            goalDifference: (match.score.kfc || 0) - (match.score.opponent || 0),
        }));
        // Calculate form string (e.g., "W-W-D-L-W")
        const formString = formGuide.map(f => f.result).join('-');
        res.status(200).json({
            success: true,
            data: {
                formGuide,
                formString,
                recent: formGuide.slice(0, 5),
            },
        });
    }
    catch (err) {
        console.error("Form guide error:", err);
        res.status(500).json({
            success: false,
            error: (0, lib_1.getErrorMessage)(err, "Failed to calculate form guide"),
        });
    }
};
exports.getFormGuide = getFormGuide;
// GET /api/stats/matches/streaks
const getStreaks = async (req, res) => {
    try {
        const matches = await match_model_1.default.find({
            $expr: { $ne: ["$score.kfc", null] },
        })
            .sort({ date: -1 })
            .lean();
        let currentStreak = { type: null, count: 0 };
        let longestWinStreak = 0;
        let longestLossStreak = 0;
        let longestDrawStreak = 0;
        let currentWinStreak = 0;
        let currentLossStreak = 0;
        let currentDrawStreak = 0;
        for (const match of matches) {
            const result = match.score.kfc > match.score.opponent ? 'W' :
                match.score.kfc < match.score.opponent ? 'L' : 'D';
            // Update current streak
            if (currentStreak.type === result) {
                currentStreak.count++;
            }
            else {
                // Check if previous streak was a record
                if (currentStreak.type === 'W') {
                    longestWinStreak = Math.max(longestWinStreak, currentStreak.count);
                    currentWinStreak = currentStreak.count;
                }
                else if (currentStreak.type === 'L') {
                    longestLossStreak = Math.max(longestLossStreak, currentStreak.count);
                    currentLossStreak = currentStreak.count;
                }
                else if (currentStreak.type === 'D') {
                    longestDrawStreak = Math.max(longestDrawStreak, currentStreak.count);
                    currentDrawStreak = currentStreak.count;
                }
                // Start new streak
                currentStreak = { type: result, count: 1 };
            }
        }
        // Check last streak
        if (currentStreak.type === 'W') {
            longestWinStreak = Math.max(longestWinStreak, currentStreak.count);
            currentWinStreak = currentStreak.count;
        }
        else if (currentStreak.type === 'L') {
            longestLossStreak = Math.max(longestLossStreak, currentStreak.count);
            currentLossStreak = currentStreak.count;
        }
        else if (currentStreak.type === 'D') {
            longestDrawStreak = Math.max(longestDrawStreak, currentStreak.count);
            currentDrawStreak = currentStreak.count;
        }
        res.status(200).json({
            success: true,
            data: {
                current: {
                    type: currentStreak.type,
                    count: currentStreak.count,
                },
                longest: {
                    wins: longestWinStreak,
                    losses: longestLossStreak,
                    draws: longestDrawStreak,
                },
                streaks: {
                    currentWinStreak,
                    currentLossStreak,
                    currentDrawStreak,
                },
            },
        });
    }
    catch (err) {
        console.error("Streaks error:", err);
        res.status(500).json({
            success: false,
            error: (0, lib_1.getErrorMessage)(err, "Failed to calculate streaks"),
        });
    }
};
exports.getStreaks = getStreaks;
