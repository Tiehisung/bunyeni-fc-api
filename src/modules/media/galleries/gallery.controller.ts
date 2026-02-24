// controllers/gallery.controller.ts
import { Request, Response } from "express";
import { getErrorMessage, removeEmptyKeys } from "../../../lib";
import GalleryModel from "./gallery.model";
import { IGallery } from "../../../types/file.interface";
import FileModel from "../files/file.model";
import { saveToArchive } from "../../archives/helper";
import { logAction } from "../../log/helper";
import { ELogSeverity } from "../../../types/log.interface";
import { EArchivesCollection } from "../../../types/archive.interface";

// GET /api/galleries
export const getGalleries = async (req: Request, res: Response) => {
    try {
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "10", 10);
        const search = (req.query.gallery_search as string) || "";
        const tagsParam = (req.query.tags as string) || "";
        const tags = tagsParam
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const skip = (page - 1) * limit;
        const regex = new RegExp(search, "i");

        // Build Query Object
        const query: Record<string, unknown> = {};

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

        const cleaned = removeEmptyKeys(query);

        // Apply filters here
        const galleries = await GalleryModel.find(cleaned)
            .populate("files")
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await GalleryModel.countDocuments(cleaned);

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch galleries"),
        });
    }
};

// GET /api/galleries/:id
export const getGalleryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const gallery = await GalleryModel.findById(id)
            .populate("files")
            .lean();

        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }
        //Archive
        saveToArchive({
            data: gallery,
            originalId: `${id}`,
            sourceCollection: EArchivesCollection.GALLERIES,
            reason: 'Sanitizing...',
        })

        // Log
        logAction({
            title: ` Gallery [${gallery?.name}] deleted.`,
            description: gallery?.name,
            meta: gallery?.toString(),
            severity: ELogSeverity.CRITICAL,
        })
        res.status(200).json({
            success: true,
            data: gallery,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch gallery"),
        });
    }
};

// GET /api/galleries/tag/:tag
export const getGalleriesByTag = async (req: Request, res: Response) => {
    try {
        const { tag } = req.params;
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "10", 10);
        const skip = (page - 1) * limit;

        const galleries = await GalleryModel.find({ tags: tag })
            .populate("files")
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await GalleryModel.countDocuments({ tags: tag });

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch galleries by tag"),
        });
    }
};

// POST /api/galleries
export const createGallery = async (req: Request, res: Response) => {
    try {
        const { files, tags, title, description, } = req.body as IGallery;

        // Validate input
        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one file is required",
            });
        }

        // Save files to File collection
        const savedFiles = await FileModel.insertMany(files);
        const fileIds = savedFiles.map(file => file._id);

        // Create gallery with saved file IDs
        const savedGallery = await GalleryModel.create({
            files: fileIds,
            tags: tags || [],
            title: title || "Untitled Gallery",
            description: description || "",
            timestamp: Date.now(),
            // createdBy: req.user, // From auth middleware
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Populate files for response
        // const populatedGallery = await GalleryModel.findById(savedGallery._id)
        //     .populate("files")
        //     .lean();

        res.status(201).json({
            message: "Gallery created successfully",
            success: true,
            data: { ...savedGallery, files: savedFiles },
        });
    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to save gallery"),
            success: false,
        });
    }
};

// PUT /api/galleries/:id
export const updateGallery = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { files, tags, title, description } = req.body;

        // Find existing gallery
        const existingGallery = await GalleryModel.findById(id);
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
            const savedFiles = await FileModel.insertMany(files);
            fileIds = savedFiles.map(file => file._id);
        }

        // Update gallery
        const updatedGallery = await GalleryModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    files: fileIds,
                    tags: tags || existingGallery.tags,
                    title: title || existingGallery.title,
                    description: description !== undefined ? description : existingGallery.description,
                    updatedAt: new Date(),
                    // updatedBy: req.user,
                },
            },
            { new: true, runValidators: true }
        ).populate("files");

        res.status(200).json({
            message: "Gallery updated successfully",
            success: true,
            data: updatedGallery,
        });
    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to update gallery"),
            success: false,
        });
    }
};

// PATCH /api/galleries/:id (partial updates)
export const patchGallery = async (req: Request, res: Response) => {
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

        const updatedGallery = await GalleryModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...updates,
                    updatedAt: new Date(),
                    // updatedBy: req.user,
                },
            },
            { new: true, runValidators: true }
        ).populate("files");

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
    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to update gallery"),
            success: false,
        });
    }
};

// DELETE /api/galleries/:id
export const deleteGallery = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find gallery to get file IDs
        const gallery = await GalleryModel.findById(id);
        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }

        // Delete associated files
        if (gallery.files && gallery.files.length > 0) {
            await FileModel.deleteMany({ _id: { $in: gallery.files } });
        }

        // Delete gallery
        await GalleryModel.findByIdAndDelete(id);

        res.status(200).json({
            message: "Gallery deleted successfully",
            success: true,
        });
    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to delete gallery"),
            success: false,
        });
    }
};

// POST /api/galleries/:id/files (add files to existing gallery)
export const addFilesToGallery = async (req: Request, res: Response) => {
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
        const savedFiles = await FileModel.insertMany(files);
        const fileIds = savedFiles.map(file => file._id);

        // Add to gallery
        const updatedGallery = await GalleryModel.findByIdAndUpdate(
            id,
            {
                $push: { files: { $each: fileIds } },
                // $set: { updatedAt: new Date(), updatedBy: req.user },
            },
            { new: true }
        ).populate("files");

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
    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to add files to gallery"),
            success: false,
        });
    }
};

// DELETE /api/galleries/:id/files/:fileId (remove specific file from gallery)
export const removeFileFromGallery = async (req: Request, res: Response) => {
    try {
        const { id, fileId } = req.params;

        // Remove file from gallery
        const updatedGallery = await GalleryModel.findByIdAndUpdate(
            id,
            {
                $pull: { files: fileId },
                // $set: { updatedAt: new Date(), updatedBy: req.user },
            },
            { new: true }
        ).populate("files");

        if (!updatedGallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }

        // Optionally delete the file from FileModel
        await FileModel.findByIdAndDelete(fileId);

        res.status(200).json({
            message: "File removed from gallery successfully",
            success: true,
            data: updatedGallery,
        });
    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to remove file from gallery"),
            success: false,
        });
    }
};

// GET /api/galleries/stats
export const getGalleryStats = async (req: Request, res: Response) => {
    try {
        const stats = await GalleryModel.aggregate([
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
        const tagStats = await GalleryModel.aggregate([
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch gallery statistics"),
        });
    }
};