// controllers/feature.controller.ts
import type { Request, Response } from "express";

import { QueryFilter } from "mongoose";
import { removeEmptyKeys, getErrorMessage } from "../../lib";
import { ELogSeverity } from "../../types/log.interface";
import { logAction } from "../logs/helper";
import FeatureModel from "./feature.model";

// GET /api/features
export const getFeatures = async (req: Request, res: Response) => {
    try {
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "10", 10);
        const skip = (page - 1) * limit;

        const search = (req.query.search as string) || "";
        const featureName = (req.query.name as string) || "";
        const isActive = req.query.isActive === 'true';
        const category = req.query.category as string;

        const regex = new RegExp(search, "i");

        const query: any = {};

        // Search filter
        if (search) {
            query.$or = [
                { "name": regex },
                { "category": regex },
                { "description": regex },
            ];
        }

        // Name exact match
        if (featureName) {
            query.name = featureName;
        }

        // Active status filter
        if (req.query.isActive !== undefined) {
            query.isActive = isActive;
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        const cleaned = removeEmptyKeys(query);

        const features = await FeatureModel.find(cleaned)
            .limit(limit)
            .skip(skip)
            .lean()
            .sort({ category: 1, name: 1 });

        const total = await FeatureModel.countDocuments(cleaned);

        res.status(200).json({
            success: true,
            data: features,
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
            message: getErrorMessage(error, "Failed to fetch features"),
        });
    }
};

// GET /api/features/:name
export const getFeatureByName = async (req: Request, res: Response) => {
    try {
        const name = req.params.name as string;
        const regex = new RegExp(name, "i");

        const feature = await FeatureModel.findOne({ name: regex }).lean();

        if (!feature) {
            return res.status(404).json({
                success: false,
                message: "Feature not found",
            });
        }

        res.status(200).json({
            success: true,
            data: feature,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch feature"),
        });
    }
};

// GET /api/features/category/:category
export const getFeaturesByCategory = async (req: Request, res: Response) => {
    try {
        const { category } = req.params;

        const features = await FeatureModel.find({
            category,
            isActive: true
        })
            .sort({ name: 1 })
            .lean();

        res.status(200).json({
            success: true,
            data: features,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch features by category"),
        });
    }
};

// POST /api/features
export const createFeature = async (req: Request, res: Response) => {
    try {
        const { name, data, description, category, isActive, settings } = req.body;

        // Check if feature already exists (case insensitive)
        const exists = await FeatureModel.findOne({
            name: new RegExp(`^${name}$`, 'i')
        });

        if (exists) {
            return res.status(409).json({
                message: "Feature already exists.",
                success: false
            });
        }

        // Create feature
        const savedFeature = await FeatureModel.create({
            name,
            data: data || {},
            description: description || `${name} feature`,
            category: category || 'general',
            isActive: isActive !== undefined ? isActive : true,
            settings: settings || {},
            createdBy: req.user?.id,
            createdAt: new Date(),
        });

        // Log action
        await logAction({
            title: `🚩 Feature Created - ${name}`,
            description: `New feature created in ${category || 'general'} category`,
            severity: ELogSeverity.INFO,
            
            meta: {
                featureId: savedFeature._id,
                name,
                category,
            },
        });

        res.status(201).json({
            message: "Feature created successfully!",
            success: true,
            data: savedFeature
        });

    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to create feature"),
            success: false,
        });
    }
};

// PUT /api/features/:id
export const updateFeatureById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data, name, description, category, isActive, settings } = req.body;

        // Check if name already exists (if name is being changed)
        if (name) {
            const existingFeature = await FeatureModel.findOne({
                name: new RegExp(`^${name}$`, 'i'),
                _id: { $ne: id }
            });

            if (existingFeature) {
                return res.status(409).json({
                    success: false,
                    message: "Feature with this name already exists",
                });
            }
        }

        const updated = await FeatureModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...(data && { data }),
                    ...(name && { name }),
                    ...(description && { description }),
                    ...(category && { category }),
                    ...(isActive !== undefined && { isActive }),
                    ...(settings && { settings }),
                    updatedAt: new Date(),
                    updatedBy: req.user?.id,
                }
            },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Feature not found",
            });
        }

        // Log action
        await logAction({
            title: "🚩 Feature Updated",
            description: `Feature ${updated.name} updated`,
            severity: ELogSeverity.INFO,
            
            meta: {
                featureId: id,
                name: updated.name,
                updates: Object.keys(req.body),
            },
        });

        res.status(200).json({
            success: true,
            data: updated,
            message: 'Feature updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update feature"),
        });
    }
};

// PUT /api/features/name/:name
export const updateFeatureByName = async (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        const { user, data, description, category, isActive, settings } = req.body;

        const feature = await FeatureModel.findOne({
            name: new RegExp(`^${name}$`, 'i')
        });

        if (!feature) {
            return res.status(404).json({
                success: false,
                message: "Feature not found",
            });
        }

        const updated = await FeatureModel.findOneAndUpdate(
            { name: new RegExp(`^${name}$`, 'i') },
            {
                $set: {
                    ...(data && { data }),
                    ...(description && { description }),
                    ...(category && { category }),
                    ...(isActive !== undefined && { isActive }),
                    ...(settings && { settings }),
                    updatedAt: new Date(),
                    updatedBy: req.user?.id || user?.id,
                }
            },
            { new: true, runValidators: true }
        );

        // Log action
        await logAction({
            title: "🚩 Feature Updated",
            description: `Feature ${name} updated by ${user?.name || req.user?.name || 'Admin'}`,
            severity: ELogSeverity.INFO,
            
            meta: {
                featureId: feature._id,
                name,
                updates: Object.keys(req.body),
            },
        });

        res.status(200).json({
            success: true,
            data: updated,
            message: 'Feature updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update feature"),
        });
    }
};

// PATCH /api/features/:id/toggle
export const toggleFeatureStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const feature = await FeatureModel.findById(id);

        if (!feature) {
            return res.status(404).json({
                success: false,
                message: "Feature not found",
            });
        }

        const updated = await FeatureModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    isActive,
                    updatedAt: new Date(),
                    updatedBy: req.user?.id,
                },
            },
            { new: true }
        );

        // Log action
        await logAction({
            title: `🚩 Feature ${isActive ? 'Enabled' : 'Disabled'}`,
            description: `Feature ${feature.name} ${isActive ? 'enabled' : 'disabled'}`,
            severity: isActive ? ELogSeverity.INFO : ELogSeverity.WARNING,
            
            meta: {
                featureId: id,
                name: feature.name,
                previousState: feature.isActive,
                newState: isActive,
            },
        });

        res.status(200).json({
            success: true,
            data: updated,
            message: `Feature ${isActive ? 'enabled' : 'disabled'} successfully`,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to toggle feature status"),
        });
    }
};

// DELETE /api/features/:id
export const deleteFeatureById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const feature = await FeatureModel.findById(id);

        if (!feature) {
            return res.status(404).json({
                success: false,
                message: "Feature not found",
            });
        }

        const deleted = await FeatureModel.findByIdAndDelete(id);

        // Log action
        await logAction({
            title: "🚩 Feature Deleted",
            description: `Feature ${feature.name} deleted`,
            severity: ELogSeverity.CRITICAL,
            
            meta: {
                featureId: id,
                name: feature.name,
                category: feature.category,
            },
        });

        res.status(200).json({
            success: true,
            data: deleted,
            message: 'Feature deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to delete feature"),
        });
    }
};

// DELETE /api/features/name/:name
export const deleteFeatureByName = async (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        const { user } = req.body;

        const feature = await FeatureModel.findOne({
            name: new RegExp(`^${name}$`, 'i')
        });

        if (!feature) {
            return res.status(404).json({
                success: false,
                message: "Feature not found",
            });
        }

        const deleted = await FeatureModel.findOneAndDelete({
            name: new RegExp(`^${name}$`, 'i')
        });

        // Log action
        await logAction({
            title: "🚩 Feature Deleted",
            description: `Feature ${name} deleted by ${user?.name || req.user?.name || 'Admin'}`,
            severity: ELogSeverity.WARNING,
            
            meta: {
                featureId: feature._id,
                name,
                category: feature.category,
            },
        });

        res.status(200).json({
            success: true,
            data: deleted,
            message: 'Feature deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to delete feature"),
        });
    }
};

// GET /api/features/check/:name
export const checkFeatureStatus = async (req: Request, res: Response) => {
    try {
        const { name } = req.params;

        const feature = await FeatureModel.findOne({
            name: new RegExp(`^${name}$`, 'i')
        }).lean();

        res.status(200).json({
            success: true,
            data: {
                exists: !!feature,
                isActive: feature?.isActive || false,
                feature: feature || null,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to check feature status"),
        });
    }
};

// GET /api/features/stats
export const getFeatureStats = async (req: Request, res: Response) => {
    try {
        const stats = await FeatureModel.aggregate([
            {
                $facet: {
                    totalFeatures: [{ $count: "count" }],
                    byCategory: [
                        {
                            $group: {
                                _id: "$category",
                                count: { $sum: 1 },
                                active: {
                                    $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
                                },
                                inactive: {
                                    $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] }
                                },
                            },
                        },
                        { $sort: { count: -1 } },
                    ],
                    activeStats: [
                        {
                            $group: {
                                _id: null,
                                active: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
                                inactive: { $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] } },
                            },
                        },
                    ],
                    recentFeatures: [
                        { $sort: { createdAt: -1 } },
                        { $limit: 10 },
                        {
                            $project: {
                                name: 1,
                                category: 1,
                                isActive: 1,
                                createdAt: 1,
                            },
                        },
                    ],
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalFeatures: stats[0]?.totalFeatures[0]?.count || 0,
                byCategory: stats[0]?.byCategory || [],
                activeStats: stats[0]?.activeStats[0] || { active: 0, inactive: 0 },
                recentFeatures: stats[0]?.recentFeatures || [],
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch feature statistics"),
        });
    }
};