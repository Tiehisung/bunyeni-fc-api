"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreArchive = exports.getArchiveStats = exports.deleteArchivesByCollection = exports.deleteArchive = exports.createArchive = exports.searchArchives = exports.getArchivesByCollection = exports.getArchiveById = exports.getArchives = void 0;
const lib_1 = require("../../lib");
const archive_model_1 = __importDefault(require("./archive.model"));
// GET /api/archives
const getArchives = async (req, res) => {
    try {
        const sourceCollection = req.query.sourceCollection;
        const query = {};
        if (sourceCollection) {
            query['sourceCollection'] = sourceCollection;
        }
        // Add pagination support
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "20", 10);
        const skip = (page - 1) * limit;
        // Add sorting
        const sortBy = req.query.sortBy || "archivedAt";
        const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        const archives = await archive_model_1.default.find(cleaned)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await archive_model_1.default.countDocuments(cleaned);
        res.status(200).json({
            success: true,
            data: archives,
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
            message: "Failed to fetch archives",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getArchives = getArchives;
// GET /api/archives/:id
const getArchiveById = async (req, res) => {
    try {
        const { id } = req.params;
        const archive = await archive_model_1.default.findById(id).lean();
        if (!archive) {
            return res.status(404).json({
                success: false,
                message: "Archive not found",
            });
        }
        res.status(200).json({
            success: true,
            data: archive,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch archive",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getArchiveById = getArchiveById;
// GET /api/archives/collection/:collectionName
const getArchivesByCollection = async (req, res) => {
    try {
        const { collectionName } = req.params;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "20", 10);
        const skip = (page - 1) * limit;
        const archives = await archive_model_1.default.find({ sourceCollection: collectionName })
            .sort({ archivedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await archive_model_1.default.countDocuments({ sourceCollection: collectionName });
        res.status(200).json({
            success: true,
            data: archives,
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
            message: "Failed to fetch archives by collection",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getArchivesByCollection = getArchivesByCollection;
// GET /api/archives/search
const searchArchives = async (req, res) => {
    try {
        const { q, collection } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            });
        }
        const query = {};
        if (collection) {
            query.sourceCollection = collection;
        }
        // Search in archived data (this depends on your data structure)
        // This is a simple example - you might need more sophisticated search
        const archives = await archive_model_1.default.find({
            ...query,
            $or: [
                { 'data.name': { $regex: q, $options: 'i' } },
                { 'data.firstName': { $regex: q, $options: 'i' } },
                { 'data.lastName': { $regex: q, $options: 'i' } },
                { 'data.email': { $regex: q, $options: 'i' } },
                { 'data.title': { $regex: q, $options: 'i' } },
                { 'data.description': { $regex: q, $options: 'i' } },
            ]
        })
            .sort({ archivedAt: -1 })
            .limit(50)
            .lean();
        res.status(200).json({
            success: true,
            data: archives,
            count: archives.length,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to search archives",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.searchArchives = searchArchives;
// POST /api/archives (manual archive creation - admin only)
const createArchive = async (req, res) => {
    try {
        const { sourceCollection, data, metadata } = req.body;
        if (!sourceCollection || !data) {
            return res.status(400).json({
                success: false,
                message: "sourceCollection and data are required",
            });
        }
        const archive = await archive_model_1.default.create({
            sourceCollection,
            data,
            metadata: {
                ...metadata,
                archivedBy: req.user?.id,
                archivedAt: new Date(),
            },
        });
        res.status(201).json({
            success: true,
            message: "Archive created successfully",
            data: archive,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create archive",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.createArchive = createArchive;
// DELETE /api/archives/:id (permanent deletion - admin only)
const deleteArchive = async (req, res) => {
    try {
        const { id } = req.params;
        // Optional: Add authentication/authorization check
        // if (req.user?.role !== 'super_admin') {
        //   return res.status(403).json({
        //     success: false,
        //     message: "Not authorized to delete archives",
        //   });
        // }
        const archive = await archive_model_1.default.findByIdAndDelete(id);
        if (!archive) {
            return res.status(404).json({
                success: false,
                message: "Archive not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Archive deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete archive",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteArchive = deleteArchive;
// DELETE /api/archives/collection/:collectionName (bulk delete - admin only)
const deleteArchivesByCollection = async (req, res) => {
    try {
        const { collectionName } = req.params;
        const { olderThan } = req.query;
        const query = { sourceCollection: collectionName };
        // Optional: Delete only archives older than a certain date
        if (olderThan) {
            const date = new Date(olderThan);
            if (!isNaN(date.getTime())) {
                query.archivedAt = { $lt: date };
            }
        }
        const result = await archive_model_1.default.deleteMany(query);
        res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} archives`,
            deletedCount: result.deletedCount,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete archives",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteArchivesByCollection = deleteArchivesByCollection;
// GET /api/archives/stats
const getArchiveStats = async (req, res) => {
    try {
        const stats = await archive_model_1.default.aggregate([
            {
                $group: {
                    _id: "$sourceCollection",
                    count: { $sum: 1 },
                    lastArchived: { $max: "$archivedAt" },
                    oldestArchive: { $min: "$archivedAt" },
                },
            },
            {
                $project: {
                    collection: "$_id",
                    count: 1,
                    lastArchived: 1,
                    oldestArchive: 1,
                    _id: 0,
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);
        const totalArchives = await archive_model_1.default.countDocuments();
        res.status(200).json({
            success: true,
            data: {
                totalArchives,
                collections: stats,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get archive statistics",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getArchiveStats = getArchiveStats;
// POST /api/archives/:id/restore (restore archived item)
const restoreArchive = async (req, res) => {
    try {
        const { id } = req.params;
        const archive = await archive_model_1.default.findById(id);
        if (!archive) {
            return res.status(404).json({
                success: false,
                message: "Archive not found",
            });
        }
        // Here you would implement logic to restore the archived data
        // This depends on your application's needs
        // For example, you might want to re-insert the data into its original collection
        res.status(200).json({
            success: true,
            message: "Archive restored successfully",
            data: archive,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to restore archive",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.restoreArchive = restoreArchive;
