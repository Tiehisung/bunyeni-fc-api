// src/utils/cloudinary.helper.ts
import { cloudinary } from '../config/cloudinary.config';

export const getOptimizedUrl = (publicId: string, options?: any) => {
    return cloudinary.url(publicId, {
        quality: 'auto',
        fetch_format: 'auto',
        ...options
    });
};

export const getThumbnailUrl = (publicId: string, width = 200, height = 200) => {
    return cloudinary.url(publicId, {
        width,
        height,
        crop: 'fill',
        quality: 'auto'
    });
};

export const getVideoThumbnail = (publicId: string, timestamp = '0') => {
    return cloudinary.url(publicId, {
        resource_type: 'video',
        start_offset: timestamp,
        width: 640,
        quality: 'auto'
    });
};