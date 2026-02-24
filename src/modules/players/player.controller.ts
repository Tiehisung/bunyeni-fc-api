// controllers/player.controller.ts
import type { Request, Response } from "express";

import bcrypt from "bcryptjs";

// Import models to ensure they're registered for populate

import { getAge, getErrorMessage, getInitials, removeEmptyKeys, slugify } from "../../lib";
import PlayerModel from "./player.model";
import { EUserRole } from "../../types/user";
import UserModel from "../users/user.model";
import { formatDate } from "../../lib/timeAndDate";
import { generatePlayerAbout } from "../../data/about";
import { EPlayerAgeStatus, EPlayerStatus, IPostPlayer } from "../../types/player.interface";
import { slugIdFilters } from "../../lib/slug";
import { logAction } from "../logs/helper";
import { ELogSeverity } from "../../types/log.interface";
import ArchiveModel from "../archives/archive.model";
import "../media/files/file.model";
import "../media/galleries/gallery.model";


// GET /api/players
export const getPlayers = async (req: Request, res: Response) => {
    try {
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const ageStatus = (req.query.ageStatus as string) || EPlayerAgeStatus.YOUTH;
        const limit = Number.parseInt(req.query.limit as string || "30", 10);
        const skip = (page - 1) * limit;

        const search = (req.query.player_search as string) || "";

        const status = (req.query.status as string) || EPlayerStatus.CURRENT;

        const regex = new RegExp(search, "i");

        const query: any = {
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

        const cleaned = removeEmptyKeys(query);

        const players = await PlayerModel.find(cleaned)
            .populate({
                path: "galleries",
                populate: { path: 'files' }
            })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await PlayerModel.countDocuments(cleaned);

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch players"),
        });
    }
};


// Helper function to generate player ID
export const generatePlayerID = (
    firstName: string,
    lastName: string,
    dob: string | Date,
    format: 'ymd' | 'ydm' | 'dmy' | 'dym' | 'mdy' | 'myd' = 'dmy'
) => {
    const initials = getInitials([firstName, lastName], 2);
    const date = formatDate(dob, 'dd/mm/yyyy');
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

// POST /api/players
export const createPlayer = async (req: Request, res: Response) => {
    try {
        const pf = req.body as IPostPlayer;

        // Ensure unique code ----------------------------------------
        let playerCode = generatePlayerID(pf.firstName, pf.lastName, pf.dob);

        const existingPlayerByCode = await PlayerModel.findOne({ code: playerCode });

        if (existingPlayerByCode) {
            playerCode = getInitials([pf.firstName, pf.lastName], 2) + (new Date()).getMilliseconds();
        }

        const slug = slugify(`${pf.firstName}-${pf.lastName}-${playerCode}`);
        //--------------------------------------------------------------------------------

        const email = (pf.email || `${playerCode}@kfc.com`).toLowerCase();

        const existingPlayerByEmail = await PlayerModel.findOne({ email });

        if (existingPlayerByEmail) {
            return res.status(409).json({
                message: `Duplicate email found - ${email}`,
                success: false
            });
        }

        const ageStatus = getAge(pf.dob) < 10 ? EPlayerAgeStatus.JUVENILE : EPlayerAgeStatus.YOUTH;

        const about = pf.about || generatePlayerAbout(pf.firstName, pf.lastName, pf.position);

        const newPlayer = await PlayerModel.create({
            ...pf,
            slug,
            code: playerCode,
            email,
            about,
            ageStatus
        });

        // Create User
        const existingUser = await UserModel.findOne({ email: pf.email });

        if (!existingUser) {
            const password = await bcrypt.hash('kfc', 10);

            await UserModel.create({
                email,
                name: `${pf.lastName} ${pf.firstName}`,
                image: pf.avatar,
                lastLoginAccount: 'credentials',
                password,
                role: EUserRole.PLAYER,
                about
            });
        }

        res.status(201).json({
            message: "Player Added",
            success: true,
            data: newPlayer
        });
    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error),
            success: false,
            data: error
        });
    }
};

 
export const getPlayer = async (req: Request, res: Response) => {
    try {
        const playerId = req.params.slug as string;

        const slug = slugIdFilters(playerId);

        const player = await PlayerModel.findOne(slug)
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch player"),
        });
    }
};

// PUT /api/players/:playerId - Update only relevant fields at a time
export const updatePlayer = async (req: Request, res: Response) => {
    try {
        const playerId = req.params.slug as string;

        const slug = slugIdFilters(playerId);
        const formData = req.body;

        const updates = { ...formData };

        const updatedPlayer = await PlayerModel.findOneAndUpdate(
            slug,
            { $set: updates },
            { new: true } // Return updated document
        );

        if (!updatedPlayer) {
            return res.status(404).json({
                success: false,
                message: "Player not found",
            });
        }

        // REMOVE AFTER - Update existing players to have Code
        let playerCode = generatePlayerID(
            updatedPlayer.firstName,
            updatedPlayer.lastName,
            updatedPlayer.dob
        );

        if (!updatedPlayer.code) {
            const existingPlayerByCode = await PlayerModel.findOne({ code: playerCode });

            if (!existingPlayerByCode) {
                await PlayerModel.findOneAndUpdate(
                    slug,
                    { $set: { code: playerCode } }
                );
                updatedPlayer.code = playerCode;
            } else {
                playerCode = getInitials([updatedPlayer.firstName, updatedPlayer.lastName], 2) +
                    (new Date()).getMilliseconds();
                await PlayerModel.findOneAndUpdate(
                    slug,
                    { $set: { code: playerCode } }
                );
                updatedPlayer.code = playerCode;
            }
        }

        res.status(200).json({
            message: "Update success",
            success: true,
            data: updatedPlayer,
        });
    } catch (error) {
        res.status(500).json({
            message: `Update failed. ${getErrorMessage(error)}`,
            success: false,
        });
    }
};

// DELETE /api/players/:playerId
export const deletePlayer = async (req: Request, res: Response) => {
    try {
        const playerId = req.params.slug as string;
        const slug = slugIdFilters(playerId);

        // Check authorization - only SUPER_ADMIN can delete
        if (req.user?.role !== EUserRole.SUPER_ADMIN) {
            return res.status(403).json({
                message: `You are not authorized to perform this action`,
                success: false,
            });
        }

        // Find player first
        const player = await PlayerModel.findOne(slug);

        if (!player) {
            return res.status(404).json({
                success: false,
                message: "Player not found",
            });
        }

        // Archive the player
        await ArchiveModel.updateOne(
            { sourceCollection: "players" },
            { $push: { data: player } },
            { upsert: true }
        );

        // Now remove player
        const deleted = await PlayerModel.findOneAndDelete(slug);

        // Delete from users
        await UserModel.findOneAndDelete({ email: deleted?.email });

        // Log the action
        await logAction({
            title: "Player Deleted",
            description: `Player with id [${playerId}] deleted on ${new Date().toLocaleString()}`,
            severity: ELogSeverity.CRITICAL,
            meta: deleted,

        });

        res.status(200).json({
            message: "Deleted successful",
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Delete failed. ${getErrorMessage(error)}`,
            success: false,
        });
    }
};

// PATCH /api/players/:playerId - Partial updates
export const patchPlayer = async (req: Request, res: Response) => {
    try {
        const playerId = req.params.slug as string;
        const slug = slugIdFilters(playerId);
        const updates = req.body;

        // Remove undefined or null values
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined || updates[key] === null) {
                delete updates[key];
            }
        });

        const updatedPlayer = await PlayerModel.findOneAndUpdate(
            slug,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate({ path: "galleries", populate: { path: 'files' } });

        if (!updatedPlayer) {
            return res.status(404).json({
                success: false,
                message: "Player not found",
            });
        }

        // Log the update
        await logAction({
            title: "Player Updated",
            description: `Player [${updatedPlayer.firstName} ${updatedPlayer.lastName}] updated`,
            severity: ELogSeverity.INFO,
            meta: { updates, playerId: updatedPlayer._id },

        });

        res.status(200).json({
            success: true,
            message: "Player updated successfully",
            data: updatedPlayer,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update player"),
        });
    }
};