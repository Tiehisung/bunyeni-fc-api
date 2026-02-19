// controllers/highlight.controller.ts
import type { Request, Response } from "express";
import { removeEmptyKeys, getErrorMessage } from "../../../lib";
import { formatDate } from "../../../lib/timeAndDate";
import { logAction } from "../../logs/helper";
import HighlightModel, { IPostHighlight } from "./highlight.model";



// GET /api/highlights
export const getHighlights = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "10", 10);
    const search = (req.query.highlight_search as string) || "";
    const tagsParam = (req.query.tags as string) || "";
    const matchId = req.query.matchId as string;
    const status = req.query.status as string;
    const fromDate = req.query.fromDate as string;
    const toDate = req.query.toDate as string;

    const tags = tagsParam
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const skip = (page - 1) * limit;
    const regex = new RegExp(search, "i");

    // Build Query Object
    const query: Record<string, any> = {};

    if (tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (matchId) {
      query.match = matchId;
    }

    if (status) {
      query.status = status;
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

    if (search) {
      query.$or = [
        { title: regex },
        { description: regex },
        { tags: regex },
      ];
    }

    const cleaned = removeEmptyKeys(query);

    // Apply filters here
    const highlights = await HighlightModel.find(cleaned)
      .populate('match', 'homeTeam awayTeam date competition') // Populate match details
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await HighlightModel.countDocuments(cleaned);

    res.status(200).json({
      success: true,
      data: highlights,
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
      message: getErrorMessage(error, "Failed to fetch highlights"),
    });
  }
};

// GET /api/highlights/:id
export const getHighlightById = async (req: Request, res: Response) => {
  try {
    const { highlightId } = req.params;

    const highlight = await HighlightModel.findById(highlightId)
      .populate('match')
      .lean();

    if (!highlight) {
      return res.status(404).json({
        success: false,
        message: "Highlight not found",
      });
    }

    res.status(200).json({
      success: true,
      data: highlight,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch highlight"),
    });
  }
};

// GET /api/highlights/match/:matchId
export const getHighlightsByMatch = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "10", 10);
    const skip = (page - 1) * limit;

    const highlights = await HighlightModel.find({ match: matchId })
      .populate('match')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await HighlightModel.countDocuments({ match: matchId });

    res.status(200).json({
      success: true,
      data: highlights,
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
      message: getErrorMessage(error, "Failed to fetch match highlights"),
    });
  }
};

// POST /api/highlights
export const createHighlight = async (req: Request, res: Response) => {
  try {
    const { match, ...others } = req.body as IPostHighlight;

    // Validate required fields
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Match ID is required",
      });
    }

    if (!others.title) {
      return res.status(400).json({
        success: false,
        message: "Highlight title is required",
      });
    }

    // Create highlight
    const savedHighlight = await HighlightModel.create({
      match,
      ...others,
      createdBy: req.user?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Populate match details for response
    const populatedHighlight = await HighlightModel.findById(savedHighlight._id)
      .populate('match')
      .lean();

    // Log action
    await logAction({
      title: `Match highlight created - [${others?.title || ''}]`,
      description: `A match highlight (${others?.title}) created on ${formatDate(new Date().toISOString()) ?? ''}.`,
      meta: {
        highlightId: savedHighlight._id,
        matchId: match,
        title: others.title,
      },
    });

    res.status(201).json({
      message: "Highlight created successfully",
      success: true,
      data: populatedHighlight,
    });
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to save highlight"),
      success: false,
    });
  }
};

// PUT /api/highlights/:id
export const updateHighlight = async (req: Request, res: Response) => {
  try {
    const { highlightId } = req.params;
    const updates = req.body;

    const existingHighlight = await HighlightModel.findById(highlightId);
    if (!existingHighlight) {
      return res.status(404).json({
        success: false,
        message: "Highlight not found",
      });
    }

    const updatedHighlight = await HighlightModel.findByIdAndUpdate(
      highlightId,
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
          updatedBy: req.user?.id,
        },
      },
      { new: true, runValidators: true }
    ).populate('match');

    // Log action
    await logAction({
      title: `Highlight updated - [${updates.title || existingHighlight.title}]`,
      description: `Highlight was updated`,
      meta: {
        highlightId,
        changes: Object.keys(updates),
      },
    });

    res.status(200).json({
      message: "Highlight updated successfully",
      success: true,
      data: updatedHighlight,
    });
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to update highlight"),
      success: false,
    });
  }
};

// PATCH /api/highlights/:id (partial updates)
export const patchHighlight = async (req: Request, res: Response) => {
  try {
    const { highlightId } = req.params;
    const updates = req.body;

    // Remove undefined fields
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined || updates[key] === null) {
        delete updates[key];
      }
    });

    const updatedHighlight = await HighlightModel.findByIdAndUpdate(
      highlightId,
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
          updatedBy: req.user?.id,
        },
      },
      { new: true, runValidators: true }
    ).populate('match');

    if (!updatedHighlight) {
      return res.status(404).json({
        success: false,
        message: "Highlight not found",
      });
    }

    res.status(200).json({
      message: "Highlight updated successfully",
      success: true,
      data: updatedHighlight,
    });
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to update highlight"),
      success: false,
    });
  }
};

// DELETE /api/highlights/:id
export const deleteHighlight = async (req: Request, res: Response) => {
  try {
    const { highlightId } = req.params;

    const deletedHighlight = await HighlightModel.findByIdAndDelete(highlightId);

    if (!deletedHighlight) {
      return res.status(404).json({
        success: false,
        message: "Highlight not found",
      });
    }

    // Log action
    await logAction({
      title: `Highlight deleted - [${deletedHighlight.title}]`,
      description: `Highlight was deleted`,
      meta: {
        highlightId,
        matchId: deletedHighlight.match,
        title: deletedHighlight.title,
      },
    });

    res.status(200).json({
      message: "Highlight deleted successfully",
      success: true,
      data: deletedHighlight,
    });
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to delete highlight"),
      success: false,
    });
  }
};

// GET /api/highlights/stats
export const getHighlightStats = async (req: Request, res: Response) => {
  try {
    const stats = await HighlightModel.aggregate([
      {
        $group: {
          _id: null,
          totalHighlights: { $sum: 1 },
          avgViews: { $avg: "$views" },
          totalViews: { $sum: "$views" },
        },
      },
      {
        $project: {
          _id: 0,
          totalHighlights: 1,
          avgViews: { $round: ["$avgViews", 0] },
          totalViews: 1,
        },
      },
    ]);

    // Get tag distribution
    const tagStats = await HighlightModel.aggregate([
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

    // Get highlights by match (top 10 matches with most highlights)
    const matchStats = await HighlightModel.aggregate([
      {
        $group: {
          _id: "$match",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "matches",
          localField: "_id",
          foreignField: "_id",
          as: "matchDetails",
        },
      },
      {
        $project: {
          matchId: "$_id",
          count: 1,
          matchDetails: { $arrayElemAt: ["$matchDetails", 0] },
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || { totalHighlights: 0, avgViews: 0, totalViews: 0 },
        topTags: tagStats,
        topMatches: matchStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch highlight statistics"),
    });
  }
};

// POST /api/highlights/:id/view (increment view count)
export const incrementHighlightView = async (req: Request, res: Response) => {
  try {
    const { highlightId } = req.params;

    const updated = await HighlightModel.findByIdAndUpdate(
      highlightId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Highlight not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { views: updated.views },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to update view count"),
    });
  }
};