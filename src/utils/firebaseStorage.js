import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '../firebase/firebase';

const storage = getStorage(app);

/**
 * Upload an image to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} path - The storage path (e.g., 'products/product-name.jpg')
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<{url: string, path: string}>} - Download URL and storage path
 */
export const uploadImage = async (file, path, onProgress = null) => {
    try {
        if (!file) {
            throw new Error('No file provided');
        }

        if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image');
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('Image must be less than 5MB');
        }

        const storageRef = ref(storage, path);

        const uploadTask = await uploadBytes(storageRef, file);

        if (onProgress) {
            onProgress(100);
        }

        const downloadURL = await getDownloadURL(uploadTask.ref);

        return {
            url: downloadURL,
            path: path,
            name: file.name,
            size: file.size,
            type: file.type
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

/**
 * Delete an image from Firebase Storage
 * @param {string} path - The storage path to delete
 * @returns {Promise<void>}
 */
export const deleteImage = async (path) => {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
};

/**
 * Generate a unique filename for an image
 * @param {string} productName - The product name
 * @param {string} originalFilename - Original file name
 * @param {string} type - 'hero' or 'gallery'
 * @returns {string} - Unique filename
 */
export const generateImagePath = (productName, originalFilename, type = 'hero') => {
    const timestamp = Date.now();
    const sanitizedName = productName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const extension = originalFilename.split('.').pop();

    return `products/${sanitizedName}/${type}-${timestamp}.${extension}`;
};

/**
 * Get image dimensions from a File object
 * @param {File} file - The image file
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
                width: img.width,
                height: img.height
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
};
