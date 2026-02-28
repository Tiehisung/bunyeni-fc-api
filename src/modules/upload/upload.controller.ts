// src/modules/upload/upload.controller.ts
import { Request, Response } from 'express';
import { cloudinary } from '../../config/cloudinary.config';
import { HttpStatusCode, } from 'axios'
import { IMulterFile } from '../../types/file.interface';

// Upload single image
export const uploadImageCTR = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image uploaded'
            });
        }

        // Multer-Cloudinary automatically uploads and gives us the file info
        const file = req.file as IMulterFile; // 'any' because Cloudinary adds extra fields
        console.log(file)
        res.status(HttpStatusCode.Ok).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: file.path, // Cloudinary URL
                secure_url: file.path,
                public_id: file.filename, // Cloudinary public_id
                bytes: file.size,
                // format: file.format,
                // width: file.width,
                // height: file.height,


            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(HttpStatusCode.InternalServerError).json({
            success: false,
            message: 'Image upload failed'
        });
    }
};

// Upload multiple images (gallery)
export const uploadGalleryCTR = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(HttpStatusCode.BadRequest).json({
                success: false,
                message: 'No images uploaded'
            });
        }

        const images = (files as IMulterFile[]).map(file => ({
            url: file.path,
            secure_url: file.path,
            public_id: file.filename,
            // format: file.format,
            // width: file.width,
            // height: file.height,
        }));

        res.status(HttpStatusCode.Ok).json({
            success: true,
            message: `${images.length} images uploaded successfully`,
            data: images
        });

    } catch (error) {
        console.error('Gallery upload error:', error);
        res.status(HttpStatusCode.InternalServerError).json({
            success: false,
            message: 'Gallery upload failed'
        });
    }
};

// Upload video
export const uploadVideoFileCTR = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(HttpStatusCode.BadRequest).json({
                success: false,
                message: 'No video uploaded'
            });
        }

        const file = req.file as any;

        res.status(HttpStatusCode.Ok).json({
            success: true,
            message: 'Video uploaded successfully',
            data: {
                url: file.path,
                secure_url: file.secure_url || file.path,
                public_id: file.filename,
                format: file.format,
                duration: file.duration,
                bytes: file.size,file
            }
        });

    } catch (error) {
        console.error('Video upload error:', error);
        res.status(HttpStatusCode.InternalServerError).json({
            success: false,
            message: 'Video upload failed'
        });
    }
};

// Upload document (PDF, etc)
export const uploadDocumentFileCTR = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(HttpStatusCode.BadRequest).json({
                success: false,
                message: 'No document uploaded'
            });
        }

        const file = req.file as any;

        res.status(HttpStatusCode.Ok).json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                url: file.path,
                secure_url: file.secure_url || file.path,
                public_id: file.filename,
                format: file.format,
                bytes: file.size,
                original_name: file.originalname
            }
        });

    } catch (error) {
        console.error('Document upload error:', error);
        res.status(HttpStatusCode.InternalServerError).json({
            success: false,
            message: 'Document upload failed'
        });
    }
};

// Delete file from Cloudinary
export const deleteFileCTR = async (req: Request, res: Response) => {
    try {
        const { public_id } = req.params;
        const { resource_type = 'image' } = req.query;

        const result = await cloudinary.uploader.destroy(public_id, {
            resource_type: resource_type as string
        });

        if (result.result === 'ok') {
            res.status(HttpStatusCode.Ok).json({
                success: true,
                message: 'File deleted successfully'
            });
        } else {
            res.status(HttpStatusCode.BadRequest).json({
                success: false,
                message: 'Failed to delete file'
            });
        }

    } catch (error) {
        console.error('Delete error:', error);
        res.status(HttpStatusCode.InternalServerError).json({
            success: false,
            message: 'File deletion failed'
        });
    }
};