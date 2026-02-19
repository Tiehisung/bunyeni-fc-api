"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchPlayerBySlugOrId = exports.deletePlayerBySlugOrId = exports.updatePlayerBySlugOrId = exports.getPlayerBySlugOrId = exports.updatePlayer = exports.createPlayer = exports.generatePlayerID = exports.getPlayers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Import models to ensure they're registered for populate
const lib_1 = require("../../lib");
const player_model_1 = __importDefault(require("./player.model"));
const user_1 = require("../../types/user");
const user_model_1 = __importDefault(require("../users/user.model"));
const timeAndDate_1 = require("../../lib/timeAndDate");
const about_1 = require("../../data/about");
const player_interface_1 = require("../../types/player.interface");
const slug_1 = require("../../lib/slug");
const helper_1 = require("../logs/helper");
const log_interface_1 = require("../../types/log.interface");
const archive_model_1 = __importDefault(require("../archives/archive.model"));
require("../media/files/file.model");
require("../media/galleries/gallery.model");
// GET /api/players
const getPlayers = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const ageStatus = req.query.ageStatus || player_interface_1.EPlayerAgeStatus.YOUTH;
        const limit = Number.parseInt(req.query.limit || "30", 10);
        const skip = (page - 1) * limit;
        const search = req.query.player_search || "";
        const status = req.query.status || player_interface_1.EPlayerStatus.CURRENT;
        const regex = new RegExp(search, "i");
        const query = {
            $or: [
                { "firstName": regex },
                { "lastName": regex },
                { "position": regex },
                { "number": regex },
                { "dob": regex },
                { "email": regex },
                { "status": regex },
            ],
            status,
            ageStatus,
            // [field]: value
        };
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        const players = await player_model_1.default.find(cleaned)
            .populate({
            path: "galleries",
            populate: { path: 'files' }
        })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await player_model_1.default.countDocuments(cleaned);
        res.status(200).json({
            success: true,
            data: players,
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch players"),
        });
    }
};
exports.getPlayers = getPlayers;
// Helper function to generate player ID
const generatePlayerID = (firstName, lastName, dob, format = 'dmy') => {
    const initials = (0, lib_1.getInitials)([firstName, lastName], 2);
    const date = (0, timeAndDate_1.formatDate)(dob, 'dd/mm/yyyy');
    const dmy = date.split('/').reverse();
    const codes = {
        dmy: dmy[2] + dmy[1] + dmy[0].substring(2),
        dym: dmy[2] + dmy[0].substring(2) + dmy[1],
        mdy: dmy[1] + dmy[2] + dmy[0].substring(2),
        myd: dmy[1] + dmy[0].substring(2) + dmy[2],
        ydm: dmy[0].substring(2) + dmy[2] + dmy[1],
        ymd: dmy[0].substring(2) + dmy[1] + dmy[2],
    };
    return initials.toUpperCase() + codes[format];
};
exports.generatePlayerID = generatePlayerID;
// POST /api/players
const createPlayer = async (req, res) => {
    try {
        const pf = req.body;
        // Ensure unique code ----------------------------------------
        let playerCode = (0, exports.generatePlayerID)(pf.firstName, pf.lastName, pf.dob);
        const existingPlayerByCode = await player_model_1.default.findOne({ code: playerCode });
        if (existingPlayerByCode) {
            playerCode = (0, lib_1.getInitials)([pf.firstName, pf.lastName], 2) + (new Date()).getMilliseconds();
        }
        const slug = (0, lib_1.slugify)(`${pf.firstName}-${pf.lastName}-${playerCode}`);
        //--------------------------------------------------------------------------------
        const email = (pf.email || `${playerCode}@kfc.com`).toLowerCase();
        const existingPlayerByEmail = await player_model_1.default.findOne({ email });
        if (existingPlayerByEmail) {
            return res.status(409).json({
                message: `Duplicate email found - ${email}`,
                success: false
            });
        }
        const ageStatus = (0, lib_1.getAge)(pf.dob) < 10 ? player_interface_1.EPlayerAgeStatus.JUVENILE : player_interface_1.EPlayerAgeStatus.YOUTH;
        const about = pf.about || (0, about_1.generatePlayerAbout)(pf.firstName, pf.lastName, pf.position);
        const newPlayer = await player_model_1.default.create({
            ...pf,
            slug,
            code: playerCode,
            email,
            about,
            ageStatus
        });
        // Create User
        const existingUser = await user_model_1.default.findOne({ email: pf.email });
        if (!existingUser) {
            const password = await bcryptjs_1.default.hash('kfc', 10);
            await user_model_1.default.create({
                email,
                name: `${pf.lastName} ${pf.firstName}`,
                image: pf.avatar,
                lastLoginAccount: 'credentials',
                password,
                role: user_1.EUserRole.PLAYER,
                about
            });
        }
        res.status(201).json({
            message: "Player Added",
            success: true,
            data: newPlayer
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error),
            success: false,
            data: error
        });
    }
};
exports.createPlayer = createPlayer;
// PUT /api/players/:id
const updatePlayer = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        // If updating name or dob, regenerate slug and code
        if (updateData.firstName || updateData.lastName || updateData.dob) {
            const player = await player_model_1.default.findById(id);
            if (player) {
                const firstName = updateData.firstName || player.firstName;
                const lastName = updateData.lastName || player.lastName;
                const dob = updateData.dob || player.dob;
                // Regenerate code if needed
                if (updateData.firstName || updateData.lastName || updateData.dob) {
                    let newCode = (0, exports.generatePlayerID)(firstName, lastName, dob);
                    const existingPlayerByCode = await player_model_1.default.findOne({
                        code: newCode,
                        _id: { $ne: id }
                    });
                    if (existingPlayerByCode) {
                        newCode = (0, lib_1.getInitials)([firstName, lastName], 2) + (new Date()).getMilliseconds();
                    }
                    updateData.code = newCode;
                }
                // Regenerate slug
                updateData.slug = (0, lib_1.slugify)(`${firstName}-${lastName}-${updateData.code || player.code}`);
            }
        }
        // Update age status if dob changed
        if (updateData.dob) {
            updateData.ageStatus = (0, lib_1.getAge)(updateData.dob) < 10 ? player_interface_1.EPlayerAgeStatus.JUVENILE : player_interface_1.EPlayerAgeStatus.YOUTH;
        }
        // Update about if not provided but other fields changed
        if (!updateData.about && (updateData.firstName || updateData.lastName || updateData.position)) {
            const player = await player_model_1.default.findById(id);
            if (player) {
                updateData.about = (0, about_1.generatePlayerAbout)(updateData.firstName || player.firstName, updateData.lastName || player.lastName, updateData.position || player.position);
            }
        }
        const cleanedData = (0, lib_1.removeEmptyKeys)(updateData);
        const updatedPlayer = await player_model_1.default.findByIdAndUpdate(id, cleanedData, { new: true, runValidators: true }).populate({
            path: "galleries",
            populate: { path: 'files' }
        });
        if (!updatedPlayer) {
            return res.status(404).json({
                success: false,
                message: "Player not found",
            });
        }
        // Update corresponding user if email changed
        if (updateData.email || updateData.firstName || updateData.lastName || updateData.avatar) {
            const userUpdateData = {};
            if (updateData.email)
                userUpdateData.email = updateData.email;
            if (updateData.firstName || updateData.lastName) {
                userUpdateData.name = `${updateData.lastName || updatedPlayer.lastName} ${updateData.firstName || updatedPlayer.firstName}`;
            }
            if (updateData.avatar)
                userUpdateData.image = updateData.avatar;
            if (updateData.about)
                userUpdateData.about = updateData.about;
            if (Object.keys(userUpdateData).length > 0) {
                await user_model_1.default.findOneAndUpdate({ email: updatedPlayer.email }, userUpdateData);
            }
        }
        res.status(200).json({
            success: true,
            message: "Player updated successfully",
            data: updatedPlayer,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update player"),
        });
    }
};
exports.updatePlayer = updatePlayer;
const getPlayerBySlugOrId = async (req, res) => {
    try {
        const playerId = req.params.slug;
        const slug = (0, slug_1.slugIdFilters)(playerId);
        const player = await player_model_1.default.findOne(slug)
            .populate({ path: "galleries", populate: { path: 'files' } })
            .populate('matches')
            .populate('mvps')
            .populate('cards')
            .populate('injuries')
            .populate('goals')
            .populate('assists')
            .lean();
        if (!player) {
            return res.status(404).json({
                success: false,
                message: "Player not found",
            });
        }
        res.status(200).json({
            success: true,
            data: player,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch player"),
        });
    }
};
exports.getPlayerBySlugOrId = getPlayerBySlugOrId;
// PUT /api/players/:playerId - Update only relevant fields at a time
const updatePlayerBySlugOrId = async (req, res) => {
    try {
        const playerId = req.params.slug;
        const slug = (0, slug_1.slugIdFilters)(playerId);
        const formData = req.body;
        const updates = { ...formData };
        const updatedPlayer = await player_model_1.default.findOneAndUpdate(slug, { $set: updates }, { new: true } // Return updated document
        );
        if (!updatedPlayer) {
            return res.status(404).json({
                success: false,
                message: "Player not found",
            });
        }
        // REMOVE AFTER - Update existing players to have Code
        let playerCode = (0, exports.generatePlayerID)(updatedPlayer.firstName, updatedPlayer.lastName, updatedPlayer.dob);
        if (!updatedPlayer.code) {
            const existingPlayerByCode = await player_model_1.default.findOne({ code: playerCode });
            if (!existingPlayerByCode) {
                await player_model_1.default.findOneAndUpdate(slug, { $set: { code: playerCode } });
                updatedPlayer.code = playerCode;
            }
            else {
                playerCode = (0, lib_1.getInitials)([updatedPlayer.firstName, updatedPlayer.lastName], 2) +
                    (new Date()).getMilliseconds();
                await player_model_1.default.findOneAndUpdate(slug, { $set: { code: playerCode } });
                updatedPlayer.code = playerCode;
            }
        }
        res.status(200).json({
            message: "Update success",
            success: true,
            data: updatedPlayer,
        });
    }
    catch (error) {
        res.status(500).json({
            message: `Update failed. ${(0, lib_1.getErrorMessage)(error)}`,
            success: false,
        });
    }
};
exports.updatePlayerBySlugOrId = updatePlayerBySlugOrId;
// DELETE /api/players/:playerId
const deletePlayerBySlugOrId = async (req, res) => {
    try {
        const playerId = req.params.slug;
        const slug = (0, slug_1.slugIdFilters)(playerId);
        // Check authorization - only SUPER_ADMIN can delete
        if (req.user?.role !== user_1.EUserRole.SUPER_ADMIN) {
            return res.status(403).json({
                message: `You are not authorized to perform this action`,
                success: false,
            });
        }
        // Find player first
        const player = await player_model_1.default.findOne(slug);
        if (!player) {
            return res.status(404).json({
                success: false,
                message: "Player not found",
            });
        }
        // Archive the player
        await archive_model_1.default.updateOne({ sourceCollection: "players" }, { $push: { data: player } }, { upsert: true });
        // Now remove player
        const deleted = await player_model_1.default.findOneAndDelete(slug);
        // Delete from users
        await user_model_1.default.findOneAndDelete({ email: deleted?.email });
        // Log the action
        await (0, helper_1.logAction)({
            title: "Player Deleted",
            description: `Player with id [${playerId}] deleted on ${new Date().toLocaleString()}`,
            severity: log_interface_1.ELogSeverity.CRITICAL,
            meta: deleted,
        });
        res.status(200).json({
            message: "Deleted successful",
            success: true,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Delete failed. ${(0, lib_1.getErrorMessage)(error)}`,
            success: false,
        });
    }
};
exports.deletePlayerBySlugOrId = deletePlayerBySlugOrId;
// PATCH /api/players/:playerId - Partial updates
const patchPlayerBySlugOrId = async (req, res) => {
    try {
        const playerId = req.params.slug;
        const slug = (0, slug_1.slugIdFilters)(playerId);
        const updates = req.body;
        // Remove undefined or null values
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined || updates[key] === null) {
                delete updates[key];
            }
        });
        const updatedPlayer = await player_model_1.default.findOneAndUpdate(slug, { $set: updates }, { new: true, runValidators: true }).populate({ path: "galleries", populate: { path: 'files' } });
        if (!updatedPlayer) {
            return res.status(404).json({
                success: false,
                message: "Player not found",
            });
        }
        // Log the update
        await (0, helper_1.logAction)({
            title: "Player Updated",
            description: `Player [${updatedPlayer.firstName} ${updatedPlayer.lastName}] updated`,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: { updates, playerId: updatedPlayer._id },
        });
        res.status(200).json({
            success: true,
            message: "Player updated successfully",
            data: updatedPlayer,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update player"),
        });
    }
};
exports.patchPlayerBySlugOrId = patchPlayerBySlugOrId;
