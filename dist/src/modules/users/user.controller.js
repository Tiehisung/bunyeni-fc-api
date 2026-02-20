"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUserStatus = exports.changeUserPassword = exports.deleteUserBySlugOrId = exports.patchUserBySlugOrId = exports.updateUserBySlugOrId = exports.getUserBySlugOrId = exports.getUsers = exports.getMe = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const lib_1 = require("../../lib");
const user_model_1 = __importDefault(require("./user.model"));
const helper_1 = require("../logs/helper");
const log_interface_1 = require("../../types/log.interface");
const slug_1 = require("../../lib/slug");
const helper_2 = require("../archives/helper");
const archive_interface_1 = require("../../types/archive.interface");
const getMe = async (req, res) => {
    res.json({
        message: "Protected route accessed ✅",
        user: req.user
    });
};
exports.getMe = getMe;
// GET /api/users
const getUsers = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const search = req.query.user_search || "";
        const role = req.query.role || "";
        const account = req.query.account || "";
        const regex = new RegExp(search, "i");
        const query = {
            $or: [
                { "name": regex },
                { "email": regex },
                { "role": regex },
            ],
        };
        if (role)
            query['role'] = role;
        if (account)
            query['account'] = account;
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        const users = await user_model_1.default.find(cleaned)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await user_model_1.default.countDocuments(cleaned);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch users"),
        });
    }
};
exports.getUsers = getUsers;
// controllers/user.controller.ts (Add these to your existing user controller)
// GET /api/users/:userId
const getUserBySlugOrId = async (req, res) => {
    try {
        const userId = req.params.slug;
        const slug = (0, slug_1.slugIdFilters)(userId);
        const user = await user_model_1.default.findOne(slug)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch user",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getUserBySlugOrId = getUserBySlugOrId;
// PUT /api/users/:userId
const updateUserBySlugOrId = async (req, res) => {
    try {
        const userId = req.params.slug;
        const slug = (0, slug_1.slugIdFilters)(userId);
        const { password, ...data } = req.body;
        // Check if user exists
        const existingUser = await user_model_1.default.findOne(slug);
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
        const updated = await user_model_1.default.findOneAndUpdate(slug, { $set: data }, { new: true, runValidators: true }).select("-password");
        // Handle password update separately if provided
        if (password) {
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            await user_model_1.default.findOneAndUpdate(slug, { $set: { password: hashedPassword } });
            // Fetch updated user with new password (but don't return password)
            const userWithNewPass = await user_model_1.default.findOne(slug).select("-password");
            Object.assign(updated, userWithNewPass);
        }
        // Log the update
        await (0, helper_1.logAction)({
            title: `User [${updated?.name}] updated`,
            description: `User ${updated?.email} was updated`,
            meta: { userId: updated?._id, updates: Object.keys(data) },
            severity: log_interface_1.ELogSeverity.INFO,
        });
        res.status(200).json({
            message: "User updated successfully",
            success: true,
            data: updated,
        });
    }
    catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.updateUserBySlugOrId = updateUserBySlugOrId;
// PATCH /api/users/:userId (partial updates)
const patchUserBySlugOrId = async (req, res) => {
    try {
        const userId = req.params.slug;
        const slug = (0, slug_1.slugIdFilters)(userId);
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
        const updated = await user_model_1.default.findOneAndUpdate(slug, { $set: updates }, { new: true, runValidators: true }).select("-password");
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Log the patch
        await (0, helper_1.logAction)({
            title: `User [${updated.name}] patched`,
            description: `User ${updated.email} was partially updated`,
            meta: { userId: updated._id, updates: Object.keys(updates) },
            severity: log_interface_1.ELogSeverity.INFO,
        });
        res.status(200).json({
            message: "User updated successfully",
            success: true,
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.patchUserBySlugOrId = patchUserBySlugOrId;
// DELETE /api/users/:userId
const deleteUserBySlugOrId = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        // Check if user exists
        const userToDelete = await user_model_1.default.findOne(filter);
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
        const deleted = await user_model_1.default.findOneAndDelete(filter).select("-password");
        // Archive the deleted user
        await (0, helper_2.saveToArchive)({
            data: deleted,
            originalId: slug,
            sourceCollection: archive_interface_1.EArchivesCollection.USERS,
            reason: 'User deleted',
        });
        // Log the deletion
        await (0, helper_1.logAction)({
            title: `User [${deleted?.name}] deleted`,
            description: `User ${deleted?.email} was deleted`,
            meta: {
                userId: deleted?._id,
                deletedBy: req.user?.id,
                deletedByEmail: req.user?.email
            },
            severity: log_interface_1.ELogSeverity.CRITICAL,
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
    }
    catch (error) {
        console.log({ error });
        res.status(500).json({
            success: false,
            message: "Failed to delete user",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteUserBySlugOrId = deleteUserBySlugOrId;
// POST /api/users/:userId/change-password
const changeUserPassword = async (req, res) => {
    try {
        const userId = req.params.slug;
        const slug = (0, slug_1.slugIdFilters)(userId);
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
        const user = await user_model_1.default.findOne(slug).select("+password");
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
            const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: "Current password is incorrect",
                });
            }
        }
        // Hash and update new password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        await user_model_1.default.findOneAndUpdate(slug, { $set: { password: hashedPassword } });
        // Log password change
        await (0, helper_1.logAction)({
            title: `Password changed for user [${user.name}]`,
            description: `User password was changed`,
            severity: log_interface_1.ELogSeverity.CRITICAL,
            meta: { targetUserId: user._id, changedBy: req.user?.id },
        });
        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to change password",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.changeUserPassword = changeUserPassword;
// POST /api/users/:userId/toggle-status
const toggleUserStatus = async (req, res) => {
    try {
        const params = req.params;
        const slug = (0, slug_1.slugIdFilters)(params.slug);
        const { status } = req.body;
        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value",
            });
        }
        const user = await user_model_1.default.findOne(slug);
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
        const updated = await user_model_1.default.findOneAndUpdate(slug, { $set: { status } }, { new: true }).select("-password");
        // Log status change
        await (0, helper_1.logAction)({
            title: `User [${user.name}] status changed to ${status}`,
            description: `User status updated`,
            severity: log_interface_1.ELogSeverity.CRITICAL,
            meta: { targetUserId: user._id, oldStatus: user.status, newStatus: status },
        });
        res.status(200).json({
            success: true,
            message: `User status updated to ${status}`,
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update user status",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.toggleUserStatus = toggleUserStatus;
