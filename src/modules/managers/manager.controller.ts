// controllers/manager.controller.ts
import type { Request, Response } from "express";
 
import { QueryFilter } from "mongoose";
import { removeEmptyKeys, getErrorMessage } from "../../lib";
import { formatDate } from "../../lib/timeAndDate";
import { EArchivesCollection } from "../../types/archive.interface";
import { ELogSeverity } from "../../types/log.interface";
import { saveToArchive } from "../archives/helper";
import { logAction } from "../logs/helper";
import ManagerModel from "./manager.model";

// GET /api/managers
export const getManagers = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "30", 10);
    const skip = (page - 1) * limit;

    const search = (req.query.manager_search as string) || "";
    const isActive = req.query.isActive === 'true';
    const role = req.query.role as string;
    const department = req.query.department as string;

    const regex = new RegExp(search, "i");

    let query: any = {};

    // Active status filter
    if (req.query.isActive !== undefined) {
      query.isActive = isActive;
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    // Department filter
    if (department) {
      query.department = department;
    }

    // Search filter
    if (search) {
      query.$or = [
        { "fullname": regex },
        { "email": regex },
        { "phone": regex },
        { "role": regex },
        { "department": regex },
        { "qualifications": regex },
      ];
    }

    const cleaned = removeEmptyKeys(query);

    const managers = await ManagerModel.find(cleaned)
      .populate('avatar')
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await ManagerModel.countDocuments(cleaned);

    // Get active managers by role for quick reference
    const activeByRole = await ManagerModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          managers: { $push: { fullname: "$fullname", _id: "$_id" } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        managers,
        activeByRole,
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
      message: getErrorMessage(error, "Failed to fetch managers"),
    });
  }
};

// GET /api/managers/active
export const getActiveManagers = async (req: Request, res: Response) => {
  try {
    const managers = await ManagerModel.find({ isActive: true })
      .populate('avatar')
      .sort({ role: 1, fullname: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: managers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch active managers"),
    });
  }
};

// GET /api/managers/role/:role
export const getManagersByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "20", 10);
    const skip = (page - 1) * limit;

    const managers = await ManagerModel.find({ role })
      .populate('avatar')
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ManagerModel.countDocuments({ role });

    res.status(200).json({
      success: true,
      data: managers,
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
      message: getErrorMessage(error, "Failed to fetch managers by role"),
    });
  }
};

// GET /api/managers/:id
export const getManagerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const manager = await ManagerModel.findById(id)
      .populate('avatar')
      .lean();

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    res.status(200).json({
      success: true,
      data: manager,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch manager"),
    });
  }
};

// POST /api/managers
export const createManager = async (req: Request, res: Response) => {
  try {
    const {
      fullname,
      phone,
      email,
      dateSigned,
      role,
      avatar,
      department,
      qualifications,
      bio,
      startDate,
      contractType
    } = req.body;

    // Check if manager with same email exists
    const exists = await ManagerModel.findOne({
      email: email.toLowerCase().trim(),
    });

    if (exists) {
      return res.status(409).json({
        message: "Staff with " + email + " already exists",
        success: false,
      });
    }

    // Check if there's already an active manager for this role
    const existingActive = await ManagerModel.findOne({
      role: role,
      isActive: true
    });

    // If there's an existing active manager, deactivate them
    if (existingActive) {
      await ManagerModel.updateOne(
        { role: role, isActive: true },
        {
          $set: {
            isActive: false,
            endDate: new Date(),
            updatedAt: new Date(),
            replacedBy: req.user?.id
          }
        }
      );
    }

    // Save new staff
    const saved = await ManagerModel.create({
      fullname,
      phone,
      email: email.toLowerCase().trim(),
      dateSigned: dateSigned || new Date(),
      role,
      avatar,
      department,
      qualifications: qualifications || [],
      bio,
      startDate: startDate || new Date(),
      contractType: contractType || 'permanent',
      isActive: true,
      createdBy: req.user?.id,
      createdAt: new Date(),
    });

    if (!saved) {
      return res.status(500).json({
        message: "Failed to create staff",
        success: false,
      });
    }

    // Log action
    await logAction({
      title: "👔 Staff Created",
      description: `${fullname} appointed as ${role}`,
      severity: ELogSeverity.INFO,
      meta: {
        managerId: saved._id,
        role,
        department,
        replacedManager: existingActive?._id,
      },
    });

    // Populate for response
    const populatedManager = await ManagerModel.findById(saved._id)
      .populate('avatar')
      .lean();

    res.status(201).json({
      message: "Staff created successfully",
      success: true,
      data: populatedManager,
    });
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to create staff"),
      success: false,
    });
  }
};

// PUT /api/managers/:id
export const updateManager = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove _id from updates
    delete updates._id;

    // Check if email is being updated and if it already exists
    if (updates.email) {
      const existingManager = await ManagerModel.findOne({
        email: updates.email.toLowerCase().trim(),
        _id: { $ne: id }
      });

      if (existingManager) {
        return res.status(409).json({
          success: false,
          message: "Email already in use by another staff member",
        });
      }
      updates.email = updates.email.toLowerCase().trim();
    }

    const updated = await ManagerModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
          updatedBy: req.user?.id,
        },
      },
      { new: true, runValidators: true }
    ).populate('avatar');

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    // Log update
    await logAction({
      title: "👔 Staff Updated",
      description: `${updated.fullname}'s record updated`,
      severity: ELogSeverity.INFO,
      meta: {
        managerId: id,
        updates: Object.keys(updates),
      },
    });

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to update staff"),
    });
  }
};

// PATCH /api/managers/:id/deactivate
export const deactivateManager = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const manager = await ManagerModel.findById(id);

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    if (!manager.isActive) {
      return res.status(400).json({
        success: false,
        message: "Manager is already inactive",
      });
    }

    const updated = await ManagerModel.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: false,
          endDate: new Date(),
          endReason: reason || 'End of contract',
          updatedAt: new Date(),
          deactivatedBy: req.user?.id,
        },
      },
      { new: true }
    ).populate('avatar');

    // Log deactivation
    await logAction({
      title: "👔 Staff Deactivated",
      description: `${manager.fullname} deactivated from ${manager.role}`,
      severity: ELogSeverity.WARNING,
      meta: {
        managerId: id,
        role: manager.role,
        reason,
      },
    });

    res.status(200).json({
      success: true,
      message: "Staff deactivated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to deactivate staff"),
    });
  }
};

// PATCH /api/managers/:id/activate
export const activateManager = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const manager = await ManagerModel.findById(id);

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    if (manager.isActive) {
      return res.status(400).json({
        success: false,
        message: "Manager is already active",
      });
    }

    // Check if there's already an active manager for this role
    const existingActive = await ManagerModel.findOne({
      role: manager.role,
      isActive: true,
      _id: { $ne: id }
    });

    if (existingActive) {
      return res.status(409).json({
        success: false,
        message: `There is already an active ${manager.role}. Please deactivate them first.`,
      });
    }

    const updated = await ManagerModel.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: true,
          startDate: new Date(),
          updatedAt: new Date(),
          activatedBy: req.user?.id,
        },
      },
      { new: true }
    ).populate('avatar');

    res.status(200).json({
      success: true,
      message: "Staff activated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to activate staff"),
    });
  }
};

// DELETE /api/managers/:id
export const deleteManager = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const manager = await ManagerModel.findById(id);

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    const deleted = await ManagerModel.findByIdAndDelete(id);

    // Archive the deleted manager
    await saveToArchive({
      sourceCollection: EArchivesCollection.MANAGERS,
      originalId: manager._id?.toString(),
      data: { ...manager.toObject(), isLatest: false },
      reason: 'Manager deleted',
       
    });

    // Log deletion
    await logAction({
      title: "👔 Staff Deleted",
      description: `${manager.fullname} (${manager.role}) deleted on ${formatDate(new Date().toISOString())}`,
      severity: ELogSeverity.CRITICAL,
      meta: {
        managerId: id,
        role: manager.role,
        email: manager.email,
      },
    });

    res.status(200).json({
      success: true,
      message: "Staff deleted successfully",
      data: {
        id: deleted?._id,
        fullname: manager.fullname,
        role: manager.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to delete staff"),
    });
  }
};

// GET /api/managers/stats
export const getManagerStats = async (req: Request, res: Response) => {
  try {
    const stats = await ManagerModel.aggregate([
      {
        $facet: {
          totalStaff: [{ $count: "count" }],
          byRole: [
            {
              $group: {
                _id: "$role",
                count: { $sum: 1 },
                active: {
                  $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
                },
              },
            },
            { $sort: { count: -1 } },
          ],
          byDepartment: [
            {
              $group: {
                _id: "$department",
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
          ],
          byContractType: [
            {
              $group: {
                _id: "$contractType",
                count: { $sum: 1 },
              },
            },
          ],
          activeStats: [
            {
              $group: {
                _id: null,
                active: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
                inactive: { $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] } },
              },
            },
          ],
          recentHires: [
            { $match: { isActive: true } },
            { $sort: { startDate: -1 } },
            { $limit: 5 },
            {
              $project: {
                fullname: 1,
                role: 1,
                startDate: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStaff: stats[0]?.totalStaff[0]?.count || 0,
        byRole: stats[0]?.byRole || [],
        byDepartment: stats[0]?.byDepartment || [],
        byContractType: stats[0]?.byContractType || [],
        activeStats: stats[0]?.activeStats[0] || { active: 0, inactive: 0 },
        recentHires: stats[0]?.recentHires || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch staff statistics"),
    });
  }
};