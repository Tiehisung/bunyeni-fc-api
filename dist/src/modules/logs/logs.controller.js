"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLog = exports.cleanupOldLogs = exports.searchLogs = exports.getLogStats = exports.getLogsBySeverity = exports.getLogsByUser = exports.getLogById = exports.getLogs = void 0;
require("../models/user"); // Ensure user model is registered for population
const lib_1 = require("../../lib");
const logs_model_1 = __importDefault(require("./logs.model"));
const log_interface_1 = require("../../types/log.interface");
// GET /api/logs
const getLogs = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "20", 10);
        const search = req.query.log_search || "";
        const severity = req.query.severity || "";
        const category = req.query.category || "";
        const userId = req.query.userId || "";
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        const skip = (page - 1) * limit;
        const regex = new RegExp(search, "i");
        // Build query
        const query = {
            $or: [
                { "title": regex },
                { "severity": regex },
                { "category": regex },
            ],
        };
        // Add optional filters
        if (severity) {
            query.severity = severity;
        }
        if (category) {
            query.category = category;
        }
        if (userId) {
            query.userId = userId;
        }
        // Date range filter
        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) {
                query.createdAt.$gte = new Date(fromDate);
            }
            if (toDate) {
                query.createdAt.$lte = new Date(toDate);
            }
        }
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        const logs = await logs_model_1.default.find(cleaned)
            .populate('userId', 'name email') // Populate user details
            .sort({ createdAt: 'desc' })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await logs_model_1.default.countDocuments(cleaned);
        res.status(200).json({
            success: true,
            data: logs,
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
            message: "Failed to fetch logs",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getLogs = getLogs;
// GET /api/logs/:id
const getLogById = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await logs_model_1.default.findById(id)
            .populate('userId', 'name email')
            .lean();
        if (!log) {
            return res.status(404).json({
                success: false,
                message: "Log not found",
            });
        }
        res.status(200).json({
            success: true,
            data: log,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch log",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getLogById = getLogById;
// GET /api/logs/user/:userId
const getLogsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "20", 10);
        const skip = (page - 1) * limit;
        const logs = await logs_model_1.default.find({ userId })
            .populate('userId', 'name email')
            .sort({ createdAt: 'desc' })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await logs_model_1.default.countDocuments({ userId });
        res.status(200).json({
            success: true,
            data: logs,
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
            message: "Failed to fetch user logs",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getLogsByUser = getLogsByUser;
// GET /api/logs/severity/:severity
const getLogsBySeverity = async (req, res) => {
    try {
        const severity = req.params.severity;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "20", 10);
        const skip = (page - 1) * limit;
        // Validate severity
        const validSeverities = Object.values(log_interface_1.ELogSeverity);
        if (!validSeverities.includes(severity)) {
            return res.status(400).json({
                success: false,
                message: "Invalid severity level",
                validSeverities,
            });
        }
        const logs = await logs_model_1.default.find({ severity })
            .populate('userId', 'name email')
            .sort({ createdAt: 'desc' })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await logs_model_1.default.countDocuments({ severity });
        res.status(200).json({
            success: true,
            data: logs,
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
            message: "Failed to fetch logs by severity",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getLogsBySeverity = getLogsBySeverity;
// GET /api/logs/stats
const getLogStats = async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const numDays = Number.parseInt(days, 10);
        // Calculate date range
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - numDays);
        // Get counts by severity
        const severityStats = await logs_model_1.default.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: "$severity",
                    count: { $sum: 1 },
                    lastLog: { $max: "$createdAt" }
                }
            },
            {
                $project: {
                    severity: "$_id",
                    count: 1,
                    lastLog: 1,
                    _id: 0
                }
            }
        ]);
        // Get counts by category
        const categoryStats = await logs_model_1.default.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    category: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);
        // Get logs over time (daily counts)
        const timeStats = await logs_model_1.default.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    critical: {
                        $sum: { $cond: [{ $eq: ["$severity", "critical"] }, 1, 0] }
                    },
                    error: {
                        $sum: { $cond: [{ $eq: ["$severity", "error"] }, 1, 0] }
                    },
                    warning: {
                        $sum: { $cond: [{ $eq: ["$severity", "warning"] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
            },
            {
                $project: {
                    date: {
                        $dateFromParts: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day"
                        }
                    },
                    count: 1,
                    critical: 1,
                    error: 1,
                    warning: 1,
                    _id: 0
                }
            }
        ]);
        const totalLogs = await logs_model_1.default.countDocuments({
            createdAt: { $gte: startDate }
        });
        res.status(200).json({
            success: true,
            data: {
                period: `${numDays} days`,
                totalLogs,
                severityStats,
                categoryStats,
                timeStats,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch log statistics",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getLogStats = getLogStats;
// GET /api/logs/search
const searchLogs = async (req, res) => {
    try {
        const { q, field } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            });
        }
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "20", 10);
        const skip = (page - 1) * limit;
        const searchRegex = new RegExp(q, "i");
        // Build search query based on field or search all
        let query = {};
        if (field) {
            // Search specific field
            query[field] = searchRegex;
        }
        else {
            // Search across multiple fields
            query = {
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                    { category: searchRegex },
                    { severity: searchRegex },
                    { 'meta': searchRegex }, // This might not work well with objects
                ]
            };
        }
        const logs = await logs_model_1.default.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: 'desc' })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await logs_model_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            data: logs,
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
            message: "Failed to search logs",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.searchLogs = searchLogs;
// DELETE /api/logs/old (cleanup old logs - admin only)
const cleanupOldLogs = async (req, res) => {
    try {
        const { olderThan = 90 } = req.query; // Default: delete logs older than 90 days
        const days = Number.parseInt(olderThan, 10);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const result = await logs_model_1.default.deleteMany({
            createdAt: { $lt: cutoffDate }
        });
        res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} logs older than ${days} days`,
            deletedCount: result.deletedCount,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to cleanup old logs",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.cleanupOldLogs = cleanupOldLogs;
// DELETE /api/logs/:id (delete specific log - admin only)
const deleteLog = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await logs_model_1.default.findByIdAndDelete(id);
        if (!log) {
            return res.status(404).json({
                success: false,
                message: "Log not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Log deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete log",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteLog = deleteLog;
