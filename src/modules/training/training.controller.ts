// controllers/training.controller.ts
import type { Request, Response } from "express";
import { removeEmptyKeys, getErrorMessage } from "../../lib";
import { formatDate } from "../../lib/timeAndDate";
import { ELogSeverity } from "../../types/log.interface";
import { logAction } from "../logs/helper";
import TrainingSessionModel, { IPostTrainingSession } from "./training.model";

// GET /api/training
export const getTrainingSessions = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "20", 10);
    const skip = (page - 1) * limit;

    const search = (req.query.training_search as string) || "";
    const fromDate = req.query.fromDate as string;
    const toDate = req.query.toDate as string;
    const location = req.query.location as string;
    const playerId = req.query.playerId as string;

    const regex = new RegExp(search, "i");

    let query: any = {};

    // Search filter
    if (search) {
      query.$or = [
        { "location": regex },
        { "note": regex },
        { "attendance.attendedBy.name": regex },
      ];
    }

    // Location filter
    if (location) {
      query.location = location;
    }

    // Date range filter
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) query.date.$lte = new Date(toDate);
    }

    // Player attendance filter
    if (playerId) {
      query["attendance.attendedBy._id"] = playerId;
    }

    const cleaned = removeEmptyKeys(query);

    const trainingSessions = await TrainingSessionModel.find(cleaned)
      .populate('recordedBy', 'name email')
      .populate('attendance.attendedBy', 'name firstName lastName number position')
      .limit(limit)
      .skip(skip)
      .lean()
      .sort({ date: -1, createdAt: "desc" });

    const total = await TrainingSessionModel.countDocuments(cleaned);

    // Get attendance summary
    const attendanceSummary = await TrainingSessionModel.aggregate([
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalAttendance: { $sum: { $size: "$attendance" } },
          averageAttendance: { $avg: { $size: "$attendance" } },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: trainingSessions,
      summary: {
        totalSessions: attendanceSummary[0]?.totalSessions || 0,
        totalAttendance: attendanceSummary[0]?.totalAttendance || 0,
        averageAttendance: Math.round(attendanceSummary[0]?.averageAttendance || 0),
      },
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
      message: getErrorMessage(error, "Failed to fetch training sessions"),
    });
  }
};

// GET /api/training/upcoming
export const getUpcomingTraining = async (req: Request, res: Response) => {
  try {
    const limit = Number.parseInt(req.query.limit as string || "5", 10);

    const sessions = await TrainingSessionModel.find({
      date: { $gte: new Date() }
    })
      .populate('recordedBy', 'name email')
      .sort({ date: 1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch upcoming training"),
    });
  }
};

// GET /api/training/recent
export const getRecentTraining = async (req: Request, res: Response) => {
  try {
    const limit = Number.parseInt(req.query.limit as string || "5", 10);

    const sessions = await TrainingSessionModel.find({
      date: { $lte: new Date() }
    })
      .populate('recordedBy', 'name email')
      .populate('attendance.attendedBy', 'name firstName lastName number')
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch recent training"),
    });
  }
};

// GET /api/training/player/:playerId
export const getPlayerTrainingHistory = async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "10", 10);
    const skip = (page - 1) * limit;

    const sessions = await TrainingSessionModel.find({
      "attendance.attendedBy._id": playerId
    })
      .populate('recordedBy', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await TrainingSessionModel.countDocuments({
      "attendance.attendedBy._id": playerId
    });

    // Calculate attendance rate
    const totalSessions = await TrainingSessionModel.countDocuments({
      date: { $lte: new Date() }
    });

    const attendanceRate = totalSessions > 0
      ? ((total / totalSessions) * 100).toFixed(1)
      : "0";

    res.status(200).json({
      success: true,
      data: {
        sessions,
        stats: {
          attended: total,
          totalSessions,
          attendanceRate: `${attendanceRate}%`,
        },
      },
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
      message: getErrorMessage(error, "Failed to fetch player training history"),
    });
  }
};

// GET /api/training/:id
export const getTrainingSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const session = await TrainingSessionModel.findById(id)
      .populate('recordedBy', 'name email')
      .populate('attendance.attendedBy', 'name firstName lastName number position avatar')
      .lean();

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Training session not found",
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch training session"),
    });
  }
};

// POST /api/training
export const createTrainingSession = async (req: Request, res: Response) => {
  try {
    const { attendance, date, location, note, recordedBy } = req.body as IPostTrainingSession;

    // Validate required fields
    if (!date || !location) {
      return res.status(400).json({
        success: false,
        message: "Date and location are required",
      });
    }

    // Check if session already exists for this date/time
    const existingSession = await TrainingSessionModel.findOne({
      date: new Date(date),
      location,
    });

    if (existingSession) {
      return res.status(409).json({
        success: false,
        message: "A training session already exists at this date and location",
      });
    }

    // Create session
    const savedSession = await TrainingSessionModel.create({
      attendance: attendance || [],
      date: new Date(date),
      location,
      note,
      recordedBy: recordedBy || req.user?.id,
      createdAt: new Date(),
      updateCount: 0,
    });

    if (!savedSession) {
      return res.status(500).json({
        message: "Failed to record session.",
        success: false,
      });
    }

    // Log action
    await logAction({
      title: "🏋️ Training Session Recorded",
      description: `Training session at ${location} on ${formatDate(date)}`,
      severity: ELogSeverity.INFO,
      meta: {
        sessionId: savedSession._id,
        location,
        date,
        attendees: attendance?.attendedBy?.length || 0,
      },
    });

    // Populate for response
    const populatedSession = await TrainingSessionModel.findById(savedSession._id)
      .populate('recordedBy', 'name email')
      .populate('attendance.attendedBy', 'name firstName lastName number position')
      .lean();

    res.status(201).json({
      message: "Training session recorded successfully!",
      success: true,
      data: populatedSession,
    });
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to create training session"),
      success: false,
    });
  }
};

// PUT /api/training/:id
export const updateTrainingSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    // Check update limit
    if (formData.updateCount >= 3) {
      return res.status(400).json({
        message: "Session update limit reached (max 3 updates)",
        success: false,
      });
    }

    // Remove _id from updates
    delete formData._id;

    const session = await TrainingSessionModel.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Training session not found",
      });
    }

    const updated = await TrainingSessionModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...formData,
          updatedAt: new Date(),
          updatedBy: req.user?.id,
        },
        $inc: { updateCount: 1 },
      },
      { new: true, runValidators: true }
    )
      .populate('recordedBy', 'name email')
      .populate('attendance.attendedBy', 'name firstName lastName number position');

    if (!updated) {
      return res.status(500).json({
        success: false,
        message: "Failed to update session",
      });
    }

    // Log update
    await logAction({
      title: "🏋️ Training Session Updated",
      description: `Training session at ${updated.location} updated`,
      severity: ELogSeverity.INFO,
      meta: {
        sessionId: id,
        updates: Object.keys(formData),
        updateCount: (session.updateCount || 0) + 1,
      },
    });

    res.status(200).json({
      message: "Training session updated successfully",
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to update training session"),
      success: false,
    });
  }
};

// PATCH /api/training/:id/attendance
export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { attendance } = req.body;

    if (!attendance || !Array.isArray(attendance)) {
      return res.status(400).json({
        success: false,
        message: "Attendance array is required",
      });
    }

    const updated = await TrainingSessionModel.findByIdAndUpdate(
      id,
      {
        $set: {
          attendance,
          updatedAt: new Date(),
          updatedBy: req.user?.id,
        },
        $inc: { updateCount: 1 },
      },
      { new: true }
    )
      .populate('attendance.attendedBy', 'name firstName lastName number position');

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Training session not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to update attendance"),
    });
  }
};

// PATCH /api/training/:id/note
export const updateSessionNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const updated = await TrainingSessionModel.findByIdAndUpdate(
      id,
      {
        $set: {
          note,
          updatedAt: new Date(),
          updatedBy: req.user?.id,
        },
        $inc: { updateCount: 1 },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Training session not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to update note"),
    });
  }
};

// DELETE /api/training/:id
export const deleteTrainingSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const session = await TrainingSessionModel.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Training session not found",
      });
    }

    await TrainingSessionModel.findByIdAndDelete(id);

    // Log deletion
    await logAction({
      title: "🏋️ Training Session Deleted",
      description: `Training session at ${session.location} on ${formatDate(session.date)} deleted`,
      severity: ELogSeverity.CRITICAL,
      meta: {
        sessionId: id,
        location: session.location,
        date: session.date,
      },
    });

    res.status(200).json({
      message: "Training session deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to delete training session"),
      success: false,
    });
  }
};

// GET /api/training/stats
export const getTrainingStats = async (req: Request, res: Response) => {
  try {
    const stats = await TrainingSessionModel.aggregate([
      {
        $facet: {
          totalSessions: [{ $count: "count" }],
          byLocation: [
            {
              $group: {
                _id: "$location",
                count: { $sum: 1 },
                totalAttendance: { $sum: { $size: "$attendance" } },
              },
            },
            { $sort: { count: -1 } },
          ],
          byMonth: [
            {
              $group: {
                _id: {
                  year: { $year: "$date" },
                  month: { $month: "$date" },
                },
                count: { $sum: 1 },
                totalAttendance: { $sum: { $size: "$attendance" } },
              },
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } },
            { $limit: 12 },
          ],
          attendanceStats: [
            {
              $group: {
                _id: null,
                totalAttendance: { $sum: { $size: "$attendance" } },
                avgAttendance: { $avg: { $size: "$attendance" } },
                maxAttendance: { $max: { $size: "$attendance" } },
                minAttendance: { $min: { $size: "$attendance" } },
              },
            },
          ],
          recentAttendance: [
            { $sort: { date: -1 } },
            { $limit: 10 },
            {
              $project: {
                date: 1,
                location: 1,
                attendeeCount: { $size: "$attendance" },
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSessions: stats[0]?.totalSessions[0]?.count || 0,
        byLocation: stats[0]?.byLocation || [],
        byMonth: stats[0]?.byMonth || [],
        attendance: stats[0]?.attendanceStats[0] || {
          totalAttendance: 0,
          avgAttendance: 0,
          maxAttendance: 0,
          minAttendance: 0,
        },
        recentAttendance: stats[0]?.recentAttendance || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch training statistics"),
    });
  }
};