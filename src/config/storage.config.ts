import { registerAs } from '@nestjs/config';

/**
 * Storage Configuration (Cloudflare R2 / S3-compatible)
 */
export default registerAs('storage', () => ({
    // S3/R2 Configuration
    endpoint: process.env.S3_ENDPOINT || '',
    region: process.env.S3_REGION || 'auto',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    bucket: process.env.S3_BUCKET || 'media',

    // Public URL for accessing files
    publicUrl: process.env.S3_PUBLIC_URL || '',

    // Upload limits
    maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '10485760', 10), // 10MB default
    maxFiles: parseInt(process.env.UPLOAD_MAX_FILES || '10', 10),

    // Allowed file types
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    allowedDocumentTypes: ['application/pdf'],

    // Presigned URL expiry
    signedUrlExpiry: parseInt(process.env.S3_SIGNED_URL_EXPIRY || '3600', 10), // 1 hour default
}));
