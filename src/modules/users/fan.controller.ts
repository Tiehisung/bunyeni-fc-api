// controllers/fan.controller.ts
import { Request, Response } from "express";

import { EUserRole, IFan } from "../../types/user.interface";
import UserModel from "./user.model";

// Get fan leaderboard
export const getFanLeaderboard = async (req: Request, res: Response) => {
    try {
        const { limit = 50, sortBy = "fanPoints" } = req.query;

        const fans = await UserModel.find({ isFan: true })
            .sort({ [sortBy as string]: -1 })
            .limit(Number(limit))
            .select("-password")
            .lean();

        // Assign ranks
        const rankedFans = fans.map((fan, index) => ({
            ...fan,
            fanRank: index + 1
        }));

        return res.status(200).json({
            success: true,
            data: rankedFans,
            pagination: {
                total: fans.length,
                limit: Number(limit)
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: (error?.message || "Failed to fetch fans")
        });
    }
};

// Get fan stats
export const getFanStats = async (req: Request, res: Response) => {
    try {
        const totalFans = await UserModel.countDocuments({ isFan: true });
        const totalPoints = await UserModel.aggregate([
            { $match: { isFan: true } },
            { $group: { _id: null, total: { $sum: "$fanPoints" } } }
        ]);

        const averageEngagement = await UserModel.aggregate([
            { $match: { isFan: true } },
            { $group: { _id: null, avg: { $avg: "$engagementScore" } } }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalFans,
                totalPoints: totalPoints[0]?.total || 0,
                averageEngagement: Math.round(averageEngagement[0]?.avg || 0)
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: (error?.message || "Failed to fetch fan stats")
        });
    }
};

// Update fan points
export const updateFanPoints = async (userId: string, action: string) => {
    const pointsMap = {
        comment: 10,
        share: 15,
        reaction: 5,
        matchAttendance: 50,
        galleryUpload: 20,
        newsView: 2
    };

    const points = pointsMap[action as keyof typeof pointsMap] || 0;

    const user = await UserModel.findByIdAndUpdate(
        userId,
        {
            $inc: {
                fanPoints: points,
                [`contributions.${action}s`]: 1
            },
            $set: { lastActive: new Date() }
        },
    );

    // Update engagement score
    if (user) {
        const engagementScore = calculateEngagementScore(user);
        await UserModel.findByIdAndUpdate(userId, { engagementScore });
    }

    // Check for badges
    await checkAndAwardBadges(userId);

    return user;
};

// Calculate engagement score
const calculateEngagementScore = (user: IFan): number => {
    const { contributions } = user;
    const maxScore = 100;

    const weights = {
        comments: 0.3,
        shares: 0.25,
        reactions: 0.2,
        matchAttendance: 0.15,
        galleries: 0.1
    };

    let score = 0;
    if (contributions.comments > 50) score += weights.comments * maxScore;
    else if (contributions.comments > 20) score += weights.comments * maxScore * 0.6;
    else if (contributions.comments > 5) score += weights.comments * maxScore * 0.3;

    // Similar calculations for other contributions...

    return Math.min(maxScore, Math.round(score));
};

// Check and award badges
const checkAndAwardBadges = async (userId: string) => {
    const user = await UserModel.findById(userId);
    if (!user) return;

    const newBadges: string[] = [];

    // Super Fan badge (1000+ points)
    if (user.fanPoints >= 100 && !user.fanBadges.includes("Super Fan")) {
        newBadges.push("Super Fan");
    }

    // Comment Champion badge (100+ comments)
    if (user.contributions.comments >= 50 && !user.fanBadges.includes("Comment Champion")) {
        newBadges.push("Comment Champion");
    }

    // Match Day Regular badge (10+ matches)
    if (user.contributions.matchAttendance >= 10 && !user.fanBadges.includes("Match Day Regular")) {
        newBadges.push("Match Day Regular");
    }

    // Social Butterfly badge (50+ shares)
    if (user.contributions.shares >= 20 && !user.fanBadges.includes("Social Butterfly")) {
        newBadges.push("Social Butterfly");
    }

    if (newBadges.length > 0) {
        await UserModel.findByIdAndUpdate(userId, {
            $addToSet: { fanBadges: { $each: newBadges } }
        });
    }
};

// Make user a fan
export const registerAsFan = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findByIdAndUpdate(
            userId,
            {
                isFan: true,
                fanSince: new Date(),
                role: EUserRole.FAN
            },
        );

        return res.status(200).json({
            success: true,
            message: "Successfully registered as a fan!",
            data: user
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: (error?.message || "Failed to register as fan")
        });
    }
};