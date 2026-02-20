// controllers/user.controller.ts
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { QueryFilter } from "mongoose";
import { getErrorMessage, removeEmptyKeys } from "../../lib";
import UserModel from "./user.model";
import { logAction } from "../logs/helper";
import { ELogSeverity } from "../../types/log.interface";
import { slugIdFilters } from "../../lib/slug";
import { saveToArchive } from "../archives/helper";
import { EArchivesCollection } from "../../types/archive.interface";

export const getMe = async (req: Request, res: Response) => {
  res.json({
    message: "Protected route accessed ✅",
    user: req.user
  });
};


// GET /api/users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "10", 10);
    const skip = (page - 1) * limit;

    const search = (req.query.user_search as string) || "";
    const role = (req.query.role as string) || "";
    const account = (req.query.account as string) || "";

    const regex = new RegExp(search, "i");

    const query: QueryFilter<string> = {
      $or: [
        { "name": regex },
        { "email": regex },
        { "role": regex },
      ],
    };

    if (role) query['role'] = role;
    if (account) query['account'] = account;

    const cleaned = removeEmptyKeys(query);

    const users = await UserModel.find(cleaned)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await UserModel.countDocuments(cleaned);

    res.status(200).json({
      success: true,
      data: users,
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
      message: getErrorMessage(error, "Failed to fetch users"),
    });
  }
};

// controllers/user.controller.ts (Add these to your existing user controller)

// GET /api/users/:userId
export const getUserBySlugOrId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.slug as string;
    const slug = slugIdFilters(userId);

    const user = await UserModel.findOne(slug)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// PUT /api/users/:userId
export const updateUserBySlugOrId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.slug as string;
    const slug = slugIdFilters(userId);
    const { password, ...data } = req.body;

    // Check if user exists
    const existingUser = await UserModel.findOne(slug);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent role escalation if not authorized
    if (data.role && data.role !== existingUser.role) {
      // Check if current user has permission to change roles
      if (req.user?.role !== 'super_admin' && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Not authorized to change user roles",
        });
      }
    }

    // Update user
    const updated = await UserModel.findOneAndUpdate(
      slug,
      { $set: data },
      { new: true, runValidators: true }
    ).select("-password");

    // Handle password update separately if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await UserModel.findOneAndUpdate(
        slug,
        { $set: { password: hashedPassword } }
      );

      // Fetch updated user with new password (but don't return password)
      const userWithNewPass = await UserModel.findOne(slug).select("-password");
      Object.assign(updated, userWithNewPass);
    }

    // Log the update
    await logAction({
      title: `User [${updated?.name}] updated`,
      description: `User ${updated?.email} was updated`,
      meta: { userId: updated?._id, updates: Object.keys(data) },
      severity: ELogSeverity.INFO,

    });

    res.status(200).json({
      message: "User updated successfully",
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// PATCH /api/users/:userId (partial updates)
export const patchUserBySlugOrId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.slug as string;
    const slug = slugIdFilters(userId);
    const updates = req.body;

    // Remove undefined or null values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined || updates[key] === null) {
        delete updates[key];
      }
    });

    // Don't allow password update through PATCH (use PUT for password)
    if (updates.password) {
      delete updates.password;
    }

    const updated = await UserModel.findOneAndUpdate(
      slug,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Log the patch
    await logAction({
      title: `User [${updated.name}] patched`,
      description: `User ${updated.email} was partially updated`,
      meta: { userId: updated._id, updates: Object.keys(updates) },
      severity: ELogSeverity.INFO,

    });

    res.status(200).json({
      message: "User updated successfully",
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// DELETE /api/users/:userId
export const deleteUserBySlugOrId = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const filter = slugIdFilters(slug);

    // Check if user exists
    const userToDelete = await UserModel.findOne(filter);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent self-deletion
    if (req.user?.id === userToDelete._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    // Prevent deletion of super_admin by non-super_admin
    if (userToDelete.role === 'super_admin' && req.user?.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: "Cannot delete super admin account",
      });
    }

    // Delete the user
    const deleted = await UserModel.findOneAndDelete(filter).select("-password");

    // Archive the deleted user
    await saveToArchive({
      data: deleted,
      originalId: slug,
      sourceCollection: EArchivesCollection.USERS,
      reason: 'User deleted',
    });

    // Log the deletion
    await logAction({
      title: `User [${deleted?.name}] deleted`,
      description: `User ${deleted?.email} was deleted`,
      meta: {
        userId: deleted?._id,
        deletedBy: req.user?.id,
        deletedByEmail: req.user?.email
      },
      severity: ELogSeverity.CRITICAL,

    });

    res.status(200).json({
      message: "User deleted successfully",
      success: true,
      data: {
        id: deleted?._id,
        email: deleted?.email,
        name: deleted?.name,
      },
    });
  } catch (error) {
    console.log({ error });
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// POST /api/users/:userId/change-password
export const changeUserPassword = async (req: Request, res: Response) => {
  try {
    const userId = req.params.slug as string;
    const slug = slugIdFilters(userId);
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Find user with password
    const user = await UserModel.findOne(slug).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is changing their own password or is admin
    const isOwnAccount = req.user?.id === user._id.toString();
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';

    if (!isOwnAccount && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to change this user's password",
      });
    }

    // If changing own password, verify current password
    if (isOwnAccount) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await UserModel.findOneAndUpdate(
      slug,
      { $set: { password: hashedPassword } }
    );

    // Log password change
    await logAction({
      title: `Password changed for user [${user.name}]`,
      description: `User password was changed`,
      severity: ELogSeverity.CRITICAL,
      meta: { targetUserId: user._id, changedBy: req.user?.id },
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// POST /api/users/:userId/toggle-status
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const params = req.params;
    const slug = slugIdFilters(params.slug as string);
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const user = await UserModel.findOne(slug);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deactivating super_admin
    if (user.role === 'super_admin' && req.user?.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: "Cannot modify super admin status",
      });
    }

    const updated = await UserModel.findOneAndUpdate(
      slug,
      { $set: { status } },
      { new: true }
    ).select("-password");

    // Log status change
    await logAction({
      title: `User [${user.name}] status changed to ${status}`,
      description: `User status updated`,
      severity: ELogSeverity.CRITICAL,
      meta: { targetUserId: user._id, oldStatus: user.status, newStatus: status },
    });

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};