import { api } from '@/lib/api-client';

interface UploadResponse {
    data: {
        url: string;
        key: string;
    };
}

export const mediaService = {
    /**
     * Upload a file to R2 storage via backend
     */
    async uploadFile(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/media/upload`,
            {
                method: 'POST',
                body: formData,
                credentials: 'include',
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Upload failed' }));
            throw new Error(error.message);
        }

        const data: UploadResponse = await response.json();
        return data.data.url;
    },

    /**
     * Upload image and return URL for editor insertion
     */
    async uploadImage(file: File): Promise<string> {
        // Validate image type
        if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image');
        }

        // Validate size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            throw new Error('Image must be less than 10MB');
        }

        return this.uploadFile(file);
    },

    /**
     * Delete a file from R2 storage
     */
    async deleteFile(key: string): Promise<void> {
        await api.delete(`/media/${key}`);
    },
};
