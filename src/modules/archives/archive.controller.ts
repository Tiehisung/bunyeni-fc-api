// controllers/archive.controller.ts
import { Request, Response } from "express";
import { QueryFilter } from "mongoose";
import { removeEmptyKeys } from "../../lib";
import ArchiveModel from "./archive.model";

// GET /api/archives
export const getArchives = async (req: Request, res: Response) => {
  try {
    const sourceCollection = req.query.sourceCollection as string;
    const query: QueryFilter<unknown> = {};

    if (sourceCollection) {
      query['sourceCollection'] = sourceCollection;
    }

    // Add pagination support
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "20", 10);
    const skip = (page - 1) * limit;

    // Add sorting
    const sortBy = (req.query.sortBy as string) || "archivedAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const cleaned = removeEmptyKeys(query);

    const archives = await ArchiveModel.find(cleaned)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ArchiveModel.countDocuments(cleaned);

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch archives",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/archives/:id
export const getArchiveById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const archive = await ArchiveModel.findById(id).lean();

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch archive",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/archives/collection/:collectionName
export const getArchivesByCollection = async (req: Request, res: Response) => {
  try {
    const { collectionName } = req.params;

    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "20", 10);
    const skip = (page - 1) * limit;

    const archives = await ArchiveModel.find({ sourceCollection: collectionName })
      .sort({ archivedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ArchiveModel.countDocuments({ sourceCollection: collectionName });

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch archives by collection",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/archives/search
export const searchArchives = async (req: Request, res: Response) => {
  try {
    const { q, collection } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const query: any = {};

    if (collection) {
      query.sourceCollection = collection;
    }

    // Search in archived data (this depends on your data structure)
    // This is a simple example - you might need more sophisticated search
    const archives = await ArchiveModel.find({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to search archives",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// POST /api/archives (manual archive creation - admin only)
export const createArchive = async (req: Request, res: Response) => {
  try {
    const { sourceCollection, data, metadata } = req.body;

    if (!sourceCollection || !data) {
      return res.status(400).json({
        success: false,
        message: "sourceCollection and data are required",
      });
    }

    const archive = await ArchiveModel.create({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create archive",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// DELETE /api/archives/:id (permanent deletion - admin only)
export const deleteArchive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Optional: Add authentication/authorization check
    // if (req.user?.role !== 'super_admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Not authorized to delete archives",
    //   });
    // }

    const archive = await ArchiveModel.findByIdAndDelete(id);

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete archive",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// DELETE /api/archives/collection/:collectionName (bulk delete - admin only)
export const deleteArchivesByCollection = async (req: Request, res: Response) => {
  try {
    const { collectionName } = req.params;
    const { olderThan } = req.query;

    const query: any = { sourceCollection: collectionName };

    // Optional: Delete only archives older than a certain date
    if (olderThan) {
      const date = new Date(olderThan as string);
      if (!isNaN(date.getTime())) {
        query.archivedAt = { $lt: date };
      }
    }

    const result = await ArchiveModel.deleteMany(query);

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} archives`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete archives",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/archives/stats
export const getArchiveStats = async (req: Request, res: Response) => {
  try {
    const stats = await ArchiveModel.aggregate([
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

    const totalArchives = await ArchiveModel.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalArchives,
        collections: stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get archive statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// POST /api/archives/:id/restore (restore archived item)
export const restoreArchive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const archive = await ArchiveModel.findById(id);

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to restore archive",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};