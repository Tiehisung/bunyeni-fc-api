"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCaptaincyStats = exports.deleteCaptaincy = exports.updateCaptaincy = exports.endCaptaincy = exports.assignMultipleCaptains = exports.assignCaptain = exports.getCaptaincyById = exports.getCaptaincyHistoryByRole = exports.getCaptaincyByPlayer = exports.getActiveCaptains = exports.getCaptains = void 0;
const lib_1 = require("../../lib");
const log_interface_1 = require("../../types/log.interface");
const helper_1 = require("../logs/helper");
const player_model_1 = __importDefault(require("../players/player.model"));
const captain_model_1 = __importDefault(require("./captain.model"));
// GET /api/captains
const getCaptains = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const search = req.query.captain_search || "";
        const isActive = req.query.isActive === 'true';
        const role = req.query.role;
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        const regex = new RegExp(search, "i");
        const query = {};
        // Search filter
        if (search) {
            query.$or = [
                { "player.firstName": regex },
                { "player.lastName": regex },
                { "player.name": regex },
                { "role": regex },
            ];
        }
        // Active status filter
        if (req.query.isActive !== undefined) {
            query.isActive = isActive;
        }
        // Role filter
        if (role) {
            query.role = role;
        }
        // Date range filter (for historical captaincy periods)
        if (fromDate || toDate) {
            query.startDate = {};
            if (fromDate)
                query.startDate.$gte = new Date(fromDate);
            if (toDate)
                query.startDate.$lte = new Date(toDate);
        }
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        const captains = await captain_model_1.default.find(cleaned)
            .populate('player', 'name firstName lastName number position avatar')
            .sort({ createdAt: -1, startDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await captain_model_1.default.countDocuments(cleaned);
        // Get current active captains for quick reference
        const activeCaptains = await captain_model_1.default.find({ isActive: true })
            .populate('player', 'name firstName lastName number position avatar')
            .lean();
        res.status(200).json({
            success: true,
            data: {
                captains,
                activeCaptains,
            },
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch captains"),
        });
    }
};
exports.getCaptains = getCaptains;
// GET /api/captains/active
const getActiveCaptains = async (req, res) => {
    try {
        const captains = await captain_model_1.default.find({ isActive: true })
            .populate('player', 'name firstName lastName number position avatar')
            .sort({ role: 1 })
            .lean();
        res.status(200).json({
            success: true,
            data: captains,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch active captains"),
        });
    }
};
exports.getActiveCaptains = getActiveCaptains;
// GET /api/captains/player/:playerId
const getCaptaincyByPlayer = async (req, res) => {
    try {
        const { playerId } = req.params;
        const captaincies = await captain_model_1.default.find({ 'player._id': playerId })
            .sort({ startDate: -1 })
            .lean();
        res.status(200).json({
            success: true,
            data: captaincies,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch player captaincy history"),
        });
    }
};
exports.getCaptaincyByPlayer = getCaptaincyByPlayer;
// GET /api/captains/history/:role
const getCaptaincyHistoryByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "20", 10);
        const skip = (page - 1) * limit;
        const history = await captain_model_1.default.find({ role })
            .populate('player', 'name firstName lastName number position avatar')
            .sort({ startDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await captain_model_1.default.countDocuments({ role });
        res.status(200).json({
            success: true,
            data: history,
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch captaincy history"),
        });
    }
};
exports.getCaptaincyHistoryByRole = getCaptaincyHistoryByRole;
// GET /api/captains/:id
const getCaptaincyById = async (req, res) => {
    try {
        const { id } = req.params;
        const captaincy = await captain_model_1.default.findById(id)
            .populate('player', 'name firstName lastName number position avatar')
            .lean();
        if (!captaincy) {
            return res.status(404).json({
                success: false,
                message: "Captaincy record not found",
            });
        }
        res.status(200).json({
            success: true,
            data: captaincy,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch captaincy record"),
        });
    }
};
exports.getCaptaincyById = getCaptaincyById;
// POST /api/captains
const assignCaptain = async (req, res) => {
    try {
        const { player, role } = req.body;
        // Validate required fields
        if (!player || !role) {
            return res.status(400).json({
                success: false,
                message: "Player and role are required",
            });
        }
        // Check if player exists
        const playerExists = await player_model_1.default.findById(player._id);
        if (!playerExists) {
            return res.status(404).json({
                success: false,
                message: "Player not found",
            });
        }
        // End current captain's reign for this role
        const currentCaptain = await captain_model_1.default.findOne({
            isActive: true,
            role: role
        });
        if (currentCaptain) {
            await captain_model_1.default.updateMany({ isActive: true, role: role }, {
                $set: {
                    isActive: false,
                    endDate: new Date(),
                    updatedAt: new Date(),
                    endedBy: req.user?.id,
                }
            });
        }
        // Create new captaincy record
        const newCaptain = await captain_model_1.default.create({
            player: {
                _id: player._id,
                name: player.name,
                number: player.number,
            },
            role,
            isActive: true,
            startDate: new Date(),
            appointedBy: req.user?.id,
            createdAt: new Date(),
        });
        // Log action
        await (0, helper_1.logAction)({
            title: "👑 Captain Assigned",
            description: `${player.name} appointed as ${role}`,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: {
                captaincyId: newCaptain._id,
                playerId: player._id,
                role,
                previousCaptain: currentCaptain?._id,
            },
        });
        // Populate for response
        const populatedCaptain = await captain_model_1.default.findById(newCaptain._id)
            .populate('player', 'name firstName lastName number position avatar')
            .lean();
        res.status(201).json({
            message: "Captain assigned successfully.",
            success: true,
            data: populatedCaptain,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to assign captain"),
            success: false,
        });
    }
};
exports.assignCaptain = assignCaptain;
// POST /api/captains/bulk
const assignMultipleCaptains = async (req, res) => {
    try {
        const { assignments } = req.body;
        if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Assignments array is required",
            });
        }
        const results = [];
        const errors = [];
        for (const assignment of assignments) {
            try {
                const { player, role } = assignment;
                // End current captain's reign
                await captain_model_1.default.updateMany({ isActive: true, role }, {
                    $set: {
                        isActive: false,
                        endDate: new Date(),
                        endedBy: req.user?.id,
                    }
                });
                // Create new captain
                const newCaptain = await captain_model_1.default.create({
                    player,
                    role,
                    isActive: true,
                    startDate: new Date(),
                    appointedBy: req.user?.id,
                });
                results.push(newCaptain);
            }
            catch (error) {
                errors.push({ assignment, error: (0, lib_1.getErrorMessage)(error) });
            }
        }
        // Log bulk action
        await (0, helper_1.logAction)({
            title: "👑 Multiple Captains Assigned",
            description: `${results.length} captains assigned, ${errors.length} failed`,
            severity: errors.length > 0 ? log_interface_1.ELogSeverity.WARNING : log_interface_1.ELogSeverity.INFO,
            meta: { results, errors },
        });
        res.status(201).json({
            message: "Captains assigned successfully",
            success: true,
            data: {
                successful: results,
                failed: errors,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to assign captains"),
            success: false,
        });
    }
};
exports.assignMultipleCaptains = assignMultipleCaptains;
// PUT /api/captains/:id/end
const endCaptaincy = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const captaincy = await captain_model_1.default.findById(id);
        if (!captaincy) {
            return res.status(404).json({
                success: false,
                message: "Captaincy record not found",
            });
        }
        if (!captaincy.isActive) {
            return res.status(400).json({
                success: false,
                message: "This captaincy has already ended",
            });
        }
        const updated = await captain_model_1.default.findByIdAndUpdate(id, {
            $set: {
                isActive: false,
                endDate: new Date(),
                endReason: reason || 'End of tenure',
                endedBy: req.user?.id,
                updatedAt: new Date(),
            },
        }, { new: true }).populate('player', 'name firstName lastName number position avatar');
        // Log action
        await (0, helper_1.logAction)({
            title: "👑 Captaincy Ended",
            description: `${captaincy.player?.name}'s tenure as ${captaincy.role} ended`,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: {
                captaincyId: id,
                playerId: captaincy.player?._id,
                role: captaincy.role,
                reason,
            },
        });
        res.status(200).json({
            success: true,
            message: "Captaincy ended successfully",
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to end captaincy"),
        });
    }
};
exports.endCaptaincy = endCaptaincy;
// PUT /api/captains/:id
const updateCaptaincy = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Remove _id from updates
        delete updates._id;
        const updated = await captain_model_1.default.findByIdAndUpdate(id, {
            $set: {
                ...updates,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true, runValidators: true }).populate('player', 'name firstName lastName number position avatar');
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Captaincy record not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Captaincy record updated",
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update captaincy record"),
        });
    }
};
exports.updateCaptaincy = updateCaptaincy;
// DELETE /api/captains/:id
const deleteCaptaincy = async (req, res) => {
    try {
        const { id } = req.params;
        const captaincy = await captain_model_1.default.findById(id);
        if (!captaincy) {
            return res.status(404).json({
                success: false,
                message: "Captaincy record not found",
            });
        }
        const deleted = await captain_model_1.default.findByIdAndDelete(id);
        // Log action
        await (0, helper_1.logAction)({
            title: "👑 Captaincy Record Deleted",
            description: `${captaincy.player?.name}'s captaincy record deleted`,
            severity: log_interface_1.ELogSeverity.CRITICAL,
            meta: {
                captaincyId: id,
                playerId: captaincy.player?._id,
                role: captaincy.role,
            },
        });
        res.status(200).json({
            success: true,
            message: "Captaincy record deleted",
            data: deleted,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to delete captaincy record"),
        });
    }
};
exports.deleteCaptaincy = deleteCaptaincy;
// GET /api/captains/stats
const getCaptaincyStats = async (req, res) => {
    try {
        const stats = await captain_model_1.default.aggregate([
            {
                $facet: {
                    totalAppointments: [{ $count: "count" }],
                    byRole: [
                        {
                            $group: {
                                _id: "$role",
                                count: { $sum: 1 },
                                active: {
                                    $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
                                },
                            },
                        },
                    ],
                    activeCaptains: [
                        {
                            $match: { isActive: true }
                        },
                        {
                            $group: {
                                _id: "$role",
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    longestTenure: [
                        {
                            $match: { isActive: false, endDate: { $exists: true } }
                        },
                        {
                            $addFields: {
                                tenureDays: {
                                    $divide: [
                                        { $subtract: ["$endDate", "$startDate"] },
                                        1000 * 60 * 60 * 24
                                    ]
                                }
                            }
                        },
                        {
                            $sort: { tenureDays: -1 }
                        },
                        {
                            $limit: 5
                        },
                        {
                            $lookup: {
                                from: "players",
                                localField: "player._id",
                                foreignField: "_id",
                                as: "playerDetails",
                            },
                        },
                        {
                            $project: {
                                playerName: { $arrayElemAt: ["$playerDetails.name", 0] },
                                role: 1,
                                tenureDays: 1,
                                startDate: 1,
                                endDate: 1,
                            },
                        },
                    ],
                },
            },
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalAppointments: stats[0]?.totalAppointments[0]?.count || 0,
                byRole: stats[0]?.byRole || [],
                activeCaptains: stats[0]?.activeCaptains || [],
                longestTenure: stats[0]?.longestTenure || [],
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch captaincy statistics"),
        });
    }
};
exports.getCaptaincyStats = getCaptaincyStats;
