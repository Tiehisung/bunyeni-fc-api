// controllers/sponsor.controller.ts
import { Request, Response } from "express";
import { removeEmptyKeys, getErrorMessage } from "../../lib";
import { formatDate } from "../../lib/timeAndDate";
import { EArchivesCollection } from "../../types/archive.interface";
import { ELogSeverity } from "../../types/log.interface";
import { saveToArchive } from "../archives/helper";
import { logAction } from "../log/helper";
import DonationModel from "./donations/donation.model";
import SponsorModel from "./sponsor.model";
import "../media/files/file.model";


// ==================== SPONSOR CONTROLLERS ====================

// GET /api/sponsors
export const getSponsors = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "10", 10);
    const skip = (page - 1) * limit;

    const search = (req.query.sponsor_search as string) || "";
    const tier = req.query.tier as string;
    const category = req.query.category as string;
    const isActive = req.query.isActive === 'true';

    const regex = new RegExp(search, "i");

    const query: any = {};

    if (search) {
      query.$or = [
        { "name": regex },
        { "businessName": regex },
        { "businessDescription": regex },
        { "community": regex },
        { "category": regex },
        { "tier": regex },
      ];
    }

    if (tier) {
      query.tier = tier;
    }

    if (category) {
      query.category = category;
    }

    if (req.query.isActive !== undefined) {
      query.isActive = isActive;
    }

    const cleaned = removeEmptyKeys(query);

    const sponsors = await SponsorModel.find(cleaned)
      .populate({ path: "donations", populate: { path: "files" } })
      .populate("logo")
      .populate("badges")
      .limit(limit)
      .skip(skip)
      .lean()
      .sort({ updatedAt: "desc" });

    const total = await SponsorModel.countDocuments(cleaned);

    res.status(200).json({
      success: true,
      data: sponsors,
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
      message: getErrorMessage(error, "Failed to fetch sponsors"),
    });
  }
};

// GET /api/sponsors/:id
export const getSponsorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sponsor = await SponsorModel.findById(id)
      .populate({ path: "donations", populate: { path: "files" } })
      .populate("logo")
      .populate("badges")
      .lean();

    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: "Sponsor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: sponsor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch sponsor"),
    });
  }
};

// GET /api/sponsors/top
export const getTopSponsors = async (req: Request, res: Response) => {
  try {
    const limit = Number.parseInt(req.query.limit as string || "5", 10);

    const sponsors = await SponsorModel.find({ isActive: true })
      .populate("logo")
      .sort({ badge: -1, totalDonations: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: sponsors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch top sponsors"),
    });
  }
};

// POST /api/sponsors
export const createSponsor = async (req: Request, res: Response) => {
  try {
    const sponsorData = req.body;

    // Check if sponsor with same business name exists
    const existingSponsor = await SponsorModel.findOne({
      businessName: sponsorData.businessName
    });

    if (existingSponsor) {
      return res.status(409).json({
        success: false,
        message: "Sponsor with this business name already exists",
      });
    }

    const created = await SponsorModel.create({
      ...sponsorData,
      createdBy: req.user?.id,
      createdAt: new Date(),
      badge: 0,
      totalDonations: 0,
    });

    if (!created) {
      return res.status(500).json({
        success: false,
        message: "Failed to create sponsor",
      });
    }

    // Log action
    await logAction({
      title: "🤝 Sponsor Created",
      description: `New sponsor ${created.name || created.businessName} added`,
      severity: ELogSeverity.INFO,
      meta: {
        sponsorId: created._id,
        businessName: created.businessName,
      },
    });

    res.status(201).json({
      message: "Sponsor created successfully",
      success: true,
      data: created,
    });
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to create sponsor"),
      success: false,
    });
  }
};

// PUT /api/sponsors/:id
export const updateSponsor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sponsorData = req.body;

    // Remove _id from updates
    delete sponsorData._id;

    const updated = await SponsorModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...sponsorData,
          updatedAt: new Date(),
          updatedBy: req.user?.id,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Sponsor not found",
      });
    }

    res.status(200).json({
      message: "Sponsor updated successfully",
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to update sponsor"),
      success: false,
    });
  }
};

// PATCH /api/sponsors/:id/toggle-status
export const toggleSponsorStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updated = await SponsorModel.findByIdAndUpdate(
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

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Sponsor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Sponsor ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to update sponsor status"),
    });
  }
};

// DELETE /api/sponsors/:id
export const deleteSponsor = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Find sponsor first
    const sponsor = await SponsorModel.findById(id);

    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: "Sponsor not found",
      });
    }

    // Delete all associated donations
    if (sponsor.donations && sponsor.donations.length > 0) {
      await DonationModel.deleteMany({ _id: { $in: sponsor.donations } });
    }

    // Delete sponsor
    const deleted = await SponsorModel.findByIdAndDelete(id);

    // Archive the sponsor
    await saveToArchive({
      data: sponsor,
      originalId: id,
      sourceCollection: EArchivesCollection.SPONSORS,
      reason: 'Sponsor deleted',
    });

    // Log deletion
    await logAction({
      title: "🤝 Sponsor Deleted",
      description: `Sponsor ${sponsor.name || sponsor.businessName} deleted on ${formatDate(new Date().toISOString())}`,
      severity: ELogSeverity.CRITICAL,
      meta: {
        sponsorId: id,
        donationsCount: sponsor.donations?.length || 0,
      },
    });

    res.status(200).json({
      message: "Sponsor deleted successfully",
      success: true,
      data: {
        id: deleted?._id,
        name: sponsor.name,
        businessName: sponsor.businessName,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to delete sponsor"),
      success: false,
    });
  }
};

// GET /api/sponsors/stats
export const getSponsorStats = async (req: Request, res: Response) => {
  try {
    const stats = await SponsorModel.aggregate([
      {
        $facet: {
          totalSponsors: [{ $count: "count" }],
          byTier: [
            {
              $group: {
                _id: "$tier",
                count: { $sum: 1 },
              },
            },
          ],
          byCategory: [
            {
              $group: {
                _id: "$category",
                count: { $sum: 1 },
              },
            },
          ],
          activeSponsors: [
            {
              $match: { isActive: true }
            },
            { $count: "count" }
          ],
          totalDonations: [
            {
              $group: {
                _id: null,
                total: { $sum: "$totalDonations" },
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSponsors: stats[0]?.totalSponsors[0]?.count || 0,
        activeSponsors: stats[0]?.activeSponsors[0]?.count || 0,
        byTier: stats[0]?.byTier || [],
        byCategory: stats[0]?.byCategory || [],
        totalDonations: stats[0]?.totalDonations[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch sponsor statistics"),
    });
  }
};