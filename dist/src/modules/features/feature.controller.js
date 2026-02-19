"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeatureStats = exports.checkFeatureStatus = exports.deleteFeatureByName = exports.deleteFeatureById = exports.toggleFeatureStatus = exports.updateFeatureByName = exports.updateFeatureById = exports.createFeature = exports.getFeaturesByCategory = exports.getFeatureByName = exports.getFeatures = void 0;
const lib_1 = require("../../lib");
const log_interface_1 = require("../../types/log.interface");
const helper_1 = require("../logs/helper");
const feature_model_1 = __importDefault(require("./feature.model"));
// GET /api/features
const getFeatures = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const search = req.query.search || "";
        const featureName = req.query.name || "";
        const isActive = req.query.isActive === 'true';
        const category = req.query.category;
        const regex = new RegExp(search, "i");
        const query = {};
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
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        const features = await feature_model_1.default.find(cleaned)
            .limit(limit)
            .skip(skip)
            .lean()
            .sort({ category: 1, name: 1 });
        const total = await feature_model_1.default.countDocuments(cleaned);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch features"),
        });
    }
};
exports.getFeatures = getFeatures;
// GET /api/features/:name
const getFeatureByName = async (req, res) => {
    try {
        const name = req.params.name;
        const regex = new RegExp(name, "i");
        const feature = await feature_model_1.default.findOne({ name: regex }).lean();
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch feature"),
        });
    }
};
exports.getFeatureByName = getFeatureByName;
// GET /api/features/category/:category
const getFeaturesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const features = await feature_model_1.default.find({
            category,
            isActive: true
        })
            .sort({ name: 1 })
            .lean();
        res.status(200).json({
            success: true,
            data: features,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch features by category"),
        });
    }
};
exports.getFeaturesByCategory = getFeaturesByCategory;
// POST /api/features
const createFeature = async (req, res) => {
    try {
        const { name, data, description, category, isActive, settings } = req.body;
        // Check if feature already exists (case insensitive)
        const exists = await feature_model_1.default.findOne({
            name: new RegExp(`^${name}$`, 'i')
        });
        if (exists) {
            return res.status(409).json({
                message: "Feature already exists.",
                success: false
            });
        }
        // Create feature
        const savedFeature = await feature_model_1.default.create({
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
        await (0, helper_1.logAction)({
            title: `🚩 Feature Created - ${name}`,
            description: `New feature created in ${category || 'general'} category`,
            severity: log_interface_1.ELogSeverity.INFO,
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
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to create feature"),
            success: false,
        });
    }
};
exports.createFeature = createFeature;
// PUT /api/features/:id
const updateFeatureById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, name, description, category, isActive, settings } = req.body;
        // Check if name already exists (if name is being changed)
        if (name) {
            const existingFeature = await feature_model_1.default.findOne({
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
        const updated = await feature_model_1.default.findByIdAndUpdate(id, {
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
        }, { new: true, runValidators: true });
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Feature not found",
            });
        }
        // Log action
        await (0, helper_1.logAction)({
            title: "🚩 Feature Updated",
            description: `Feature ${updated.name} updated`,
            severity: log_interface_1.ELogSeverity.INFO,
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update feature"),
        });
    }
};
exports.updateFeatureById = updateFeatureById;
// PUT /api/features/name/:name
const updateFeatureByName = async (req, res) => {
    try {
        const { name } = req.params;
        const { user, data, description, category, isActive, settings } = req.body;
        const feature = await feature_model_1.default.findOne({
            name: new RegExp(`^${name}$`, 'i')
        });
        if (!feature) {
            return res.status(404).json({
                success: false,
                message: "Feature not found",
            });
        }
        const updated = await feature_model_1.default.findOneAndUpdate({ name: new RegExp(`^${name}$`, 'i') }, {
            $set: {
                ...(data && { data }),
                ...(description && { description }),
                ...(category && { category }),
                ...(isActive !== undefined && { isActive }),
                ...(settings && { settings }),
                updatedAt: new Date(),
                updatedBy: req.user?.id || user?.id,
            }
        }, { new: true, runValidators: true });
        // Log action
        await (0, helper_1.logAction)({
            title: "🚩 Feature Updated",
            description: `Feature ${name} updated by ${user?.name || req.user?.name || 'Admin'}`,
            severity: log_interface_1.ELogSeverity.INFO,
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update feature"),
        });
    }
};
exports.updateFeatureByName = updateFeatureByName;
// PATCH /api/features/:id/toggle
const toggleFeatureStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const feature = await feature_model_1.default.findById(id);
        if (!feature) {
            return res.status(404).json({
                success: false,
                message: "Feature not found",
            });
        }
        const updated = await feature_model_1.default.findByIdAndUpdate(id, {
            $set: {
                isActive,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true });
        // Log action
        await (0, helper_1.logAction)({
            title: `🚩 Feature ${isActive ? 'Enabled' : 'Disabled'}`,
            description: `Feature ${feature.name} ${isActive ? 'enabled' : 'disabled'}`,
            severity: isActive ? log_interface_1.ELogSeverity.INFO : log_interface_1.ELogSeverity.WARNING,
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to toggle feature status"),
        });
    }
};
exports.toggleFeatureStatus = toggleFeatureStatus;
// DELETE /api/features/:id
const deleteFeatureById = async (req, res) => {
    try {
        const { id } = req.params;
        const feature = await feature_model_1.default.findById(id);
        if (!feature) {
            return res.status(404).json({
                success: false,
                message: "Feature not found",
            });
        }
        const deleted = await feature_model_1.default.findByIdAndDelete(id);
        // Log action
        await (0, helper_1.logAction)({
            title: "🚩 Feature Deleted",
            description: `Feature ${feature.name} deleted`,
            severity: log_interface_1.ELogSeverity.CRITICAL,
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to delete feature"),
        });
    }
};
exports.deleteFeatureById = deleteFeatureById;
// DELETE /api/features/name/:name
const deleteFeatureByName = async (req, res) => {
    try {
        const { name } = req.params;
        const { user } = req.body;
        const feature = await feature_model_1.default.findOne({
            name: new RegExp(`^${name}$`, 'i')
        });
        if (!feature) {
            return res.status(404).json({
                success: false,
                message: "Feature not found",
            });
        }
        const deleted = await feature_model_1.default.findOneAndDelete({
            name: new RegExp(`^${name}$`, 'i')
        });
        // Log action
        await (0, helper_1.logAction)({
            title: "🚩 Feature Deleted",
            description: `Feature ${name} deleted by ${user?.name || req.user?.name || 'Admin'}`,
            severity: log_interface_1.ELogSeverity.WARNING,
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to delete feature"),
        });
    }
};
exports.deleteFeatureByName = deleteFeatureByName;
// GET /api/features/check/:name
const checkFeatureStatus = async (req, res) => {
    try {
        const { name } = req.params;
        const feature = await feature_model_1.default.findOne({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to check feature status"),
        });
    }
};
exports.checkFeatureStatus = checkFeatureStatus;
// GET /api/features/stats
const getFeatureStats = async (req, res) => {
    try {
        const stats = await feature_model_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch feature statistics"),
        });
    }
};
exports.getFeatureStats = getFeatureStats;
