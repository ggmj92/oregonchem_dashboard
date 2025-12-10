import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import { ENDPOINTS } from '../../config/api';
import '../products/QIProductEditor.css';

const QICategoryEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image: {
            url: '',
            alt: '',
            width: 1024,
            height: 1024
        },
        parentId: null
    });

    // Load category if editing
    useEffect(() => {
        if (isEditMode) {
            const fetchCategory = async () => {
                try {
                    setLoading(true);
                    const response = await fetch(`${ENDPOINTS.CATEGORIES}/${id}`);
                    const data = await response.json();

                    if (data.success) {
                        setFormData({
                            ...data.data,
                            image: data.data.image || { url: '', alt: '', width: 1024, height: 1024 }
                        });
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching category:', error);
                    setLoading(false);
                }
            };

            fetchCategory();
        }
    }, [id, isEditMode]);

    // Auto-generate slug from name
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'name') {
            setFormData(prev => ({
                ...prev,
                name: value,
                slug: generateSlug(value)
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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

    const handleSave = async () => {
        try {
            setSaving(true);

            const url = isEditMode
                ? `${ENDPOINTS.CATEGORIES}/${id}`
                : ENDPOINTS.CATEGORIES;

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save category');
            }

            alert(isEditMode ? 'Categoría actualizada' : 'Categoría creada');
            navigate('/categorias/todas');
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Error al guardar la categoría');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
            return;
        }

        try {
            const response = await fetch(`${ENDPOINTS.CATEGORIES}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete category');
            }

            alert('Categoría eliminada');
            navigate('/categorias/todas');
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Error al eliminar la categoría');
        }
    };

    if (loading) {
        return <div className="qi-editor-loading">Cargando categoría...</div>;
    }

    return (
        <div className="qi-editor">
            <div className="qi-editor-header">
                <h1>{isEditMode ? 'Editar Categoría' : 'Crear Categoría'}</h1>
                <div className="qi-editor-actions">
                    <button onClick={() => navigate('/categorias/todas')} className="qi-btn-secondary">
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
                        <label>Nombre *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nombre de la categoría"
                            required
                        />
                    </div>

                    <div className="qi-form-group">
                        <label>Slug</label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="url-amigable"
                        />
                    </div>

                    <div className="qi-form-group">
                        <label>Descripción</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Descripción de la categoría"
                        />
                    </div>
                </section>

                <section className="qi-editor-section">
                    <h2>Imagen</h2>

                    <div className="qi-form-group">
                        <label>URL de Imagen</label>
                        <input
                            type="url"
                            value={formData.image.url}
                            onChange={(e) => handleImageChange('url', e.target.value)}
                            placeholder="/images/categories/categoria.png"
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

                    {formData.image.url && (
                        <div className="qi-form-group">
                            <label>Vista Previa</label>
                            <div style={{ maxWidth: '300px' }}>
                                <img
                                    src={formData.image.url}
                                    alt={formData.image.alt || formData.name}
                                    style={{ width: '100%', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                                />
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default QICategoryEditor;
