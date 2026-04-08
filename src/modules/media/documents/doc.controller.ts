// controllers/document.controller.ts
import { Request, Response } from "express";
import { Document } from "mongoose";
import { removeEmptyKeys, getErrorMessage, } from "../../../lib";
import { TSearchKey } from "../../../types";
import { IDocFile } from "../../../types/doc";
import { ELogSeverity } from "../../../types/log.interface";
import { deleteCldAssets } from "../files/helper";
import { logAction } from "../../log/helper";
import DocModel from "./doc.model";
import FolderModel, { IPostFolder } from "./folder.model";
import { EUserRole } from "../../../types/user.interface";
import { LoggerService } from "../../../shared/log.service";

// ==================== MAIN DOCUMENT CONTROLLERS ====================

// GET /api/documents
export const getDocuments = async (req: Request, res: Response) => {
    try {
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "20", 10);
        const search = (req.query.doc_search as TSearchKey) || "";
        const folder = req.query.folder as string;
        const tags = (req.query.tags as string || "").split(',').filter(Boolean);

        const skip = (page - 1) * limit;
        const regex = new RegExp(search, "i");

        const query: any = {
            $or: [
                { "original_filename": regex },
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

        const cleaned = removeEmptyKeys(query);

        const documents = await DocModel.find(cleaned)
            .populate('folder',)
            .populate('createdBy', 'name role')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await DocModel.countDocuments(cleaned);

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch documents"),
        });
    }
};

// GET /api/documents/:id
export const getDocumentById = async (req: Request, res: Response) => {
    try {
        const { docId } = req.params;

        const document = await DocModel.findById(docId)
            .populate('folder', 'name docsCount')
            .populate('createdBy', 'name role')
            .lean();

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch document"),
        });
    }
};

// POST /api/documents
export const createDocuments = async (req: Request, res: Response) => {
    try {
        const { files, folderId } = req.body

        if (!Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No documents provided for upload",
            });
        }


        let destinationFolderId = folderId
        if (!folderId) {
            let othersFolder = await FolderModel.findOne({
                $or: [{ name: 'others' }, { name: 'Others' }],
            });//As default folder

            if (!othersFolder) {
                othersFolder = await FolderModel.create({ name: 'others', isDefault: true })
            }

            destinationFolderId = othersFolder._id
        }


        const createdDocs: Document[] = [];
        for (const df of files) {
            const createdDoc = await DocModel.create({
                ...df, folder: destinationFolderId, createdBy: req?.user
            });


            // Push to folder
            await FolderModel.findByIdAndUpdate(
                destinationFolderId,
                { $addToSet: { documents: createdDoc._id } },
                { upsert: true }
            );

            createdDocs.push(createdDoc);
        }

        // Log action
        LoggerService.critical(`Document(s) uploaded to folder - ${destinationFolderId}`, `${createdDocs.length} document(s) uploaded on ${new Date().toISOString()}`, req)

        res.status(201).json({
            success: true,
            message: "New Document(s) Uploaded",
            data: createdDocs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to upload document"),
        });
    }
};

// PUT /api/documents/:id
export const updateDocument = async (req: Request, res: Response) => {
    try {
        const { docId } = req.params;
        const updates = req.body;

        const updatedDoc = await DocModel.findByIdAndUpdate(
            docId,
            { $set: { ...updates, updatedAt: new Date(), updatedBy: req?.user?._id } },
            { runValidators: true }
        );

        if (!updatedDoc) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }

        // If folder changed, update folder associations
        if (updates.folder && updates.folder !== updatedDoc.folder) {
            // Remove from old folder
            await FolderModel.updateMany(
                { documents: docId },
                { $pull: { documents: docId } }
            );

            // Add to new folder
            await FolderModel.findOneAndUpdate(
                { name: updates.folder },
                { $addToSet: { documents: docId } },
                { upsert: true }
            );
        }

        res.status(200).json({
            success: true,
            message: "Document updated successfully",
            data: updatedDoc,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update document"),
        });
    }
};

// DELETE /api/documents (bulk delete)
export const deleteDocuments = async (req: Request, res: Response) => {
    try {
        const documents = req.body as IDocFile[];

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
                await deleteCldAssets([{ ...documentFile }]);

                // Delete file data from database
                const deleteFromDb = await DocModel.findOneAndDelete({
                    _id: documentFile._id
                });

                if (deleteFromDb) {
                    // Remove from folders
                    await FolderModel.updateMany(
                        { documents: documentFile._id },
                        { $pull: { documents: documentFile._id } }
                    );

                    results.push(documentFile._id);
                }
            } catch (err) {
                errors.push({ id: documentFile._id, error: err });
            }
        }

        // Log action
        await logAction({
            title: `Documents deleted - ${results.length} files`,
            description: `${results.length} documents deleted, ${errors.length} failed`,
            severity: errors.length > 0 ? ELogSeverity.WARNING : ELogSeverity.INFO,
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
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete files.",
            success: false,
            error: error,
        });
    }
};

// DELETE /api/documents/:id (single delete)
export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const { docId } = req.params;

        const documentFile = await DocModel.findById(docId).lean();

        if (!documentFile) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }

        // Delete file from cloudinary
        await deleteCldAssets([documentFile as any]);

        // Delete file data from database
        const deleteFromDb = await DocModel.findByIdAndDelete(docId);

        // Remove from folders
        await FolderModel.updateMany(
            { documents: docId },
            { $pull: { documents: docId } }
        );

        // Log action
        await logAction({
            title: `Document deleted - ${documentFile?.name ?? documentFile?.original_filename}`,
            description: `${documentFile?.original_filename} deleted from ${documentFile?.folder}`,
            severity: ELogSeverity.CRITICAL,
            meta: { documentId: docId, folder: documentFile?.folder },
        });

        res.status(200).json({
            message: "Delete successful",
            success: true,
            data: deleteFromDb,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete file.",
            success: false,
            error: error,
        });
    }
};

// PUT /api/documents/move-copy (move or copy documents)
export const moveDocuments = async (req: Request, res: Response) => {
    try {
        const { fileIds, destinationFolderId } = req.body


        // const operations = req.body as IDocMoveCopy[];

        if (!Array.isArray(fileIds) || fileIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files provided",
            });
        }

        const results = [];

        for (const fileId of fileIds) {
            await DocModel.findByIdAndUpdate(fileId, {
                $set: {
                    folder: destinationFolderId,
                }
            });

            // Update folder associations
            await FolderModel.updateMany(
                { documents: fileId },
                { $pull: { documents: fileId } }
            );

            await FolderModel.findByIdAndUpdate(
                destinationFolderId,
                { $addToSet: { documents: fileId } },
                { upsert: true }
            );

            results.push({ id: fileId, destination: destinationFolderId });

            // else if (actionType === 'Copy') {
            //     const { _id, ...docWithoutId } = file;
            //     const newDoc = await DocModel.create({
            //         ...docWithoutId,
            //         folder: destinationFolder,
            //         createdAt: new Date(),
            //         createdBy: req?.user?._id,
            //         copiedFrom: file._id,
            //     });

            //     await FolderModel.findOneAndUpdate(
            //         { name: destinationFolder },
            //         { $addToSet: { documents: newDoc._id } },
            //         { upsert: true }
            //     );

            //     results.push({ id: newDoc._id, action: 'Copied', destination: destinationFolder, sourceId: file._id });
            // }
        }

        // Log action
        await logAction({
            title: `Documents moved operation`,
            description: `${results.length} documents processed`,
            severity: ELogSeverity.INFO,
            meta: { operations: results },
        });

        res.status(200).json({
            success: true,
            message: `${fileIds.length} moved`,
            data: results,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, `Operation failed`),
        });
    }
};

// ==================== FOLDER CONTROLLERS ====================

// GET /api/folders
export const getFolders = async (req: Request, res: Response) => {
    try {
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "10", 10);
        const search = (req.query.folder_search as string) || "";
        const isDefault = (req.query.isDefault) || false;

        const skip = (page - 1) * limit;
        const regex = new RegExp(search, "i");

        // Build Query Object
        const query: Record<string, unknown> = {};
        if (search) {
            query.$or = [
                { name: regex },
                { description: regex },
            ];
        }

        if (isDefault) {
            query.isDefault = true
        }

        const cleaned = removeEmptyKeys(query);

        const folders = await FolderModel.find(cleaned)
            .populate('documents')
            .populate('createdBy', 'name role')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const formatted =
            folders.map(f => ({
                ...f,
                docsCount: f.documents?.length || 0,
            }))

        const total = await FolderModel.countDocuments(cleaned);
        res.status(200).json({
            success: true,
            data: formatted,
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
            message: getErrorMessage(error, "Failed to fetch folders"),
        });
    }
};

// GET /api/folders/:name
export const getFolderById = async (req: Request, res: Response) => {
    try {
        const { folderId } = req.params;

        const folder = await FolderModel.findById(folderId)
            .populate('documents')
            .populate('createdBy', 'name role')
            .lean();

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: "Folder not found",
            });
        }

        const docs = await FolderModel.find(
            { documents: folderId },
        );

        res.status(200).json({
            success: true,
            data: folder,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch folder"),
        });
    }
};

// POST /api/folders
export const createFolder = async (req: Request, res: Response) => {
    try {
        const { name, description, isDefault } = req.body;

        const existingFolder = await FolderModel.findOne({ name });
        if (existingFolder) {
            return res.status(409).json({
                success: false,
                message: "Folder already exists",
            });
        }

        const folder = await FolderModel.create({
            name,
            description,
            isDefault, 
            createdBy: req?.user
        });

        res.status(201).json({
            success: true,
            message: "Folder created successfully",
            data: folder,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to create folder"),
        });
    }
};

// PUT /api/folders/:id
export const updateFolder = async (req: Request, res: Response) => {
    try {
        const { folderId } = req.params;
        const updates = req.body;
        if (updates.name) {

            const existingFolder = await FolderModel.findOne({ name: updates.name });
            if (existingFolder) {
                return res.status(409).json({
                    success: false,
                    message: "Folder already exists",
                });
            }
        }

        const folder = await FolderModel.findByIdAndUpdate(
            folderId,
            { $set: { ...updates, updatedAt: new Date(), updatedBy: req?.user?._id } },
        );

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update folder"),
        });
    }
};

// DELETE /api/folders/:id
export const deleteFolder = async (req: Request, res: Response) => {
    try {
        const { folderId } = req.params;

        const folder = await FolderModel.findById(folderId);

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: "Folder not found",
            });
        }

        await FolderModel.findByIdAndDelete(folderId);
        await DocModel.deleteMany({ foler: folderId })

        res.status(200).json({
            success: true,
            message: "Folder deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to delete folder"),
        });
    }
};

// ==================== FOLDER DOCUMENTS CONTROLLERS ====================

// GET /api/folders/:folder/documents
export const getFolderDocuments = async (req: Request, res: Response) => {
    try {
        const { folderId } = req.params;
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "20", 10);
        const search = (req.query.doc_search as TSearchKey) || "";

        const skip = (page - 1) * limit;
        const regex = new RegExp(search, "i");

        const query: any = {
            folder: folderId,
        };

        if (search) {
            query.$or = [
                { "original_filename": regex },
                { "description": regex },
                { "tags": regex },
            ]
        }


        const cleaned = removeEmptyKeys(query);

        const documents = await DocModel.find(cleaned)
            .populate('folder',)
            .populate('createdBy', 'name role')
            .sort({ createdAt: 'desc' })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await DocModel.countDocuments(cleaned);

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch folder documents"),
        });
    }
};

// controllers/folder.controller.ts (Add these to your existing folder controller)

// PUT /api/folders/:id
export const updateFolderById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body as IPostFolder;
        const { name, description, isDefault } = updateData;

        // Find the folder first
        const foundFolder = await FolderModel.findById(id).populate('documents');

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
        await FolderModel.findByIdAndUpdate(id, {
            $set: {
                ...updateData,
                updatedAt: new Date(),
                updatedBy: req?.user?._id,
            },
        });

        // Rename 'folder' field in every containing document if name changed
        if (name && originalName !== name) {
            const documentIds = foundFolder?.documents
                ?.map((doc: any) => doc?._id?.toString())
                .filter(Boolean) ?? [];

            if (documentIds.length > 0) {
                await DocModel.updateMany(
                    { _id: { $in: documentIds } },
                    { $set: { folder: name } }
                );
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
        await logAction({
            title: title || `Folder [${name || originalName}] updated.`,
            description: desc + defaultChangedMsg,
            severity: ELogSeverity.INFO,
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
        const updatedFolder = await FolderModel.findById(id).populate('documents').lean();

        res.status(200).json({
            success: true,
            message: "Folder updated successfully",
            data: updatedFolder,
        });
    } catch (error) {
        console.error("Folder update error:", error);
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update folder"),
        });
    }
};

// PATCH /api/folders/:id (partial updates)
export const patchFolderById = async (req: Request, res: Response) => {
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
        const foundFolder = await FolderModel.findById(id);

        if (!foundFolder) {
            return res.status(404).json({
                success: false,
                message: "Folder not found",
            });
        }

        // Handle name change specially
        if (updates.name && updates.name !== foundFolder.name) {
            // Update all documents in this folder to use new folder name
            await DocModel.updateMany(
                { folder: foundFolder.name },
                { $set: { folder: updates.name } }
            );
        }

        // Update the folder
        const updatedFolder = await FolderModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...updates,
                    updatedAt: new Date(),
                    updatedBy: req?.user?._id,
                },
            },
            { runValidators: true }
        ).populate('documents');

        // Log the action
        await logAction({
            title: `Folder [${updatedFolder?.name}] updated`,
            description: `Folder was partially updated`,
            severity: ELogSeverity.INFO,
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to update folder"),
        });
    }
};

// DELETE /api/folders/:id
export const deleteFolderById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check authorization - only SUPER_ADMIN can delete folders
        if (req?.user?.role !== EUserRole.SUPER_ADMIN) {
            return res.status(403).json({
                message: "Unauthorized. Only super admins can delete folders.",
                success: false,
            });
        }

        // Find and delete the folder, populating documents
        const deletedFolder = await FolderModel.findByIdAndDelete(id)
            .populate('documents');

        if (!deletedFolder) {
            return res.status(404).json({
                success: false,
                message: "Folder not found",
            });
        }

        // Prepare document deletion
        const documents = deletedFolder?.documents || [];
        const documentIds = documents.map((doc: any) => doc._id).filter(Boolean);

        // Delete files from cloudinary
        if (documents.length > 0) {
            const cloudinaryAssets = documents
                .map((doc: any) => ({ public_id: doc.public_id }))
                .filter((asset: { public_id: any; }) => asset.public_id);

            if (cloudinaryAssets.length > 0) {
                await deleteCldAssets(cloudinaryAssets);
            }
        }

        // Delete file data from database
        let deleteFromDb = { deletedCount: 0 };
        if (documentIds.length > 0) {
            deleteFromDb = await DocModel.deleteMany({
                _id: { $in: documentIds },
            });
        }

        // Prepare log description
        const logDesc = documents.length > 0
            ? `${documents.length} docs deleted: [${documents.map((dd: any) => dd.name).join(', ')}].`
            : 'No documents to delete.';

        // Log the action
        await logAction({
            title: "Folder deleted",
            description: logDesc,
            severity: ELogSeverity.CRITICAL,
            meta: {
                folderId: id,
                folderName: deletedFolder.name,
                documentsDeleted: documents.length,
                documentNames: documents.map((d: any) => d.name),
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
    } catch (error) {
        console.error("Folder deletion error:", error);
        res.status(500).json({
            message: "Failed to delete folder.",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// DELETE /api/folders (bulk delete - admin only)
export const deleteMultipleFolders = async (req: Request, res: Response) => {
    try {
        const { folderIds } = req.body;

        if (!folderIds || !Array.isArray(folderIds) || folderIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No folder IDs provided",
            });
        }

        // Check authorization
        if (req?.user?.role !== EUserRole.SUPER_ADMIN) {
            return res.status(403).json({
                message: "Unauthorized. Only super admins can delete folders.",
                success: false,
            });
        }

        const results = {
            successful: [] as string[],
            failed: [] as { id: string; error: string }[],
            documentsDeleted: 0,
        };

        for (const folderId of folderIds) {
            try {
                // Find and delete folder
                const deletedFolder = await FolderModel.findByIdAndDelete(folderId)
                    .populate('documents');

                if (deletedFolder) {
                    const documents = deletedFolder?.documents || [];
                    const documentIds = documents.map((doc: any) => doc._id).filter(Boolean);

                    // Delete from cloudinary
                    if (documents.length > 0) {
                        const cloudinaryAssets = documents
                            .map((doc: any) => ({ public_id: doc.public_id }))
                            .filter((asset: { public_id: any; }) => asset.public_id);

                        if (cloudinaryAssets.length > 0) {
                            await deleteCldAssets(cloudinaryAssets);
                        }
                    }

                    // Delete from database
                    if (documentIds.length > 0) {
                        const result = await DocModel.deleteMany({
                            _id: { $in: documentIds },
                        });
                        results.documentsDeleted += result.deletedCount || 0;
                    }

                    results.successful.push(folderId);
                }
            } catch (error) {
                results.failed.push({
                    id: folderId,
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }

        // Log bulk deletion
        await logAction({
            title: `Bulk folder deletion - ${results.successful.length} folders`,
            description: `${results.successful.length} folders deleted, ${results.failed.length} failed`,
            severity: results.failed.length > 0 ? ELogSeverity.WARNING : ELogSeverity.CRITICAL,
            meta: results,
        });

        res.status(200).json({
            message: "Bulk folder deletion completed",
            success: true,
            data: results,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete folders.",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};