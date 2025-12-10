import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaTrash, FaPlus, FaRobot } from 'react-icons/fa';
import { ENDPOINTS } from '../../config/api';
import './QIProductEditor.css';

const QIProductEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    // Form state
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [presentations, setPresentations] = useState([]);

    // Product data
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        sku: '',
        status: 'draft',
        featured: false,
        categoryIds: [],
        presentationIds: [],
        relatedProductIds: [],
        tags: [],
        description_html: '',
        description_text: '',
        short_html: '',
        short_text: '',
        seo: {
            title: '',
            description: '',
            keywords: []
        },
        physicalState: 'unknown',
        media: {
            hero: { url: '', alt: '' },
            gallery: []
        }
    });

    // Tag input
    const [tagInput, setTagInput] = useState('');
    const [keywordInput, setKeywordInput] = useState('');

    // Load categories and presentations
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, presentationsRes] = await Promise.all([
                    fetch(ENDPOINTS.CATEGORIES),
                    fetch(ENDPOINTS.PRESENTATIONS)
                ]);

                const categoriesData = await categoriesRes.json();
                const presentationsData = await presentationsRes.json();

                setCategories(categoriesData.data || []);
                setPresentations(presentationsData.data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // Load product if editing
    useEffect(() => {
        if (isEditMode) {
            const fetchProduct = async () => {
                try {
                    setLoading(true);
                    const response = await fetch(`${ENDPOINTS.PRODUCTS}/${id}`);
                    const data = await response.json();

                    if (data.success) {
                        setFormData({
                            ...data.data,
                            seo: data.data.seo || { title: '', description: '', keywords: [] },
                            media: data.data.media || { hero: { url: '', alt: '' }, gallery: [] }
                        });
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching product:', error);
                    setLoading(false);
                }
            };

            fetchProduct();
        }
    }, [id, isEditMode]);

    // Auto-generate slug from title
    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'title') {
            setFormData(prev => ({
                ...prev,
                title: value,
                slug: generateSlug(value)
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handle nested changes (seo, media)
    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    // Handle category selection
    const handleCategoryToggle = (categoryId) => {
        setFormData(prev => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(categoryId)
                ? prev.categoryIds.filter(id => id !== categoryId)
                : [...prev.categoryIds, categoryId]
        }));
    };

    // Handle presentation selection
    const handlePresentationToggle = (presentationId) => {
        setFormData(prev => ({
            ...prev,
            presentationIds: prev.presentationIds.includes(presentationId)
                ? prev.presentationIds.filter(id => id !== presentationId)
                : [...prev.presentationIds, presentationId]
        }));
    };

    // Handle tags
    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    // Handle keywords
    const handleAddKeyword = () => {
        if (keywordInput.trim() && !formData.seo.keywords.includes(keywordInput.trim())) {
            setFormData(prev => ({
                ...prev,
                seo: {
                    ...prev.seo,
                    keywords: [...prev.seo.keywords, keywordInput.trim()]
                }
            }));
            setKeywordInput('');
        }
    };

    const handleRemoveKeyword = (keyword) => {
        setFormData(prev => ({
            ...prev,
            seo: {
                ...prev.seo,
                keywords: prev.seo.keywords.filter(k => k !== keyword)
            }
        }));
    };

    // Save product
    const handleSave = async () => {
        try {
            setSaving(true);

            const url = isEditMode
                ? `${ENDPOINTS.PRODUCTS}/${id}`
                : ENDPOINTS.PRODUCTS;

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save product');
            }

            alert(isEditMode ? 'Producto actualizado' : 'Producto creado');
            navigate('/productos');
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error al guardar el producto');
        } finally {
            setSaving(false);
        }
    };

    // Delete product
    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            return;
        }

        try {
            const response = await fetch(`${ENDPOINTS.PRODUCTS}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            alert('Producto eliminado');
            navigate('/productos');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error al eliminar el producto');
        }
    };

    if (loading) {
        return <div className="qi-editor-loading">Cargando producto...</div>;
    }

    return (
        <div className="qi-editor">
            <div className="qi-editor-header">
                <h1>{isEditMode ? 'Editar Producto' : 'Crear Producto'}</h1>
                <div className="qi-editor-actions">
                    <button onClick={() => navigate('/productos')} className="qi-btn-secondary">
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
                {/* Basic Info */}
                <section className="qi-editor-section">
                    <h2>Información Básica</h2>

                    <div className="qi-form-group">
                        <label>Título *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Nombre del producto"
                            required
                        />
                    </div>

                    <div className="qi-form-row">
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
                            <label>SKU</label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                placeholder="SKU-123"
                            />
                        </div>
                    </div>

                    <div className="qi-form-row">
                        <div className="qi-form-group">
                            <label>Estado</label>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="draft">Borrador</option>
                                <option value="published">Publicado</option>
                            </select>
                        </div>

                        <div className="qi-form-group">
                            <label>Estado Físico</label>
                            <select name="physicalState" value={formData.physicalState} onChange={handleChange}>
                                <option value="unknown">Desconocido</option>
                                <option value="liquido">Líquido</option>
                                <option value="solido">Sólido</option>
                                <option value="polvo">Polvo</option>
                                <option value="granular">Granular</option>
                                <option value="pasta">Pasta</option>
                                <option value="gas">Gas</option>
                            </select>
                        </div>
                    </div>

                    <div className="qi-form-group">
                        <label className="qi-checkbox">
                            <input
                                type="checkbox"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleChange}
                            />
                            <span>Producto destacado</span>
                        </label>
                    </div>
                </section>

                {/* Descriptions */}
                <section className="qi-editor-section">
                    <h2>Descripciones</h2>

                    <div className="qi-form-group">
                        <label>Descripción Corta (Texto)</label>
                        <textarea
                            name="short_text"
                            value={formData.short_text}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Descripción breve del producto"
                        />
                    </div>

                    <div className="qi-form-group">
                        <label>Descripción Corta (HTML)</label>
                        <textarea
                            name="short_html"
                            value={formData.short_html}
                            onChange={handleChange}
                            rows="4"
                            placeholder="<p>Descripción con HTML</p>"
                        />
                    </div>

                    <div className="qi-form-group">
                        <label>Descripción Completa (Texto)</label>
                        <textarea
                            name="description_text"
                            value={formData.description_text}
                            onChange={handleChange}
                            rows="6"
                            placeholder="Descripción detallada del producto"
                        />
                    </div>

                    <div className="qi-form-group">
                        <label>Descripción Completa (HTML)</label>
                        <textarea
                            name="description_html"
                            value={formData.description_html}
                            onChange={handleChange}
                            rows="8"
                            placeholder="<p>Descripción detallada con HTML</p>"
                        />
                    </div>
                </section>

                {/* Categories */}
                <section className="qi-editor-section">
                    <h2>Categorías</h2>
                    <div className="qi-checkbox-grid">
                        {categories.map(category => (
                            <label key={category._id} className="qi-checkbox">
                                <input
                                    type="checkbox"
                                    checked={formData.categoryIds.includes(category._id)}
                                    onChange={() => handleCategoryToggle(category._id)}
                                />
                                <span>{category.name}</span>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Presentations */}
                <section className="qi-editor-section">
                    <h2>Presentaciones</h2>
                    <div className="qi-checkbox-grid">
                        {presentations.map(presentation => (
                            <label key={presentation._id} className="qi-checkbox">
                                <input
                                    type="checkbox"
                                    checked={formData.presentationIds.includes(presentation._id)}
                                    onChange={() => handlePresentationToggle(presentation._id)}
                                />
                                <span>{presentation.pretty}</span>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Tags */}
                <section className="qi-editor-section">
                    <h2>Etiquetas</h2>
                    <div className="qi-tags-input">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            placeholder="Agregar etiqueta..."
                        />
                        <button onClick={handleAddTag} className="qi-btn-small">
                            <FaPlus /> Agregar
                        </button>
                    </div>
                    <div className="qi-tags-list">
                        {formData.tags.map(tag => (
                            <span key={tag} className="qi-tag">
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)}>×</button>
                            </span>
                        ))}
                    </div>
                </section>

                {/* SEO */}
                <section className="qi-editor-section">
                    <h2>SEO</h2>

                    <div className="qi-form-group">
                        <label>Título SEO</label>
                        <input
                            type="text"
                            value={formData.seo.title}
                            onChange={(e) => handleNestedChange('seo', 'title', e.target.value)}
                            placeholder="Título optimizado para motores de búsqueda"
                        />
                    </div>

                    <div className="qi-form-group">
                        <label>Descripción SEO</label>
                        <textarea
                            value={formData.seo.description}
                            onChange={(e) => handleNestedChange('seo', 'description', e.target.value)}
                            rows="3"
                            placeholder="Descripción meta para motores de búsqueda"
                        />
                    </div>

                    <div className="qi-form-group">
                        <label>Palabras Clave</label>
                        <div className="qi-tags-input">
                            <input
                                type="text"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                                placeholder="Agregar palabra clave..."
                            />
                            <button onClick={handleAddKeyword} className="qi-btn-small">
                                <FaPlus /> Agregar
                            </button>
                        </div>
                        <div className="qi-tags-list">
                            {formData.seo.keywords.map(keyword => (
                                <span key={keyword} className="qi-tag">
                                    {keyword}
                                    <button onClick={() => handleRemoveKeyword(keyword)}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Images */}
                <section className="qi-editor-section">
                    <h2>Imágenes</h2>
                    <p className="qi-note">
                        <strong>Nota:</strong> Las imágenes de presentación se muestran automáticamente.
                        Estas imágenes legacy son opcionales.
                    </p>

                    <div className="qi-form-group">
                        <label>URL Imagen Principal</label>
                        <input
                            type="url"
                            value={formData.media.hero.url}
                            onChange={(e) => handleNestedChange('media', 'hero', {
                                ...formData.media.hero,
                                url: e.target.value
                            })}
                            placeholder="https://ejemplo.com/imagen.jpg"
                        />
                    </div>

                    <div className="qi-form-group">
                        <label>Alt Text Imagen Principal</label>
                        <input
                            type="text"
                            value={formData.media.hero.alt}
                            onChange={(e) => handleNestedChange('media', 'hero', {
                                ...formData.media.hero,
                                alt: e.target.value
                            })}
                            placeholder="Descripción de la imagen"
                        />
                    </div>
                </section>

                {/* AI Content Display */}
                {isEditMode && formData.ai && (
                    <section className="qi-editor-section qi-ai-section">
                        <h2><FaRobot /> Contenido Generado por IA</h2>

                        {formData.ai.description && (
                            <div className="qi-ai-content">
                                <h4>Descripción IA</h4>
                                <p>{formData.ai.description}</p>
                            </div>
                        )}

                        {formData.ai.shortDescription && (
                            <div className="qi-ai-content">
                                <h4>Descripción Corta IA</h4>
                                <p>{formData.ai.shortDescription}</p>
                            </div>
                        )}

                        {formData.ai.seoTitle && (
                            <div className="qi-ai-content">
                                <h4>Título SEO IA</h4>
                                <p>{formData.ai.seoTitle}</p>
                            </div>
                        )}

                        {formData.ai.physicalStateReasoning && (
                            <div className="qi-ai-content">
                                <h4>Razonamiento Estado Físico</h4>
                                <p>{formData.ai.physicalStateReasoning}</p>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
};

export default QIProductEditor;
