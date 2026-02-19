"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMultipleFolders = exports.deleteFolderById = exports.patchFolderById = exports.updateFolderById = exports.getFolderDocuments = exports.deleteFolder = exports.updateFolder = exports.createFolder = exports.getFolderByName = exports.getFolders = exports.moveCopyDocuments = exports.deleteDocument = exports.deleteDocuments = exports.updateDocument = exports.createDocument = exports.getDocumentById = exports.getDocuments = void 0;
const lib_1 = require("../../../lib");
const log_interface_1 = require("../../../types/log.interface");
const helper_1 = require("../files/helper");
const helper_2 = require("../../logs/helper");
const doc_model_1 = __importDefault(require("./doc.model"));
const folder_model_1 = __importDefault(require("./folders/folder.model"));
const user_1 = require("../../../types/user");
// ==================== MAIN DOCUMENT CONTROLLERS ====================
// GET /api/documents
const getDocuments = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "20", 10);
        const search = req.query.doc_search || "";
        const folder = req.query.folder;
        const tags = (req.query.tags || "").split(',').filter(Boolean);
        const skip = (page - 1) * limit;
        const regex = new RegExp(search, "i");
        const query = {
            $or: [
                { "name": regex },
                { "original_filename": regex },
                { "folder": regex },
                { "description": regex },
                { "tags": regex },
            ],
        };
        if (folder) {
            query.folder = folder;
        }
        if (tags.length > 0) {
            query.tags = { $in: tags };
        }
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        const documents = await doc_model_1.default.find(cleaned)
            .sort({ createdAt: 'desc' })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await doc_model_1.default.countDocuments(cleaned);
        res.status(200).json({
            success: true,
            data: documents,
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch documents"),
        });
    }
};
exports.getDocuments = getDocuments;
// GET /api/documents/:id
const getDocumentById = async (req, res) => {
    try {
        const { id } = req.params;
        const document = await doc_model_1.default.findById(id).lean();
        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }
        res.status(200).json({
            success: true,
            data: document,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch document"),
        });
    }
};
exports.getDocumentById = getDocumentById;
// POST /api/documents
const createDocument = async (req, res) => {
    try {
        const { file, folder, format, tags } = req.body;
        const doc = await doc_model_1.default.create({
            ...file,
            tags,
            folder,
            format,
            createdBy: req.user?.id,
            createdAt: new Date(),
        });
        // Push to folder
        await folder_model_1.default.findOneAndUpdate({ name: folder }, { $addToSet: { documents: doc?._id } }, { upsert: true });
        // Log action
        await (0, helper_2.logAction)({
            title: `Document uploaded to - ${folder}`,
            description: `${file.name ?? file.original_filename} uploaded on ${Date.now()}`,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: { documentId: doc._id, folder },
        });
        res.status(201).json({
            success: true,
            message: "New Document Uploaded",
            data: doc,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to upload document"),
        });
    }
};
exports.createDocument = createDocument;
// PUT /api/documents/:id
const updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedDoc = await doc_model_1.default.findByIdAndUpdate(id, { $set: { ...updates, updatedAt: new Date(), updatedBy: req.user?.id } }, { new: true, runValidators: true });
        if (!updatedDoc) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }
        // If folder changed, update folder associations
        if (updates.folder && updates.folder !== updatedDoc.folder) {
            // Remove from old folder
            await folder_model_1.default.updateMany({ documents: id }, { $pull: { documents: id } });
            // Add to new folder
            await folder_model_1.default.findOneAndUpdate({ name: updates.folder }, { $addToSet: { documents: id } }, { upsert: true });
        }
        res.status(200).json({
            success: true,
            message: "Document updated successfully",
            data: updatedDoc,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update document"),
        });
    }
};
exports.updateDocument = updateDocument;
// DELETE /api/documents (bulk delete)
const deleteDocuments = async (req, res) => {
    try {
        const documents = req.body;
        if (!Array.isArray(documents) || documents.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No documents provided for deletion",
            });
        }
        const results = [];
        const errors = [];
        for (const documentFile of documents) {
            try {
                // Delete file from cloudinary
                await (0, helper_1.deleteCldAssets)([{ ...documentFile }]);
                // Delete file data from database
                const deleteFromDb = await doc_model_1.default.findOneAndDelete({
                    _id: documentFile._id
                });
                if (deleteFromDb) {
                    // Remove from folders
                    await folder_model_1.default.updateMany({ documents: documentFile._id }, { $pull: { documents: documentFile._id } });
                    results.push(documentFile._id);
                }
            }
            catch (err) {
                errors.push({ id: documentFile._id, error: err });
            }
        }
        // Log action
        await (0, helper_2.logAction)({
            title: `Documents deleted - ${results.length} files`,
            description: `${results.length} documents deleted, ${errors.length} failed`,
            severity: errors.length > 0 ? log_interface_1.ELogSeverity.WARNING : log_interface_1.ELogSeverity.INFO,
            meta: { successful: results, failed: errors },
        });
        res.status(200).json({
            message: "Delete operation completed",
            success: true,
            data: {
                deleted: results.length,
                failed: errors.length,
                errors: errors,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to delete files.",
            success: false,
            error: error,
        });
    }
};
exports.deleteDocuments = deleteDocuments;
// DELETE /api/documents/:id (single delete)
const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const documentFile = await doc_model_1.default.findById(id).lean();
        if (!documentFile) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }
        // Delete file from cloudinary
        await (0, helper_1.deleteCldAssets)([documentFile]);
        // Delete file data from database
        const deleteFromDb = await doc_model_1.default.findByIdAndDelete(id);
        // Remove from folders
        await folder_model_1.default.updateMany({ documents: id }, { $pull: { documents: id } });
        // Log action
        await (0, helper_2.logAction)({
            title: `Document deleted - ${documentFile?.name ?? documentFile?.original_filename}`,
            description: `${documentFile?.original_filename} deleted from ${documentFile?.folder}`,
            severity: log_interface_1.ELogSeverity.CRITICAL,
            meta: { documentId: id, folder: documentFile?.folder },
        });
        res.status(200).json({
            message: "Delete successful",
            success: true,
            data: deleteFromDb,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to delete file.",
            success: false,
            error: error,
        });
    }
};
exports.deleteDocument = deleteDocument;
// PUT /api/documents/move-copy (move or copy documents)
const moveCopyDocuments = async (req, res) => {
    try {
        const operations = req.body;
        // const operations = req.body as IDocMoveCopy[];
        if (!Array.isArray(operations) || operations.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No operations provided",
            });
        }
        const results = [];
        for (const op of operations) {
            const { file, actionType, destinationFolder } = op;
            if (actionType === 'Move') {
                await doc_model_1.default.findByIdAndUpdate(file._id, {
                    $set: { folder: destinationFolder, updatedAt: new Date(), updatedBy: req.user?.id }
                });
                // Update folder associations
                await folder_model_1.default.updateMany({ documents: file._id }, { $pull: { documents: file._id } });
                await folder_model_1.default.findOneAndUpdate({ name: destinationFolder }, { $addToSet: { documents: file._id } }, { upsert: true });
                results.push({ id: file._id, action: 'Moved', destination: destinationFolder });
            }
            else if (actionType === 'Copy') {
                const { _id, ...docWithoutId } = file;
                const newDoc = await doc_model_1.default.create({
                    ...docWithoutId,
                    folder: destinationFolder,
                    createdAt: new Date(),
                    createdBy: req.user?.id,
                    copiedFrom: file._id,
                });
                await folder_model_1.default.findOneAndUpdate({ name: destinationFolder }, { $addToSet: { documents: newDoc._id } }, { upsert: true });
                results.push({ id: newDoc._id, action: 'Copied', destination: destinationFolder, sourceId: file._id });
            }
        }
        // Log action
        await (0, helper_2.logAction)({
            title: `Documents ${operations[0].actionType} operation`,
            description: `${results.length} documents processed`,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: { operations: results },
        });
        res.status(200).json({
            success: true,
            message: `${operations[0].actionType} operations completed`,
            data: results,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, `Operation failed`),
        });
    }
};
exports.moveCopyDocuments = moveCopyDocuments;
// ==================== FOLDER CONTROLLERS ====================
// GET /api/folders
const getFolders = async (req, res) => {
    try {
        const folders = await folder_model_1.default.find().lean();
        const totalDocs = await doc_model_1.default.countDocuments();
        const metrics = {
            totalDocs,
            folders: folders.map(f => ({
                ...f,
                docsCount: f.documents?.length || 0,
            }))
        };
        res.status(200).json({
            success: true,
            data: metrics
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch folders"),
        });
    }
};
exports.getFolders = getFolders;
// GET /api/folders/:name
const getFolderByName = async (req, res) => {
    try {
        const { name } = req.params;
        const folder = await folder_model_1.default.findOne({ name }).lean();
        if (!folder) {
            return res.status(404).json({
                success: false,
                message: "Folder not found",
            });
        }
        res.status(200).json({
            success: true,
            data: folder,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch folder"),
        });
    }
};
exports.getFolderByName = getFolderByName;
// POST /api/folders
const createFolder = async (req, res) => {
    try {
        const { name, description, parent } = req.body;
        const existingFolder = await folder_model_1.default.findOne({ name });
        if (existingFolder) {
            return res.status(409).json({
                success: false,
                message: "Folder already exists",
            });
        }
        const folder = await folder_model_1.default.create({
            name,
            description,
            parent,
            documents: [],
            createdBy: req.user?.id,
            createdAt: new Date(),
        });
        res.status(201).json({
            success: true,
            message: "Folder created successfully",
            data: folder,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to create folder"),
        });
    }
};
exports.createFolder = createFolder;
// PUT /api/folders/:id
const updateFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const folder = await folder_model_1.default.findByIdAndUpdate(id, { $set: { ...updates, updatedAt: new Date(), updatedBy: req.user?.id } }, { new: true });
        if (!folder) {
            return res.status(404).json({
                success: false,
                message: "Folder not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Folder updated successfully",
            data: folder,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update folder"),
        });
    }
};
exports.updateFolder = updateFolder;
// DELETE /api/folders/:id
const deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const folder = await folder_model_1.default.findById(id);
        if (!folder) {
            return res.status(404).json({
                success: false,
                message: "Folder not found",
            });
        }
        // Check if folder has documents
        if (folder.documents && folder.documents.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete folder with documents. Move or delete documents first.",
                documentsCount: folder.documents.length,
            });
        }
        await folder_model_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Folder deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to delete folder"),
        });
    }
};
exports.deleteFolder = deleteFolder;
// ==================== FOLDER DOCUMENTS CONTROLLERS ====================
// GET /api/folders/:folder/documents
const getFolderDocuments = async (req, res) => {
    try {
        const { folder } = req.params;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "20", 10);
        const search = req.query.doc_search || "";
        const skip = (page - 1) * limit;
        const regex = new RegExp(search, "i");
        const query = {
            folder: folder,
            $or: [
                { "name": regex },
                { "original_filename": regex },
                { "folder": regex },
                { "description": regex },
                { "tags": regex },
            ],
        };
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        const documents = await doc_model_1.default.find(cleaned)
            .sort({ createdAt: 'desc' })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await doc_model_1.default.countDocuments(cleaned);
        res.status(200).json({
            success: true,
            data: documents,
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
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch folder documents"),
        });
    }
};
exports.getFolderDocuments = getFolderDocuments;
// controllers/folder.controller.ts (Add these to your existing folder controller)
// PUT /api/folders/:id
const updateFolderById = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const { name, description, isDefault } = updateData;
        // Find the folder first
        const foundFolder = await folder_model_1.default.findById(id).populate('documents');
        if (!foundFolder) {
            return res.status(404).json({
                success: false,
                message: "Folder not found",
            });
        }
        // Store original values for logging
        const originalName = foundFolder.name;
        const originalDescription = foundFolder.description;
        const originalIsDefault = foundFolder.isDefault;
        // Update the folder
        await folder_model_1.default.findByIdAndUpdate(id, {
            $set: {
                ...updateData,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        });
        // Rename 'folder' field in every containing document if name changed
        if (name && originalName !== name) {
            const documentIds = foundFolder?.documents
                ?.map((doc) => doc?._id?.toString())
                .filter(Boolean) ?? [];
            if (documentIds.length > 0) {
                await doc_model_1.default.updateMany({ _id: { $in: documentIds } }, { $set: { folder: name } });
            }
        }
        // Prepare log messages
        let title = '';
        let desc = '';
        let defaultChangedMsg = '';
        if (name && originalName !== name) {
            title += `Name changed from ${originalName} to ${name}. `;
        }
        if (description && originalDescription !== description) {
            desc += `Description changed from ${originalDescription} to ${description}. `;
        }
        if (originalIsDefault !== isDefault) {
            defaultChangedMsg = isDefault
                ? 'Folder made default'
                : 'Folder changed from being system default';
        }
        // Log the action
        await (0, helper_2.logAction)({
            title: title || `Folder [${name || originalName}] updated.`,
            description: desc + defaultChangedMsg,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: {
                folderId: id,
                changes: {
                    name: name !== originalName ? { from: originalName, to: name } : undefined,
                    description: description !== originalDescription ? { from: originalDescription, to: description } : undefined,
                    isDefault: isDefault !== originalIsDefault ? { from: originalIsDefault, to: isDefault } : undefined,
                },
            },
        });
        // Fetch updated folder for response
        const updatedFolder = await folder_model_1.default.findById(id).populate('documents').lean();
        res.status(200).json({
            success: true,
            message: "Folder updated successfully",
            data: updatedFolder,
        });
    }
    catch (error) {
        console.error("Folder update error:", error);
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update folder"),
        });
    }
};
exports.updateFolderById = updateFolderById;
// PATCH /api/folders/:id (partial updates)
const patchFolderById = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Remove undefined fields
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined || updates[key] === null) {
                delete updates[key];
            }
        });
        // Find the folder first
        const foundFolder = await folder_model_1.default.findById(id);
        if (!foundFolder) {
            return res.status(404).json({
                success: false,
                message: "Folder not found",
            });
        }
        // Handle name change specially
        if (updates.name && updates.name !== foundFolder.name) {
            // Update all documents in this folder to use new folder name
            await doc_model_1.default.updateMany({ folder: foundFolder.name }, { $set: { folder: updates.name } });
        }
        // Update the folder
        const updatedFolder = await folder_model_1.default.findByIdAndUpdate(id, {
            $set: {
                ...updates,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true, runValidators: true }).populate('documents');
        // Log the action
        await (0, helper_2.logAction)({
            title: `Folder [${updatedFolder?.name}] updated`,
            description: `Folder was partially updated`,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: {
                folderId: id,
                updates: Object.keys(updates),
            },
        });
        res.status(200).json({
            success: true,
            message: "Folder updated successfully",
            data: updatedFolder,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update folder"),
        });
    }
};
exports.patchFolderById = patchFolderById;
// DELETE /api/folders/:id
const deleteFolderById = async (req, res) => {
    try {
        const { id } = req.params;
        // Check authorization - only SUPER_ADMIN can delete folders
        if (req.user?.role !== user_1.EUserRole.SUPER_ADMIN) {
            return res.status(403).json({
                message: "Unauthorized. Only super admins can delete folders.",
                success: false,
            });
        }
        // Find and delete the folder, populating documents
        const deletedFolder = await folder_model_1.default.findByIdAndDelete(id)
            .populate('documents');
        if (!deletedFolder) {
            return res.status(404).json({
                success: false,
                message: "Folder not found",
            });
        }
        // Prepare document deletion
        const documents = deletedFolder?.documents || [];
        const documentIds = documents.map((doc) => doc._id).filter(Boolean);
        // Delete files from cloudinary
        if (documents.length > 0) {
            const cloudinaryAssets = documents
                .map((doc) => ({ public_id: doc.public_id }))
                .filter((asset) => asset.public_id);
            if (cloudinaryAssets.length > 0) {
                await (0, helper_1.deleteCldAssets)(cloudinaryAssets);
            }
        }
        // Delete file data from database
        let deleteFromDb = { deletedCount: 0 };
        if (documentIds.length > 0) {
            deleteFromDb = await doc_model_1.default.deleteMany({
                _id: { $in: documentIds },
            });
        }
        // Prepare log description
        const logDesc = documents.length > 0
            ? `${documents.length} docs deleted: [${documents.map((dd) => dd.name).join(', ')}].`
            : 'No documents to delete.';
        // Log the action
        await (0, helper_2.logAction)({
            title: "Folder deleted",
            description: logDesc,
            severity: log_interface_1.ELogSeverity.CRITICAL,
            meta: {
                folderId: id,
                folderName: deletedFolder.name,
                documentsDeleted: documents.length,
                documentNames: documents.map((d) => d.name),
            },
        });
        res.status(200).json({
            message: "Folder deleted successfully",
            success: true,
            data: {
                folder: {
                    id: deletedFolder._id,
                    name: deletedFolder.name,
                },
                documentsDeleted: deleteFromDb.deletedCount,
            },
        });
    }
    catch (error) {
        console.error("Folder deletion error:", error);
        res.status(500).json({
            message: "Failed to delete folder.",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteFolderById = deleteFolderById;
// DELETE /api/folders (bulk delete - admin only)
const deleteMultipleFolders = async (req, res) => {
    try {
        const { folderIds } = req.body;
        if (!folderIds || !Array.isArray(folderIds) || folderIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No folder IDs provided",
            });
        }
        // Check authorization
        if (req.user?.role !== user_1.EUserRole.SUPER_ADMIN) {
            return res.status(403).json({
                message: "Unauthorized. Only super admins can delete folders.",
                success: false,
            });
        }
        const results = {
            successful: [],
            failed: [],
            documentsDeleted: 0,
        };
        for (const folderId of folderIds) {
            try {
                // Find and delete folder
                const deletedFolder = await folder_model_1.default.findByIdAndDelete(folderId)
                    .populate('documents');
                if (deletedFolder) {
                    const documents = deletedFolder?.documents || [];
                    const documentIds = documents.map((doc) => doc._id).filter(Boolean);
                    // Delete from cloudinary
                    if (documents.length > 0) {
                        const cloudinaryAssets = documents
                            .map((doc) => ({ public_id: doc.public_id }))
                            .filter((asset) => asset.public_id);
                        if (cloudinaryAssets.length > 0) {
                            await (0, helper_1.deleteCldAssets)(cloudinaryAssets);
                        }
                    }
                    // Delete from database
                    if (documentIds.length > 0) {
                        const result = await doc_model_1.default.deleteMany({
                            _id: { $in: documentIds },
                        });
                        results.documentsDeleted += result.deletedCount || 0;
                    }
                    results.successful.push(folderId);
                }
            }
            catch (error) {
                results.failed.push({
                    id: folderId,
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }
        // Log bulk deletion
        await (0, helper_2.logAction)({
            title: `Bulk folder deletion - ${results.successful.length} folders`,
            description: `${results.successful.length} folders deleted, ${results.failed.length} failed`,
            severity: results.failed.length > 0 ? log_interface_1.ELogSeverity.WARNING : log_interface_1.ELogSeverity.CRITICAL,
            meta: results,
        });
        res.status(200).json({
            message: "Bulk folder deletion completed",
            success: true,
            data: results,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to delete folders.",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteMultipleFolders = deleteMultipleFolders;
