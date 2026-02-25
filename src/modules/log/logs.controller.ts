// controllers/log.controller.ts
import { Request, Response } from "express";
import { removeEmptyKeys } from "../../lib";
import LogModel from "./logs.model";
import { ELogSeverity } from "../../types/log.interface";
import '../../shared/models.imports'// Ensure user model is registered for population

// GET /api/logs
export const getLogs = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "20", 10);
    const search = (req.query.log_search as string) || "";
    const severity = (req.query.severity as string) || "";
    const category = (req.query.category as string) || "";
    const userId = (req.query.userId as string) || "";
    const fromDate = req.query.fromDate as string;
    const toDate = req.query.toDate as string;

    const skip = (page - 1) * limit;

    const regex = new RegExp(search, "i");

    // Build query
    const query: any = {
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

    const cleaned = removeEmptyKeys(query);

    const logs = await LogModel.find(cleaned)

      .sort({ createdAt: 'desc' })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await LogModel.countDocuments(cleaned);

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch logs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/logs/:id
export const getLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const log = await LogModel.findById(id)
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch log",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/logs/user/:userId
export const getLogsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "20", 10);
    const skip = (page - 1) * limit;

    const logs = await LogModel.find({ userId })
      .sort({ createdAt: 'desc' })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await LogModel.countDocuments({ userId });

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user logs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/logs/severity/:severity
export const getLogsBySeverity = async (req: Request, res: Response) => {
  try {
    const severity = req.params.severity as ELogSeverity;
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "20", 10);
    const skip = (page - 1) * limit;

    // Validate severity
    const validSeverities = Object.values(ELogSeverity);
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: "Invalid severity level",
        validSeverities,
      });
    }

    const logs = await LogModel.find({ severity })
      .sort({ createdAt: 'desc' })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await LogModel.countDocuments({ severity });

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch logs by severity",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/logs/stats
export const getLogStats = async (req: Request, res: Response) => {
  try {
    const { days = 7 } = req.query;
    const numDays = Number.parseInt(days as string, 10);

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numDays);

    // Get counts by severity
    const severityStats = await LogModel.aggregate([
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
    const categoryStats = await LogModel.aggregate([
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
    const timeStats = await LogModel.aggregate([
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

    const totalLogs = await LogModel.countDocuments({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch log statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/logs/search
export const searchLogs = async (req: Request, res: Response) => {
  try {
    const { q, field } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "20", 10);
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(q as string, "i");

    // Build search query based on field or search all
    let query: any = {};

    if (field) {
      // Search specific field
      query[field as string] = searchRegex;
    } else {
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

    const logs = await LogModel.find(query)
      .sort({ createdAt: 'desc' })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await LogModel.countDocuments(query);

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to search logs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// DELETE /api/logs/old (cleanup old logs - admin only)
export const cleanupOldLogs = async (req: Request, res: Response) => {
  try {
    const { olderThan = 90 } = req.query; // Default: delete logs older than 90 days
    const days = Number.parseInt(olderThan as string, 10);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await LogModel.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} logs older than ${days} days`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cleanup old logs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// DELETE /api/logs/:id (delete specific log - admin only)
export const deleteLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const log = await LogModel.findByIdAndDelete(id);

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete log",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};