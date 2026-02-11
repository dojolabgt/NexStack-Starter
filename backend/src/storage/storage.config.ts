import { join } from 'path';

/**
 * Storage configuration
 * Centralized settings for file uploads and storage
 */
export const storageConfig = {
    // Base upload directory (relative to project root)
    uploadDir: join(process.cwd(), 'uploads'),

    // Maximum file size in bytes (default: 5MB)
    maxFileSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10),

    // Allowed image MIME types
    allowedImageTypes: (
        process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,webp,gif'
    )
        .split(',')
        .map((type) => type.trim()),

    // Storage provider type
    storageType: process.env.STORAGE_TYPE || 'local',

    // Folder names for different upload types
    folders: {
        profileImages: 'profile-images',
        documents: 'documents',
        temp: 'temp',
        appAssets: 'app-assets',
    },
};
