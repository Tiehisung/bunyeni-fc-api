// src/modules/upload/upload.routes.ts
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import {
    uploadSingleImage,
    uploadMultipleImages,
    uploadVideo,
    uploadDocument,
    uploadMixed
} from '../../config/cloudinary.config';
import {
    uploadImageCTR,
    uploadGalleryCTR,
    uploadVideoFileCTR,
    uploadDocumentFileCTR,
    deleteFileCTR
} from './upload.controller';

const router = Router();

// Protect all upload routes
router.use(authenticate);

// Single image upload
router.post('/image', uploadSingleImage, uploadImageCTR);

// Multiple images upload (gallery)
router.post('/gallery', uploadMultipleImages, uploadGalleryCTR);

// Video upload
router.post('/video', uploadVideo, uploadVideoFileCTR);

// Document upload
router.post('/document', uploadDocument, uploadDocumentFileCTR);

// Mixed upload (different fields)
router.post('/mixed', uploadMixed, async (req, res) => {
    const files = req.files as any;
    res.json({
        success: true,
        data: files
    });
});

// Delete file
router.delete('/:public_id', deleteFileCTR);

export default router;