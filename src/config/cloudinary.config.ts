// src/config/cloudinary.config.ts
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { ENV } from './env.config';
import { getSafeName } from '../utils/sanitizer.utils';

// Configure Cloudinary
cloudinary.config({
    cloud_name: ENV.CLOUDINARY.NAME,
    api_key: ENV.CLOUDINARY.KEY,
    api_secret: ENV.CLOUDINARY.SECRET,
});

// ==================== STORAGE CONFIGURATIONS ====================

// Storage for images
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'bunyeni-fc/images',
            format: 'jpg', // Convert all images to jpg
            public_id: `${Date.now()}-${getSafeName(file.originalname.split('.')[0])}`,
            transformation: [
                { width: 1000, crop: 'limit', }, // Resize large images
                { quality: 'auto', } // Auto-optimize quality
            ],
        };
    },
});

// Storage for videos
const videoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'bunyeni-fc/videos',
            resource_type: 'video',
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
            chunk_size: 6000000, // For large videos (6MB chunks)
        };
    },
});

// Storage for documents (PDF, etc)
const documentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'bunyeni-fc/documents',
            resource_type: 'raw',
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
            format: file.originalname.split('.').pop(),
        };
    },
});

// ==================== FILE FILTERS ====================

const imageFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed!'), false);
    }
};

const videoFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only videos are allowed!'), false);
    }
};

const documentFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only documents are allowed!'), false);
    }
};

// ==================== MULTER UPLOADERS ====================

// For single image upload
export const uploadSingleImage = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: imageFilter
}).single('image');

// For multiple images (gallery)
export const uploadMultipleImages = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
    fileFilter: imageFilter
}).array('images', 10); // Max 10 images

// For video upload
export const uploadVideo = multer({
    storage: videoStorage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: videoFilter
}).single('video');

// For document upload
export const uploadDocument = multer({
    storage: documentStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: documentFilter
}).single('document');

// For mixed uploads (different fields)
export const uploadMixed = multer({
    storage: imageStorage, // Default storage
    limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
    { name: 'video', maxCount: 1 }
]);

// Export cloudinary instance for direct use
export { cloudinary };