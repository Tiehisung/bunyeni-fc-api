"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGalleryStats = exports.removeFileFromGallery = exports.addFilesToGallery = exports.deleteGallery = exports.patchGallery = exports.updateGallery = exports.createGallery = exports.getGalleriesByTag = exports.getGalleryById = exports.getGalleries = void 0;
const lib_1 = require("../../../lib");
const gallery_model_1 = __importDefault(require("./gallery.model"));
const file_model_1 = __importDefault(require("../files/file.model"));
const helper_1 = require("../../archives/helper");
const helper_2 = require("../../logs/helper");
const log_interface_1 = require("../../../types/log.interface");
const archive_interface_1 = require("../../../types/archive.interface");
// GET /api/galleries
const getGalleries = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const search = req.query.gallery_search || "";
        const tagsParam = req.query.tags || "";
        const tags = tagsParam
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        const skip = (page - 1) * limit;
        const regex = new RegExp(search, "i");
        // Build Query Object
        const query = {};
        if (tags.length > 0) {
            query.tags = { $in: tags };
        }
        if (search) {
            query.$or = [
                { title: regex },
                { description: regex },
                { tags: regex },
            ];
        }
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        // Apply filters here
        const galleries = await gallery_model_1.default.find(cleaned)
            .populate("files")
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await gallery_model_1.default.countDocuments(cleaned);
        res.status(200).json({
            success: true,
            data: galleries,
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch galleries"),
        });
    }
};
exports.getGalleries = getGalleries;
// GET /api/galleries/:id
const getGalleryById = async (req, res) => {
    try {
        const { id } = req.params;
        const gallery = await gallery_model_1.default.findById(id)
            .populate("files")
            .lean();
        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }
        //Archive
        (0, helper_1.saveToArchive)({
            data: gallery,
            originalId: `${id}`,
            sourceCollection: archive_interface_1.EArchivesCollection.GALLERIES,
            reason: 'Sanitizing...',
        });
        // Log
        (0, helper_2.logAction)({
            title: ` Gallery [${gallery?.name}] deleted.`,
            description: gallery?.name,
            meta: gallery?.toString(),
            severity: log_interface_1.ELogSeverity.CRITICAL,
        });
        res.status(200).json({
            success: true,
            data: gallery,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch gallery"),
        });
    }
};
exports.getGalleryById = getGalleryById;
// GET /api/galleries/tag/:tag
const getGalleriesByTag = async (req, res) => {
    try {
        const { tag } = req.params;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const galleries = await gallery_model_1.default.find({ tags: tag })
            .populate("files")
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await gallery_model_1.default.countDocuments({ tags: tag });
        res.status(200).json({
            success: true,
            data: galleries,
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch galleries by tag"),
        });
    }
};
exports.getGalleriesByTag = getGalleriesByTag;
// POST /api/galleries
const createGallery = async (req, res) => {
    try {
        const { files, tags, title, description } = req.body;
        // Validate input
        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one file is required",
            });
        }
        // Save files to File collection
        const savedFiles = await file_model_1.default.insertMany(files);
        const fileIds = savedFiles.map(file => file._id);
        // Create gallery with saved file IDs
        const savedGallery = await gallery_model_1.default.create({
            files: fileIds,
            tags: tags || [],
            title: title || "Untitled Gallery",
            description: description || "",
            timestamp: Date.now(),
            createdBy: req.user, // From auth middleware
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        // Populate files for response
        const populatedGallery = await gallery_model_1.default.findById(savedGallery._id)
            .populate("files")
            .lean();
        res.status(201).json({
            message: "Gallery created successfully",
            success: true,
            data: populatedGallery,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to save gallery"),
            success: false,
        });
    }
};
exports.createGallery = createGallery;
// PUT /api/galleries/:id
const updateGallery = async (req, res) => {
    try {
        const { id } = req.params;
        const { files, tags, title, description } = req.body;
        // Find existing gallery
        const existingGallery = await gallery_model_1.default.findById(id);
        if (!existingGallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }
        // Handle file updates if provided
        let fileIds = existingGallery.files;
        if (files && Array.isArray(files) && files.length > 0) {
            // Save new files
            const savedFiles = await file_model_1.default.insertMany(files);
            fileIds = savedFiles.map(file => file._id);
        }
        // Update gallery
        const updatedGallery = await gallery_model_1.default.findByIdAndUpdate(id, {
            $set: {
                files: fileIds,
                tags: tags || existingGallery.tags,
                title: title || existingGallery.title,
                description: description !== undefined ? description : existingGallery.description,
                updatedAt: new Date(),
                updatedBy: req.user,
            },
        }, { new: true, runValidators: true }).populate("files");
        res.status(200).json({
            message: "Gallery updated successfully",
            success: true,
            data: updatedGallery,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to update gallery"),
            success: false,
        });
    }
};
exports.updateGallery = updateGallery;
// PATCH /api/galleries/:id (partial updates)
const patchGallery = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Remove undefined fields
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined || updates[key] === null) {
                delete updates[key];
            }
        });
        // Don't allow direct file updates through PATCH
        delete updates.files;
        const updatedGallery = await gallery_model_1.default.findByIdAndUpdate(id, {
            $set: {
                ...updates,
                updatedAt: new Date(),
                updatedBy: req.user,
            },
        }, { new: true, runValidators: true }).populate("files");
        if (!updatedGallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }
        res.status(200).json({
            message: "Gallery updated successfully",
            success: true,
            data: updatedGallery,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to update gallery"),
            success: false,
        });
    }
};
exports.patchGallery = patchGallery;
// DELETE /api/galleries/:id
const deleteGallery = async (req, res) => {
    try {
        const { id } = req.params;
        // Find gallery to get file IDs
        const gallery = await gallery_model_1.default.findById(id);
        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }
        // Delete associated files
        if (gallery.files && gallery.files.length > 0) {
            await file_model_1.default.deleteMany({ _id: { $in: gallery.files } });
        }
        // Delete gallery
        await gallery_model_1.default.findByIdAndDelete(id);
        res.status(200).json({
            message: "Gallery deleted successfully",
            success: true,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to delete gallery"),
            success: false,
        });
    }
};
exports.deleteGallery = deleteGallery;
// POST /api/galleries/:id/files (add files to existing gallery)
const addFilesToGallery = async (req, res) => {
    try {
        const { id } = req.params;
        const { files } = req.body;
        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one file is required",
            });
        }
        // Save new files
        const savedFiles = await file_model_1.default.insertMany(files);
        const fileIds = savedFiles.map(file => file._id);
        // Add to gallery
        const updatedGallery = await gallery_model_1.default.findByIdAndUpdate(id, {
            $push: { files: { $each: fileIds } },
            $set: { updatedAt: new Date(), updatedBy: req.user },
        }, { new: true }).populate("files");
        if (!updatedGallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }
        res.status(200).json({
            message: "Files added to gallery successfully",
            success: true,
            data: updatedGallery,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to add files to gallery"),
            success: false,
        });
    }
};
exports.addFilesToGallery = addFilesToGallery;
// DELETE /api/galleries/:id/files/:fileId (remove specific file from gallery)
const removeFileFromGallery = async (req, res) => {
    try {
        const { id, fileId } = req.params;
        // Remove file from gallery
        const updatedGallery = await gallery_model_1.default.findByIdAndUpdate(id, {
            $pull: { files: fileId },
            $set: { updatedAt: new Date(), updatedBy: req.user },
        }, { new: true }).populate("files");
        if (!updatedGallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }
        // Optionally delete the file from FileModel
        await file_model_1.default.findByIdAndDelete(fileId);
        res.status(200).json({
            message: "File removed from gallery successfully",
            success: true,
            data: updatedGallery,
        });
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to remove file from gallery"),
            success: false,
        });
    }
};
exports.removeFileFromGallery = removeFileFromGallery;
// GET /api/galleries/stats
const getGalleryStats = async (req, res) => {
    try {
        const stats = await gallery_model_1.default.aggregate([
            {
                $lookup: {
                    from: "files",
                    localField: "files",
                    foreignField: "_id",
                    as: "fileDetails",
                },
            },
            {
                $addFields: {
                    fileCount: { $size: "$files" },
                    totalSize: { $sum: "$fileDetails.size" },
                },
            },
            {
                $group: {
                    _id: null,
                    totalGalleries: { $sum: 1 },
                    totalFiles: { $sum: "$fileCount" },
                    totalSize: { $sum: "$totalSize" },
                    avgFilesPerGallery: { $avg: "$fileCount" },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalGalleries: 1,
                    totalFiles: 1,
                    totalSize: 1,
                    avgFilesPerGallery: { $round: ["$avgFilesPerGallery", 2] },
                },
            },
        ]);
        // Get tag distribution
        const tagStats = await gallery_model_1.default.aggregate([
            { $unwind: "$tags" },
            {
                $group: {
                    _id: "$tags",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
            {
                $limit: 20,
            },
            {
                $project: {
                    tag: "$_id",
                    count: 1,
                    _id: 0,
                },
            },
        ]);
        res.status(200).json({
            success: true,
            data: {
                summary: stats[0] || { totalGalleries: 0, totalFiles: 0, totalSize: 0, avgFilesPerGallery: 0 },
                topTags: tagStats,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch gallery statistics"),
        });
    }
};
exports.getGalleryStats = getGalleryStats;
