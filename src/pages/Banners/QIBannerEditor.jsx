import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import { ENDPOINTS } from '../../config/api';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import '../Products/QIProductEditor.css';

const QIBannerEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        image: {
            url: '',
            alt: '',
            width: 1920,
            height: 600
        },
        link: {
            url: '',
            openInNewTab: false
        },
        placement: 'homepage-hero',
        active: true,
        startDate: '',
        endDate: '',
        sortOrder: 0,
        overlay: {
            title: '',
            subtitle: '',
            buttonText: '',
            textColor: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
    });

    // Load banner if editing
    useEffect(() => {
        if (isEditMode) {
            const fetchBanner = async () => {
                try {
                    setLoading(true);
                    const response = await fetch(`${ENDPOINTS.BANNERS}/${id}`);
                    const data = await response.json();

                    if (data.success) {
                        setFormData({
                            ...data.data,
                            image: data.data.image || { url: '', alt: '', width: 1920, height: 600 },
                            link: data.data.link || { url: '', openInNewTab: false },
                            overlay: data.data.overlay || { title: '', subtitle: '', buttonText: '', textColor: '#ffffff', backgroundColor: 'rgba(0, 0, 0, 0.5)' }
                        });
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching banner:', error);
                    setLoading(false);
                }
            };

            fetchBanner();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            image: {
                ...prev.image,
                [field]: value
            }
        }));
    };

    const handleLinkChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            link: {
                ...prev.link,
                [field]: value
            }
        }));
    };

    const handleOverlayChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            overlay: {
                ...prev.overlay,
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const url = isEditMode
                ? `${ENDPOINTS.BANNERS}/${id}`
                : ENDPOINTS.BANNERS;

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save banner');
            }

            alert(isEditMode ? 'Banner actualizado' : 'Banner creado');
            navigate('/banners/todos');
        } catch (error) {
            console.error('Error saving banner:', error);
            alert('Error al guardar el banner');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este banner?')) {
            return;
        }

        try {
            const response = await fetch(`${ENDPOINTS.BANNERS}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete banner');
            }

            alert('Banner eliminado');
            navigate('/banners/todos');
        } catch (error) {
            console.error('Error deleting banner:', error);
            alert('Error al eliminar el banner');
        }
    };

    if (loading) {
        return <div className="qi-editor-loading">Cargando banner...</div>;
    }

    return (
        <div className="qi-editor">
            <div className="qi-editor-header">
                <h1>{isEditMode ? 'Editar Banner' : 'Crear Banner'}</h1>
                <div className="qi-editor-actions">
                    <button onClick={() => navigate('/banners/todos')} className="qi-btn-secondary">
                        <FaTimes /> Cancelar
                    </button>
                    {isEditMode && (
                        <button onClick={handleDelete} className="qi-btn-danger">
                            <FaTrash /> Eliminar
                        </button>
                    )}
                    <button onClick={handleSave} className="qi-btn-primary" disabled={saving}>
                        <FaSave /> {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>

            <div className="qi-editor-content">
                <section className="qi-editor-section">
                    <h2>Información Básica</h2>

                    <div className="qi-form-group">
                        <label>Título *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Nombre del banner"
                            required
                        />
                    </div>

                    <div className="qi-form-row">
                        <div className="qi-form-group">
                            <label>Ubicación</label>
                            <select name="placement" value={formData.placement} onChange={handleChange}>
                                <option value="homepage-hero">Homepage Hero</option>
                                <option value="homepage-secondary">Homepage Secondary</option>
                                <option value="category-top">Category Top</option>
                                <option value="product-sidebar">Product Sidebar</option>
                            </select>
                        </div>

                        <div className="qi-form-group">
                            <label>Orden</label>
                            <input
                                type="number"
                                name="sortOrder"
                                value={formData.sortOrder}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="qi-form-row">
                        <div className="qi-form-group">
                            <label>Fecha Inicio</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="qi-form-group">
                            <label>Fecha Fin</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="qi-form-group">
                        <label className="qi-checkbox">
                            <input
                                type="checkbox"
                                name="active"
                                checked={formData.active}
                                onChange={handleChange}
                            />
                            <span>Banner activo</span>
                        </label>
                    </div>
                </section>

                <section className="qi-editor-section">
                    <h2>Imagen</h2>

                    <div className="qi-form-group">
                        <label>Subir Imagen *</label>
                        <ImageUpload
                            currentImageUrl={formData.image.url}
                            onImageUploaded={(url) => handleImageChange('url', url)}
                            storagePath="qi/banners"
                            accept="image/*"
                        />
                    </div>

                    <div className="qi-form-group">
                        <label>Alt Text</label>
                        <input
                            type="text"
                            value={formData.image.alt}
                            onChange={(e) => handleImageChange('alt', e.target.value)}
                            placeholder="Descripción de la imagen"
                        />
                    </div>

                    <div className="qi-form-group">
                        <label>URL de Imagen (opcional - se genera automáticamente)</label>
                        <input
                            type="url"
                            value={formData.image.url}
                            onChange={(e) => handleImageChange('url', e.target.value)}
                            placeholder="https://ejemplo.com/banner.jpg"
                            style={{ background: '#f3f4f6' }}
                        />
                        <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            Puedes pegar una URL externa si lo prefieres
                        </small>
                    </div>
                </section>

                <section className="qi-editor-section">
                    <h2>Enlace</h2>

                    <div className="qi-form-group">
                        <label>URL del Enlace</label>
                        <input
                            type="url"
                            value={formData.link.url}
                            onChange={(e) => handleLinkChange('url', e.target.value)}
                            placeholder="https://ejemplo.com/pagina"
                        />
                    </div>

                    <div className="qi-form-group">
                        <label className="qi-checkbox">
                            <input
                                type="checkbox"
                                checked={formData.link.openInNewTab}
                                onChange={(e) => handleLinkChange('openInNewTab', e.target.checked)}
                            />
                            <span>Abrir en nueva pestaña</span>
                        </label>
                    </div>
                </section>

                <section className="qi-editor-section">
                    <h2>Overlay de Texto (Opcional)</h2>

                    <div className="qi-form-group">
                        <label>Título del Overlay</label>
                        <input
                            type="text"
                            value={formData.overlay.title}
                            onChange={(e) => handleOverlayChange('title', e.target.value)}
                            placeholder="Título principal"
                        />
                    </div>

                    <div className="qi-form-group">
                        <label>Subtítulo</label>
                        <input
                            type="text"
                            value={formData.overlay.subtitle}
                            onChange={(e) => handleOverlayChange('subtitle', e.target.value)}
                            placeholder="Texto secundario"
                        />
                    </div>

                    <div className="qi-form-group">
                        <label>Texto del Botón</label>
                        <input
                            type="text"
                            value={formData.overlay.buttonText}
                            onChange={(e) => handleOverlayChange('buttonText', e.target.value)}
                            placeholder="Ver más"
                        />
                    </div>

                    <div className="qi-form-row">
                        <div className="qi-form-group">
                            <label>Color del Texto</label>
                            <input
                                type="color"
                                value={formData.overlay.textColor}
                                onChange={(e) => handleOverlayChange('textColor', e.target.value)}
                            />
                        </div>

                        <div className="qi-form-group">
                            <label>Color de Fondo</label>
                            <input
                                type="text"
                                value={formData.overlay.backgroundColor}
                                onChange={(e) => handleOverlayChange('backgroundColor', e.target.value)}
                                placeholder="rgba(0, 0, 0, 0.5)"
                            />
                        </div>
                    </div>
                </section>

                {isEditMode && (
                    <section className="qi-editor-section">
                        <h2>Estadísticas</h2>
                        <div className="qi-form-row">
                            <div className="qi-form-group">
                                <label>Impresiones</label>
                                <input
                                    type="text"
                                    value={formData.impressions || 0}
                                    disabled
                                    style={{ background: '#f3f4f6' }}
                                />
                            </div>
                            <div className="qi-form-group">
                                <label>Clics</label>
                                <input
                                    type="text"
                                    value={formData.clicks || 0}
                                    disabled
                                    style={{ background: '#f3f4f6' }}
                                />
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default QIBannerEditor;
