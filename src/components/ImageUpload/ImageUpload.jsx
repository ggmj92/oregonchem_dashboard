import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { FaUpload, FaTrash, FaSpinner } from 'react-icons/fa';
import './ImageUpload.css';

const ImageUpload = ({ currentImageUrl, onImageUploaded, storagePath = 'banners', accept = 'image/*' }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo es demasiado grande. Máximo 5MB');
            return;
        }

        try {
            setUploading(true);
            setProgress(0);

            // Create unique filename
            const timestamp = Date.now();
            const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const storageRef = ref(storage, `${storagePath}/${filename}`);

            // Upload file
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(Math.round(progress));
                },
                (error) => {
                    console.error('Upload error:', error);
                    alert('Error al subir la imagen: ' + error.message);
                    setUploading(false);
                },
                async () => {
                    // Upload completed successfully
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setPreviewUrl(downloadURL);
                    setUploading(false);
                    setProgress(0);

                    // Callback with the URL
                    if (onImageUploaded) {
                        onImageUploaded(downloadURL);
                    }
                }
            );
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al subir la imagen');
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl('');
        if (onImageUploaded) {
            onImageUploaded('');
        }
    };

    return (
        <div className="image-upload-container">
            {!previewUrl ? (
                <div className="image-upload-dropzone">
                    <input
                        type="file"
                        accept={accept}
                        onChange={handleFileSelect}
                        disabled={uploading}
                        id="image-upload-input"
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="image-upload-input" className="image-upload-label">
                        {uploading ? (
                            <div className="image-upload-uploading">
                                <FaSpinner className="spinner" />
                                <span>Subiendo... {progress}%</span>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <FaUpload size={32} />
                                <span>Click para subir imagen</span>
                                <small>PNG, JPG, WEBP (máx. 5MB)</small>
                            </>
                        )}
                    </label>
                </div>
            ) : (
                <div className="image-upload-preview">
                    <img src={previewUrl} alt="Preview" />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="image-upload-remove"
                        title="Eliminar imagen"
                    >
                        <FaTrash />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
