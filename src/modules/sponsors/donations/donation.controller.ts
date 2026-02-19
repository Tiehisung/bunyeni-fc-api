// controllers/donation.controller.ts
import { Request, Response } from "express";
import { removeEmptyKeys, getErrorMessage } from "../../../lib";
import { createGallery } from "../../media/highlights/helper";
import SponsorModel from "../sponsor.model";
import DonationModel from "./donation.model";


// GET /api/donations
export const getDonations = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "10", 10);
    const skip = (page - 1) * limit;

    const search = (req.query.donation_search as string) || "";
    const sponsorId = req.query.sponsorId as string;
    const fromDate = req.query.fromDate as string;
    const toDate = req.query.toDate as string;

    const regex = new RegExp(search, "i");

    let query: any = {};

    if (search) {
      query.$or = [
        { "item": regex },
        { "description": regex },
        { "date": regex },
        { "category": regex },
      ];
    }

    if (sponsorId) {
      query.sponsor = sponsorId;
    }

    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) query.date.$lte = new Date(toDate);
    }

    const cleaned = removeEmptyKeys(query);

    const donations = await DonationModel.find(cleaned)
      .populate({ path: "sponsor", select: "name businessName logo" })
      .populate("files")
      .limit(limit)
      .skip(skip)
      .lean()
      .sort({ createdAt: "desc" });

    const total = await DonationModel.countDocuments(cleaned);

    res.status(200).json({
      success: true,
      data: donations,
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
      message: getErrorMessage(error, "Failed to fetch donations"),
    });
  }
};

// GET /api/donations/:id
export const getDonationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const donation = await DonationModel.findById(id)
      .populate("sponsor")
      .populate("files")
      .lean();

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch donation"),
    });
  }
};

// GET /api/donations/sponsor/:sponsorId
export const getDonationsBySponsor = async (req: Request, res: Response) => {
  try {
    const { sponsorId } = req.params;
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "10", 10);
    const skip = (page - 1) * limit;

    const search = (req.query.donation_search as string) || "";
    const regex = new RegExp(search, "i");

    let query: any = { sponsor: sponsorId };

    if (search) {
      query.$or = [
        { "item": regex },
        { "description": regex },
        { "date": regex },
      ];
    }

    const cleaned = removeEmptyKeys(query);

    const donations = await DonationModel.find(cleaned)
      .populate({ path: "sponsor" })
      .populate("files")
      .limit(limit)
      .skip(skip)
      .lean()
      .sort({ createdAt: "desc" });

    const total = await DonationModel.countDocuments(cleaned);

    res.status(200).json({
      success: true,
      data: donations,
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
      message: getErrorMessage(error, "Failed to fetch sponsor donations"),
    });
  }
};

// POST /api/donations
export const createDonation = async (req: Request, res: Response) => {
  try {
    const { sponsorId, item, description, files, date, value, category } = req.body;

    if (!sponsorId || !item) {
      return res.status(400).json({
        success: false,
        message: "Sponsor ID and item are required",
      });
    }

    // Create donation
    const donated = await DonationModel.create({
      item,
      description,
      files,
      date: date || new Date(),
      sponsor: sponsorId,
      value,
      category: category || 'general',
      createdBy: req.user?.id,
      createdAt: new Date(),
    });

    // Update sponsor
    await SponsorModel.findByIdAndUpdate(sponsorId, {
      $push: { donations: donated._id },
      $inc: {
        badge: 1,
        totalDonations: 1,
        totalValue: value || 0,
      }
    });

    // Create gallery if files exist
    if (files?.length > 0) {
      const sponsor = await SponsorModel.findById(sponsorId);
      await createGallery({
        title: item,
        description: description || `Donation from ${sponsor?.name || sponsor?.businessName}`,
        files,
        tags: [sponsor?.name, sponsor?.businessName, category].filter(Boolean),
      });
    }

    // Populate for response
    const populatedDonation = await DonationModel.findById(donated._id)
      .populate("sponsor")
      .populate("files")
      .lean();

    res.status(201).json({
      message: "Donation recorded successfully",
      success: true,
      data: populatedDonation,
    });
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to create donation"),
      success: false,
    });
  }
};

// POST /api/sponsors/:sponsorId/donations
export const createDonationForSponsor = async (req: Request, res: Response) => {
  try {
    const { sponsorId } = req.params;
    const { item, description, files, date, value, category } = req.body;

    if (!item) {
      return res.status(400).json({
        success: false,
        message: "Item is required",
      });
    }

    // Check if sponsor exists
    const sponsor = await SponsorModel.findById(sponsorId);
    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: "Sponsor not found",
      });
    }

    // Create donation
    const donated = await DonationModel.create({
      item,
      description,
      files,
      date: date || new Date(),
      sponsor: sponsorId,
      value,
      category: category || 'general',
      createdBy: req.user?.id,
      createdAt: new Date(),
    });

    // Update sponsor
    await SponsorModel.findByIdAndUpdate(sponsorId, {
      $push: { donations: donated._id },
      $inc: {
        badge: 1,
        totalDonations: 1,
        totalValue: value || 0,
      }
    });

    // Create gallery if files exist
    if (files?.length > 0) {
      await createGallery({
        title: item,
        description: description || `Donation from ${sponsor.name || sponsor.businessName}`,
        files,
        tags: [sponsor.name, sponsor.businessName, category].filter(Boolean),
      });
    }

    // Populate for response
    const populatedDonation = await DonationModel.findById(donated._id)
      .populate("sponsor")
      .populate("files")
      .lean();

    res.status(201).json({
      message: "Donation recorded successfully",
      success: true,
      data: populatedDonation,
    });
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to create donation"),
      success: false,
    });
  }
};

// DELETE /api/donations/:id
export const deleteDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find donation first
    const donation = await DonationModel.findById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    // Delete donation
    await DonationModel.findByIdAndDelete(id);

    // Update sponsor - remove donation reference
    await SponsorModel.findByIdAndUpdate(donation.sponsor, {
      $pull: { donations: id },
      $inc: {
        badge: -1,
        totalDonations: -1,
        totalValue: -(donation.value || 0),
      }
    });

    res.status(200).json({
      message: "Donation revoked successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to delete donation"),
      success: false,
    });
  }
};

// DELETE /api/sponsors/:sponsorId/donations/:donationId
export const deleteDonationBySponsor = async (req: Request, res: Response) => {
  try {
    const { sponsorId, donationId } = req.params;

    await DonationModel.findByIdAndDelete(donationId);

    await SponsorModel.findByIdAndUpdate(sponsorId, {
      $pull: { donations: donationId },
    });

    res.status(200).json({
      message: "Donation revoked successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to delete donation"),
      success: false,
    });
  }
};

// GET /api/donations/stats
export const getDonationStats = async (req: Request, res: Response) => {
  try {
    const stats = await DonationModel.aggregate([
      {
        $facet: {
          totalDonations: [{ $count: "count" }],
          totalValue: [
            {
              $group: {
                _id: null,
                total: { $sum: "$value" },
              },
            },
          ],
          byCategory: [
            {
              $group: {
                _id: "$category",
                count: { $sum: 1 },
                totalValue: { $sum: "$value" },
              },
            },
          ],
          byMonth: [
            {
              $group: {
                _id: {
                  year: { $year: "$date" },
                  month: { $month: "$date" },
                },
                count: { $sum: 1 },
                totalValue: { $sum: "$value" },
              },
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } },
            { $limit: 12 },
          ],
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDonations: stats[0]?.totalDonations[0]?.count || 0,
        totalValue: stats[0]?.totalValue[0]?.total || 0,
        byCategory: stats[0]?.byCategory || [],
        byMonth: stats[0]?.byMonth || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch donation statistics"),
    });
  }
};