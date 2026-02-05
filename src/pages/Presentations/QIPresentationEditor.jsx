import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import { ENDPOINTS } from '../../config/api';
import '../Products/QIEditor.css';

const QIPresentationEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        qty: 1,
        unit: 'kg',
        pretty: '',
        sortOrder: 0,
        image: {
            url: '',
            alt: '',
            width: 512,
            height: 512
        }
    });

    // Load presentation if editing
    useEffect(() => {
        if (isEditMode) {
            const fetchPresentation = async () => {
                try {
                    setLoading(true);
                    const response = await fetch(`${ENDPOINTS.PRESENTATIONS}/${id}`);
                    const data = await response.json();

                    if (data.success) {
                        setFormData({
                            ...data.data,
                            image: data.data.image || { url: '', alt: '', width: 512, height: 512 }
                        });
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching presentation:', error);
                    setLoading(false);
                }
            };

            fetchPresentation();
        }
    }, [id, isEditMode]);

    // Auto-generate pretty name
    const generatePretty = (qty, unit) => {
        return `${qty}${unit}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'qty' || name === 'unit') {
            const newQty = name === 'qty' ? value : formData.qty;
            const newUnit = name === 'unit' ? value : formData.unit;

            setFormData(prev => ({
                ...prev,
                [name]: value,
                pretty: generatePretty(newQty, newUnit)
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
                ? `${ENDPOINTS.PRESENTATIONS}/${id}`
                : ENDPOINTS.PRESENTATIONS;

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save presentation');
            }

            alert(isEditMode ? 'Presentación actualizada' : 'Presentación creada');
            navigate('/presentaciones/todas');
        } catch (error) {
            console.error('Error saving presentation:', error);
            alert('Error al guardar la presentación');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta presentación?')) {
            return;
        }

        try {
            const response = await fetch(`${ENDPOINTS.PRESENTATIONS}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete presentation');
            }

            alert('Presentación eliminada');
            navigate('/presentaciones/todas');
        } catch (error) {
            console.error('Error deleting presentation:', error);
            alert('Error al eliminar la presentación');
        }
    };

    if (loading) {
        return <div className="qi-editor-loading">Cargando presentación...</div>;
    }

    return (
        <div className="qi-editor">
            <div className="qi-editor-header">
                <h1>{isEditMode ? 'Editar Presentación' : 'Crear Presentación'}</h1>
                <div className="qi-editor-actions">
                    <button onClick={() => navigate('/presentaciones/todas')} className="qi-btn-secondary">
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

                    <div className="qi-form-row">
                        <div className="qi-form-group">
                            <label>Cantidad *</label>
                            <input
                                type="number"
                                name="qty"
                                value={formData.qty}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="qi-form-group">
                            <label>Unidad *</label>
                            <select name="unit" value={formData.unit} onChange={handleChange}>
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                                <option value="L">L</option>
                                <option value="ml">ml</option>
                                <option value="gal">gal (galón)</option>
                                <option value="oz">oz</option>
                                <option value="lb">lb</option>
                                <option value="ton">ton</option>
                            </select>
                        </div>
                    </div>

                    <div className="qi-form-group">
                        <label>Nombre (Pretty)</label>
                        <input
                            type="text"
                            name="pretty"
                            value={formData.pretty}
                            onChange={handleChange}
                            placeholder="1kg, 5L, etc."
                        />
                    </div>

                    <div className="qi-form-group">
                        <label>Orden de Clasificación</label>
                        <input
                            type="number"
                            name="sortOrder"
                            value={formData.sortOrder}
                            onChange={handleChange}
                            min="0"
                        />
                        <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            Menor número aparece primero
                        </small>
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
                            placeholder="/images/presentations/1kg.png"
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
                            <div style={{ maxWidth: '200px' }}>
                                <img
                                    src={formData.image.url}
                                    alt={formData.image.alt || formData.pretty}
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

export default QIPresentationEditor;
