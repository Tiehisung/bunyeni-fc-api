"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCardStats = exports.deleteCard = exports.updateCard = exports.createCard = exports.getCardsByPlayer = exports.getCardsByMatch = exports.getCardById = exports.getCards = void 0;
const lib_1 = require("../../../lib");
const log_interface_1 = require("../../../types/log.interface");
const helper_1 = require("../../logs/helper");
const player_model_1 = __importDefault(require("../../players/player.model"));
const match_model_1 = __importDefault(require("../match.model"));
const card_model_1 = __importDefault(require("./card.model"));
const helpers_1 = require("../helpers");
// GET /api/cards
const getCards = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "30", 10);
        const skip = (page - 1) * limit;
        const search = req.query.card_search || "";
        const matchId = req.query.matchId;
        const playerId = req.query.playerId;
        const type = req.query.type; // 'yellow' or 'red'
        const regex = new RegExp(search, "i");
        const query = {};
        if (search) {
            query.$or = [
                { "type": regex },
                { "player.name": regex },
                { "match.title": regex },
                { "description": regex },
                { "minute": regex },
            ];
        }
        if (matchId) {
            query.match = matchId;
        }
        if (playerId) {
            query.player = playerId;
        }
        if (type) {
            query.type = type;
        }
        const cards = await card_model_1.default.find(query)
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent')
            .limit(limit)
            .skip(skip)
            .lean()
            .sort({ createdAt: "desc" });
        const total = await card_model_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            data: cards,
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch cards"),
        });
    }
};
exports.getCards = getCards;
// GET /api/cards/:id
const getCardById = async (req, res) => {
    try {
        const { id } = req.params;
        const card = await card_model_1.default.findById(id)
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent')
            .lean();
        if (!card) {
            return res.status(404).json({
                success: false,
                message: "Card not found",
            });
        }
        res.status(200).json({
            success: true,
            data: card,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch card"),
        });
    }
};
exports.getCardById = getCardById;
// GET /api/cards/match/:matchId
const getCardsByMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const cards = await card_model_1.default.find({ match: matchId })
            .populate('player', 'name number position avatar')
            .sort({ minute: 'asc' })
            .lean();
        const yellowCards = cards.filter(c => c.type === 'yellow').length;
        const redCards = cards.filter(c => c.type === 'red').length;
        res.status(200).json({
            success: true,
            data: {
                cards,
                summary: {
                    total: cards.length,
                    yellow: yellowCards,
                    red: redCards,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch match cards"),
        });
    }
};
exports.getCardsByMatch = getCardsByMatch;
// GET /api/cards/player/:playerId
const getCardsByPlayer = async (req, res) => {
    try {
        const { playerId } = req.params;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const cards = await card_model_1.default.find({ player: playerId })
            .populate('match', 'title date competition opponent')
            .sort({ createdAt: "desc" })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await card_model_1.default.countDocuments({ player: playerId });
        res.status(200).json({
            success: true,
            data: cards,
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch player cards"),
        });
    }
};
exports.getCardsByPlayer = getCardsByPlayer;
// POST /api/cards
const createCard = async (req, res) => {
    try {
        const { match, minute, player, type, description, } = req.body;
        // Validate required fields
        if (!match || !player || !minute || !type) {
            return res.status(400).json({
                success: false,
                message: "Match ID, player ID, minute, and card type are required",
            });
        }
        // Validate card type
        if (!['yellow', 'red'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Card type must be either 'yellow' or 'red'",
            });
        }
        // Check if player already has a red card in this match
        if (type === 'red') {
            const existingRed = await card_model_1.default.findOne({
                match,
                player: typeof player === 'object' ? player._id : player,
                type: 'red'
            });
            if (existingRed) {
                return res.status(409).json({
                    success: false,
                    message: "Player already has a red card in this match",
                });
            }
        }
        // Create card
        const savedCard = await card_model_1.default.create({
            match,
            minute,
            player,
            type,
            description: description,
            createdBy: req.user?.id,
            createdAt: new Date(),
        });
        if (!savedCard) {
            return res.status(500).json({
                message: "Failed to create card.",
                success: false
            });
        }
        // Get player details for updates
        const playerId = typeof player === 'object' ? player._id : player;
        const playerDetails = typeof player === 'object' ? player : await player_model_1.default.findById(playerId);
        // Update Player - add card reference
        await player_model_1.default.findByIdAndUpdate(playerId, { $push: { cards: savedCard._id } });
        // Update Match - add card reference
        const matchId = typeof match === 'object' ? match._id : match;
        await match_model_1.default.findByIdAndUpdate(matchId, { $push: { cards: savedCard._id } });
        // Update match events
        const emoji = type === 'red' ? '🟥' : '🟨';
        await (0, helpers_1.updateMatchEvent)(matchId, {
            type: 'card',
            minute: String(minute),
            title: `${emoji} ${minute}' - ${playerDetails?.number || ''} ${playerDetails?.name || 'Player'}`,
            description: description || `${type.toUpperCase()} card`,
            timestamp: new Date(),
        });
        // Log action
        await (0, helper_1.logAction)({
            title: `${emoji} ${type.toUpperCase()} Card Issued`,
            description: description || `${type} card for ${playerDetails?.name}`,
            severity: type === 'red' ? log_interface_1.ELogSeverity.WARNING : log_interface_1.ELogSeverity.INFO,
            meta: {
                cardId: savedCard._id,
                matchId,
                playerId,
                type,
                minute,
            },
        });
        // Populate for response
        const populatedCard = await card_model_1.default.findById(savedCard._id)
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent')
            .lean();
        res.status(201).json({
            message: "Card recorded successfully!",
            success: true,
            data: populatedCard
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to create card"),
            success: false,
        });
    }
};
exports.createCard = createCard;
// PUT /api/cards/:id
const updateCard = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Remove _id from updates
        delete updates._id;
        const updatedCard = await card_model_1.default.findByIdAndUpdate(id, {
            $set: {
                ...updates,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true, runValidators: true })
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent');
        if (!updatedCard) {
            return res.status(404).json({
                success: false,
                message: "Card not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Card updated successfully",
            data: updatedCard,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update card"),
        });
    }
};
exports.updateCard = updateCard;
// DELETE /api/cards/:id
const deleteCard = async (req, res) => {
    try {
        const { id } = req.params;
        // Find card first to get details
        const cardToDelete = await card_model_1.default.findById(id)
            .populate('player')
            .populate('match');
        if (!cardToDelete) {
            return res.status(404).json({
                success: false,
                message: "Card not found",
            });
        }
        // Delete the card
        const deleted = await card_model_1.default.findByIdAndDelete(id);
        // Update Player - remove card reference
        if (cardToDelete.player) {
            await player_model_1.default.findByIdAndUpdate(cardToDelete.player._id, { $pull: { cards: id } });
        }
        // Update Match - remove card reference
        if (cardToDelete.match) {
            await match_model_1.default.findByIdAndUpdate(cardToDelete.match._id, { $pull: { cards: id } });
        }
        // Update match events
        await (0, helpers_1.updateMatchEvent)(cardToDelete.match?._id, {
            type: 'card',
            minute: cardToDelete.minute,
            title: ` Card revoked `,
            description: `${cardToDelete.type.toUpperCase()} card reviewed and revoked`,
            timestamp: new Date(),
        });
        // Log action
        await (0, helper_1.logAction)({
            title: "Card Revoked",
            description: `${cardToDelete.type} card for ${cardToDelete.player?.name} revoked`,
            severity: log_interface_1.ELogSeverity.WARNING,
            meta: {
                cardId: id,
                matchId: cardToDelete.match?._id,
                playerId: cardToDelete.player?._id,
                type: cardToDelete.type,
            },
        });
        res.status(200).json({
            message: "Card deleted successfully!",
            success: true,
            data: deleted
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to delete card"),
            success: false,
        });
    }
};
exports.deleteCard = deleteCard;
// GET /api/cards/stats
const getCardStats = async (req, res) => {
    try {
        const stats = await card_model_1.default.aggregate([
            {
                $facet: {
                    totalCards: [{ $count: "count" }],
                    byType: [
                        {
                            $group: {
                                _id: "$type",
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
                                    reds: {
                                        $sum: { $cond: [{ $eq: ["$type", "red"] }, 1, 0] }
                                    },
                                    yellows: {
                                        $sum: { $cond: [{ $eq: ["$type", "yellow"] }, 1, 0] }
                                    },
                                },
                            },
                        },
                    ],
                    mostCardedPlayers: [
                        {
                            $group: {
                                _id: "$player",
                                total: { $sum: 1 },
                                reds: {
                                    $sum: { $cond: [{ $eq: ["$type", "red"] }, 1, 0] }
                                },
                                yellows: {
                                    $sum: { $cond: [{ $eq: ["$type", "yellow"] }, 1, 0] }
                                },
                            },
                        },
                        {
                            $sort: { total: -1 }
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
                                total: 1,
                                reds: 1,
                                yellows: 1,
                                playerName: { $arrayElemAt: ["$playerDetails.name", 0] },
                                playerNumber: { $arrayElemAt: ["$playerDetails.number", 0] },
                                playerPosition: { $arrayElemAt: ["$playerDetails.position", 0] },
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
                totalCards: stats[0]?.totalCards[0]?.count || 0,
                byType: stats[0]?.byType || [],
                byMinute: stats[0]?.byMinute || [],
                mostCardedPlayers: stats[0]?.mostCardedPlayers || [],
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch card statistics"),
        });
    }
};
exports.getCardStats = getCardStats;
