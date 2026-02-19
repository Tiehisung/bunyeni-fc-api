// controllers/card.controller.ts
import type { Request, Response } from "express";
import { getErrorMessage } from "../../../lib";
import { ICard } from "../../../types/card.interface";
import { ELogSeverity } from "../../../types/log.interface";
import { logAction } from "../../logs/helper";
import PlayerModel from "../../players/player.model";
import MatchModel from "../match.model";
import CardModel from "./card.model";
import { updateMatchEvent } from "../helpers";
 

// GET /api/cards
export const getCards = async (req: Request, res: Response) => {
    try {
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "30", 10);
        const skip = (page - 1) * limit;

        const search = (req.query.card_search as string) || "";
        const matchId = req.query.matchId as string;
        const playerId = req.query.playerId as string;
        const type = req.query.type as string; // 'yellow' or 'red'

        const regex = new RegExp(search, "i");

        const query: any = {};

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

        const cards = await CardModel.find(query)
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent')
            .limit(limit)
            .skip(skip)
            .lean()
            .sort({ createdAt: "desc" });

        const total = await CardModel.countDocuments(query);

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch cards"),
        });
    }
};

// GET /api/cards/:id
export const getCardById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const card = await CardModel.findById(id)
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch card"),
        });
    }
};

// GET /api/cards/match/:matchId
export const getCardsByMatch = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;

        const cards = await CardModel.find({ match: matchId })
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch match cards"),
        });
    }
};

// GET /api/cards/player/:playerId
export const getCardsByPlayer = async (req: Request, res: Response) => {
    try {
        const { playerId } = req.params;
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "10", 10);
        const skip = (page - 1) * limit;

        const cards = await CardModel.find({ player: playerId })
            .populate('match', 'title date competition opponent')
            .sort({ createdAt: "desc" })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await CardModel.countDocuments({ player: playerId });

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch player cards"),
        });
    }
};

// POST /api/cards
export const createCard = async (req: Request, res: Response) => {
    try {
        const { match, minute, player, type, description,   } = req.body as ICard;

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
            const existingRed = await CardModel.findOne({
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
        const savedCard = await CardModel.create({
            match,
            minute,
            player,
            type,
            description: description ,
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
        const playerDetails = typeof player === 'object' ? player : await PlayerModel.findById(playerId);

        // Update Player - add card reference
        await PlayerModel.findByIdAndUpdate(
            playerId,
            { $push: { cards: savedCard._id } }
        );

        // Update Match - add card reference
        const matchId = typeof match === 'object' ? match._id : match;
        await MatchModel.findByIdAndUpdate(
            matchId,
            { $push: { cards: savedCard._id } }
        );

        // Update match events
        const emoji = type === 'red' ? '🟥' : '🟨';
        await updateMatchEvent(matchId, {
            type: 'card',
            minute: String(minute),
            title: `${emoji} ${minute}' - ${playerDetails?.number || ''} ${playerDetails?.name || 'Player'}`,
            description: description || `${type.toUpperCase()} card`,
            timestamp: new Date(),
        });

        // Log action
        await logAction({
            title: `${emoji} ${type.toUpperCase()} Card Issued`,
            description: description || `${type} card for ${playerDetails?.name}`,
            severity: type === 'red' ? ELogSeverity.WARNING : ELogSeverity.INFO,
            meta: {
                cardId: savedCard._id,
                matchId,
                playerId,
                type,
                minute,
            },
        });

        // Populate for response
        const populatedCard = await CardModel.findById(savedCard._id)
            .populate('player', 'name number position avatar')
            .populate('match', 'title date competition opponent')
            .lean();

        res.status(201).json({
            message: "Card recorded successfully!",
            success: true,
            data: populatedCard
        });

    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to create card"),
            success: false,
        });
    }
};

// PUT /api/cards/:id
export const updateCard = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove _id from updates
        delete updates._id;

        const updatedCard = await CardModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...updates,
                    updatedAt: new Date(),
                    updatedBy: req.user?.id,
                },
            },
            { new: true, runValidators: true }
        )
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update card"),
        });
    }
};

// DELETE /api/cards/:id
export const deleteCard = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find card first to get details
        const cardToDelete = await CardModel.findById(id)
            .populate('player')
            .populate('match');

        if (!cardToDelete) {
            return res.status(404).json({
                success: false,
                message: "Card not found",
            });
        }

        // Delete the card
        const deleted = await CardModel.findByIdAndDelete(id);

        // Update Player - remove card reference
        if (cardToDelete.player) {
            await PlayerModel.findByIdAndUpdate(
                cardToDelete.player._id,
                { $pull: { cards: id } }
            );
        }

        // Update Match - remove card reference
        if (cardToDelete.match) {
            await MatchModel.findByIdAndUpdate(
                cardToDelete.match._id,
                { $pull: { cards: id } }
            );
        }

        // Update match events
        await updateMatchEvent(cardToDelete.match?._id as string, {
            type: 'card',
            minute: cardToDelete.minute,
            title: ` Card revoked `,
            description: `${cardToDelete.type.toUpperCase()} card reviewed and revoked`,
            timestamp: new Date(),
        });

        // Log action
        await logAction({
            title: "Card Revoked",
            description: `${cardToDelete.type} card for ${cardToDelete.player?.name} revoked`,
            severity: ELogSeverity.WARNING,
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

    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to delete card"),
            success: false,
        });
    }
};

// GET /api/cards/stats
export const getCardStats = async (req: Request, res: Response) => {
    try {
        const stats = await CardModel.aggregate([
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch card statistics"),
        });
    }
};