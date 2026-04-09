// src/utils/cloudinary.helper.ts
import { Request } from 'express';
import { cloudinary } from '../config/cloudinary.config';
import { ICloudinaryFile } from '../types/file.interface';

export const getOptimizedUrl = (publicId: string, options?: any) => {
    return cloudinary.url(publicId, {
        quality: 'auto',
        fetch_format: 'auto',
        ...options
    });
};
interface IThumbnailOptions {
    resourceType: 'image' | 'video';
    width?: number;
    height?: number;
    crop?: string;
}
/**
 * Generate an optimized Cloudinary thumbnail URL for an image or video.
 *
 * @param publicId - The Cloudinary public ID of the media asset.
 * @param options - Options for generating the thumbnail.
 * @param options.resourceType - The Cloudinary resource type (`image` | `video` | etc.).
 * @param options.width - Desired width in pixels (default: 400).
 * @param options.height - Desired height in pixels (default: 225).
 * @param options.crop - Crop mode for the transformation (default: "fill").
 *
 * For video resources, the URL includes `start_offset: '4'` to get a frame from 4 seconds.
 * For all resources, `quality: 'auto'` is applied.
 *
 * @returns The generated Cloudinary URL for the optimized thumbnail.
 */
export const getOptimizedThumbnail = (publicId: string, options: IThumbnailOptions) => {
    const { resourceType, width = 400, height = 225, crop = "fill" } = options

    if (resourceType === 'video') {
        return cloudinary.url(publicId, {
            resource_type: 'video',
            start_offset: '4',
            width,
            height,
            crop,
            quality: 'auto',
            format: 'jpg'
        });
    }

    return cloudinary.url(publicId, {
        resource_type: resourceType,
        width,
        height,
        crop,
        quality: 'auto', 
        format: 'jpg'
    });
};

export const getThumbnailUrl = (publicId: string, width = 400, height = 320) => {
    return cloudinary.url(publicId, {
        width,
        height,
        crop: 'fill',
        quality: 'auto',
        format: 'jpg'
    });
};

export const getVideoThumbnail = (publicId: string, timestamp = '4') => {
    return cloudinary.url(publicId, {
        resource_type: 'video',
        start_offset: timestamp,
        width: 640,
        quality: 'auto', format: 'jpg'
    });
};

export const getDefaultCldFolder = (req: Request) => {
    // Determine folder based on route or file type
    let folder = 'bunyeni-fc';

    // Customize folder based on request path
    if (req.baseUrl.includes('players')) {
        folder = 'bunyeni-fc/players';
    } else if (req.baseUrl.includes('news')) {
        folder = 'bunyeni-fc/news';
    } else if (req.baseUrl.includes('matches')) {
        folder = 'bunyeni-fc/matches';
    } else if (req.baseUrl.includes('sponsors')) {
        folder = 'bunyeni-fc/sponsors';
    } else if (req.baseUrl.includes('staff')) {
        folder = 'bunyeni-fc/staff';
    }

    return folder
}


export const formatCloudinaryResponse = (file: any): ICloudinaryFile => {
    // If it's already a Cloudinary file (from CloudinaryStorage)
    if (file.secure_url || file.public_id) {
        return {
            secure_url: file.secure_url || file.path,
            url: file.path || file.url,
            thumbnail_url: file.thumbnail_url || getVideoThumbnail(file.public_id),
            public_id: file.public_id || file.filename,
            resource_type: file.resource_type || getResourceType(file.mimetype),
            format: file.format || getFileFormat(file.originalname),
            bytes: file.bytes || file.size,
            type: file.type || 'upload',
            original_filename: file.original_filename || file.originalname,
            width: file.width,
            height: file.height,
            duration: file.duration
        };
    }

    // If it's a Multer file (from local storage)
    return {
        secure_url: file.path, // Local path
        url: file.path,
        public_id: file.filename,
        resource_type: getResourceType(file.mimetype),
        format: getFileFormat(file.originalname),
        bytes: file.size,
        type: 'upload',
        original_filename: file.originalname,
        thumbnail_url: getResourceType(file.mimetype) == 'video' ? getVideoThumbnail(file.filename) : getThumbnailUrl(file.filename),
    };
};

// Helper functions
const getResourceType = (mimetype: string): "image" | "video" | "raw" => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    return 'raw';
};

const getFileFormat = (filename: string): string => {
    return filename.split('.').pop() || 'unknown';
};


