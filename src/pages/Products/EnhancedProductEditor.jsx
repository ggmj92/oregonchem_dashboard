import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaTrash, FaRobot, FaEye, FaPlus, FaSpinner } from 'react-icons/fa';
import { ENDPOINTS } from '../../config/api';
import { generateProductContent, generateSEOContent } from '../../utils/aiService';
import { uploadImage, generateImagePath, getImageDimensions } from '../../utils/firebaseStorage';
import './EnhancedProductEditor.css';

const EnhancedProductEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [generatingSEO, setGeneratingSEO] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Data
    const [categories, setCategories] = useState([]);
    const [presentations, setPresentations] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        // Basic Information
        title: '',
        slug: '',
        sku: '',
        status: 'draft',
        physicalState: 'unknown',
        featured: false,
        fiscalizado: false,
        brand: '',

        // Descriptions
        short_text: '',
        short_html: '',
        description_text: '',
        description_html: '',

        // Taxonomy
        categoryIds: [],
        presentationIds: [],
        tags: [],

        // SEO
        seo: {
            title: '',
            description: '',
            keywords: []
        },

        // Images
        media: {
            hero: { url: '', alt: '', width: 0, height: 0 },
            gallery: []
        },

        // Related Products
        relatedProductIds: []
    });

    // UI state
    const [tagInput, setTagInput] = useState('');
    const [keywordInput, setKeywordInput] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showPresentationModal, setShowPresentationModal] = useState(false);
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

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

                // Fix relative image URLs to absolute URLs
                const API_BASE = import.meta.env.VITE_API_URL || 'https://oregonchem-backend.onrender.com';

                const categoriesWithAbsoluteUrls = (categoriesData.data || []).map(cat => ({
                    ...cat,
                    image: cat.image?.url ? {
                        ...cat.image,
                        url: cat.image.url.startsWith('http') ? cat.image.url : `${API_BASE}${cat.image.url}`
                    } : cat.image
                }));

                const presentationsWithAbsoluteUrls = (presentationsData.data || []).map(pres => ({
                    ...pres,
                    image: pres.image?.url ? {
                        ...pres.image,
                        url: pres.image.url.startsWith('http') ? pres.image.url : `${API_BASE}${pres.image.url}`
                    } : pres.image
                }));

                setCategories(categoriesWithAbsoluteUrls);
                setPresentations(presentationsWithAbsoluteUrls);
            } catch (error) {
                console.error('Error fetching data:', error);
                setErrors({ fetch: 'Error cargando categorías y presentaciones' });
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
                            media: data.data.media || { hero: { url: '', alt: '', width: 0, height: 0 }, gallery: [] }
                        });

                        if (data.data.media?.hero?.url) {
                            setImagePreview(data.data.media.hero.url);
                        }
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching product:', error);
                    setErrors({ fetch: 'Error cargando producto' });
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

    // AI Content Generation
    const handleGenerateContent = async () => {
        if (!formData.title) {
            setErrors({ ai: 'Por favor ingresa el nombre del producto primero' });
            return;
        }

        try {
            setGeneratingAI(true);
            setErrors({});

            const categoryNames = formData.categoryIds
                .map(id => categories.find(c => c._id === id)?.name)
                .filter(Boolean);

            const content = await generateProductContent(formData.title, categoryNames);

            setFormData(prev => ({
                ...prev,
                short_text: content.shortDescription,
                description_text: content.longDescription,
                seo: {
                    title: content.seoTitle,
                    description: content.seoDescription,
                    keywords: content.keywords
                }
            }));

            setGeneratingAI(false);
        } catch (error) {
            console.error('Error generating content:', error);
            setErrors({ ai: 'Error generando contenido con IA: ' + error.message });
            setGeneratingAI(false);
        }
    };

    // SEO Generation
    const handleGenerateSEO = async () => {
        if (!formData.title) {
            setErrors({ seo: 'Por favor ingresa el nombre del producto primero' });
            return;
        }

        try {
            setGeneratingSEO(true);
            setErrors({});

            const content = await generateSEOContent(formData.title, formData.short_text);

            setFormData(prev => ({
                ...prev,
                seo: {
                    title: content.seoTitle,
                    description: content.seoDescription,
                    keywords: content.keywords
                }
            }));

            setGeneratingSEO(false);
        } catch (error) {
            console.error('Error generating SEO:', error);
            setErrors({ seo: 'Error generando SEO con IA: ' + error.message });
            setGeneratingSEO(false);
        }
    };

    // Image Upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            setErrors({});

            // Get image dimensions
            const dimensions = await getImageDimensions(file);

            // Generate unique path
            const path = generateImagePath(formData.title || 'product', file.name, 'hero');

            // Upload to Firebase
            const result = await uploadImage(file, path, (progress) => {
                setUploadProgress(progress);
            });

            // Update form data
            setFormData(prev => ({
                ...prev,
                media: {
                    ...prev.media,
                    hero: {
                        url: result.url,
                        alt: formData.title,
                        width: dimensions.width,
                        height: dimensions.height
                    }
                }
            }));

            setImagePreview(result.url);
            setUploadingImage(false);
            setUploadProgress(0);
        } catch (error) {
            console.error('Error uploading image:', error);
            setErrors({ image: 'Error subiendo imagen: ' + error.message });
            setUploadingImage(false);
            setUploadProgress(0);
        }
    };

    // Validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title || formData.title.length < 3) {
            newErrors.title = 'El título debe tener al menos 3 caracteres';
        }

        if (!formData.slug) {
            newErrors.slug = 'El slug es requerido';
        }

        if (formData.categoryIds.length === 0) {
            newErrors.categories = 'Selecciona al menos una categoría';
        }

        if (formData.presentationIds.length === 0) {
            newErrors.presentations = 'Selecciona al menos una presentación';
        }

        if (formData.seo.title && formData.seo.title.length > 60) {
            newErrors.seoTitle = 'El título SEO debe tener máximo 60 caracteres';
        }

        if (formData.seo.description && formData.seo.description.length > 160) {
            newErrors.seoDescription = 'La descripción SEO debe tener máximo 160 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Save product
    const handleSave = async (publishImmediately = false) => {
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            const dataToSave = {
                ...formData,
                status: publishImmediately ? 'published' : formData.status
            };

            const url = isEditMode
                ? `${ENDPOINTS.PRODUCTS}/${id}`
                : ENDPOINTS.PRODUCTS;

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSave),
            });

            if (!response.ok) {
                throw new Error('Error guardando producto');
            }

            const result = await response.json();

            setSaving(false);
            setShowSaveConfirm(false);

            // Show success message
            alert(isEditMode ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');

            // Navigate to product list
            navigate('/productos');
        } catch (error) {
            console.error('Error saving product:', error);
            setErrors({ save: 'Error guardando producto: ' + error.message });
            setSaving(false);
        }
    };

    // Delete product
    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const response = await fetch(`${ENDPOINTS.PRODUCTS}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error eliminando producto');
            }

            alert('Producto eliminado exitosamente');
            navigate('/productos');
        } catch (error) {
            console.error('Error deleting product:', error);
            setErrors({ delete: 'Error eliminando producto: ' + error.message });
        }
    };

    if (loading) {
        return (
            <div className="epe-loading">
                <FaSpinner className="epe-spinner" />
                <p>Cargando producto...</p>
            </div>
        );
    }

    return (
        <div className="epe-container">
            {/* Header */}
            <div className="epe-header">
                <h1>{isEditMode ? 'Editar Producto' : 'Crear Producto'}</h1>
                <div className="epe-header-actions">
                    <button onClick={() => navigate('/productos')} className="epe-btn epe-btn-secondary">
                        <FaTimes /> Cancelar
                    </button>
                    <button onClick={() => setShowPreview(true)} className="epe-btn epe-btn-outline">
                        <FaEye /> Vista Previa
                    </button>
                    {isEditMode && (
                        <button onClick={handleDelete} className="epe-btn epe-btn-danger">
                            <FaTrash /> Eliminar
                        </button>
                    )}
                    <button
                        onClick={() => setShowSaveConfirm(true)}
                        className="epe-btn epe-btn-primary"
                        disabled={saving}
                    >
                        <FaSave /> {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>

            {/* Error Messages */}
            {Object.keys(errors).length > 0 && (
                <div className="epe-errors">
                    {Object.values(errors).map((error, index) => (
                        <div key={index} className="epe-error">{error}</div>
                    ))}
                </div>
            )}

            {/* Form Content */}
            <div className="epe-content">
                {/* 1. Basic Information */}
                <section className="epe-section">
                    <h2>Información Básica</h2>

                    <div className="epe-form-group">
                        <label htmlFor="title">Nombre del Producto *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Ej: Ácido Sulfúrico 98%"
                            className={errors.title ? 'epe-input-error' : ''}
                        />
                        {errors.title && <span className="epe-error-text">{errors.title}</span>}
                    </div>

                    <div className="epe-form-row">
                        <div className="epe-form-group">
                            <label htmlFor="slug">Slug</label>
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="acido-sulfurico-98"
                                className={errors.slug ? 'epe-input-error' : ''}
                            />
                            <small className="epe-helper-text">URL amigable (se genera automáticamente)</small>
                        </div>

                        <div className="epe-form-group">
                            <label htmlFor="sku">SKU</label>
                            <input
                                type="text"
                                id="sku"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                placeholder="SKU-123"
                            />
                            <small className="epe-helper-text">Código interno del producto</small>
                        </div>
                    </div>

                    <div className="epe-form-row">
                        <div className="epe-form-group">
                            <label htmlFor="status">Estado</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange}>
                                <option value="draft">Borrador</option>
                                <option value="published">Publicado</option>
                            </select>
                            <small className="epe-helper-text">Borrador = no visible en el sitio web</small>
                        </div>

                        <div className="epe-form-group">
                            <label htmlFor="physicalState">Estado Físico</label>
                            <select id="physicalState" name="physicalState" value={formData.physicalState} onChange={handleChange}>
                                <option value="unknown">Desconocido</option>
                                <option value="liquido">Líquido</option>
                                <option value="solido">Sólido</option>
                                <option value="polvo">Polvo</option>
                                <option value="granular">Granular</option>
                                <option value="pasta">Pasta</option>
                                <option value="gas">Gas</option>
                            </select>
                            <small className="epe-helper-text">Determina la imagen placeholder</small>
                        </div>
                    </div>

                    <div className="epe-form-row">
                        <div className="epe-form-group">
                            <label htmlFor="brand">Marca</label>
                            <input
                                type="text"
                                id="brand"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                placeholder="Ej: Diversey, Ecolab"
                            />
                            <small className="epe-helper-text">Marca del producto (opcional)</small>
                        </div>

                        <div className="epe-form-group">
                            <label className="epe-checkbox-label">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleChange}
                                />
                                <span>Producto Destacado</span>
                            </label>
                            <small className="epe-helper-text">Aparecerá en la sección destacados de la página principal</small>
                        </div>

                        <div className="epe-form-group">
                            <label className="epe-checkbox-label">
                                <input
                                    type="checkbox"
                                    name="fiscalizado"
                                    checked={formData.fiscalizado}
                                    onChange={handleChange}
                                />
                                <span>Producto Fiscalizado</span>
                            </label>
                            <small className="epe-helper-text">Producto controlado por el gobierno peruano</small>
                        </div>
                    </div>
                </section>

                {/* 2. Descriptions */}
                <section className="epe-section">
                    <div className="epe-section-header">
                        <h2>Descripciones</h2>
                        <button
                            onClick={handleGenerateContent}
                            className="epe-btn epe-btn-ai"
                            disabled={generatingAI || !formData.title}
                            type="button"
                        >
                            <FaRobot /> {generatingAI ? 'Generando...' : 'Generar con IA'}
                        </button>
                    </div>

                    <div className="epe-form-row">
                        <div className="epe-form-group">
                            <label htmlFor="short_text">Descripción Corta (Texto)</label>
                            <textarea
                                id="short_text"
                                name="short_text"
                                value={formData.short_text}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Resumen breve del producto (máx. 220 caracteres)"
                                maxLength="220"
                            />
                            <small className="epe-helper-text">
                                {formData.short_text.length}/220 caracteres
                            </small>
                        </div>

                        <div className="epe-form-group">
                            <label htmlFor="short_html">Descripción Corta (HTML)</label>
                            <textarea
                                id="short_html"
                                name="short_html"
                                value={formData.short_html}
                                onChange={handleChange}
                                rows="3"
                                placeholder="<p>Versión HTML (opcional)</p>"
                            />
                            <small className="epe-helper-text epe-text-muted">
                                Opcional - El frontend prefiere la versión texto
                            </small>
                        </div>
                    </div>

                    <div className="epe-form-row">
                        <div className="epe-form-group">
                            <label htmlFor="description_text">Descripción Completa (Texto)</label>
                            <textarea
                                id="description_text"
                                name="description_text"
                                value={formData.description_text}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Descripción detallada del producto"
                            />
                        </div>

                        <div className="epe-form-group">
                            <label htmlFor="description_html">Descripción Completa (HTML)</label>
                            <textarea
                                id="description_html"
                                name="description_html"
                                value={formData.description_html}
                                onChange={handleChange}
                                rows="6"
                                placeholder="<p>Versión HTML (opcional)</p>"
                            />
                            <small className="epe-helper-text epe-text-muted">
                                Opcional - El frontend prefiere la versión texto
                            </small>
                        </div>
                    </div>
                </section>

                {/* 3. Categories */}
                <section className="epe-section">
                    <div className="epe-section-header">
                        <h2>Categorías *</h2>
                        <button
                            onClick={() => setShowCategoryModal(true)}
                            className="epe-btn epe-btn-outline"
                            type="button"
                        >
                            <FaPlus /> Nueva Categoría
                        </button>
                    </div>

                    <div className="epe-checkbox-grid">
                        {categories.map(category => (
                            <label key={category._id} className="epe-checkbox-card">
                                <input
                                    type="checkbox"
                                    checked={formData.categoryIds.includes(category._id)}
                                    onChange={() => handleCategoryToggle(category._id)}
                                />
                                <div className="epe-checkbox-content">
                                    <span className="epe-checkbox-name">{category.name}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                    {errors.categories && <span className="epe-error-text">{errors.categories}</span>}
                </section>

                {/* 4. Presentations */}
                <section className="epe-section">
                    <div className="epe-section-header">
                        <h2>Presentaciones *</h2>
                        <button
                            onClick={() => setShowPresentationModal(true)}
                            className="epe-btn epe-btn-outline"
                            type="button"
                        >
                            <FaPlus /> Nueva Presentación
                        </button>
                    </div>

                    <div className="epe-checkbox-grid">
                        {presentations.map(presentation => (
                            <label key={presentation._id} className="epe-checkbox-card">
                                <input
                                    type="checkbox"
                                    checked={formData.presentationIds.includes(presentation._id)}
                                    onChange={() => handlePresentationToggle(presentation._id)}
                                />
                                <div className="epe-checkbox-content">
                                    <span className="epe-checkbox-name">{presentation.pretty}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                    {errors.presentations && <span className="epe-error-text">{errors.presentations}</span>}
                    <small className="epe-helper-text epe-mt-1">
                        Las imágenes de presentación se mostrarán en el frontend
                    </small>
                </section>

                {/* 5. Tags */}
                <section className="epe-section">
                    <h2>Etiquetas</h2>
                    <p className="epe-helper-text epe-mb-0">
                        Palabras clave para SEO y filtrado (ej: industrial, limpieza, químico)
                    </p>

                    <div className="epe-tags-input">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag();
                                }
                            }}
                            placeholder="Agregar etiqueta..."
                        />
                        <button onClick={handleAddTag} className="epe-btn epe-btn-outline" type="button">
                            <FaPlus /> Agregar
                        </button>
                    </div>

                    <div className="epe-tags-list">
                        {formData.tags.map(tag => (
                            <span key={tag} className="epe-tag">
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)} type="button">×</button>
                            </span>
                        ))}
                    </div>
                </section>

                {/* 6. SEO */}
                <section className="epe-section">
                    <div className="epe-section-header">
                        <h2>SEO (Opcional)</h2>
                        <button
                            onClick={handleGenerateSEO}
                            className="epe-btn epe-btn-ai"
                            disabled={generatingSEO || !formData.title}
                            type="button"
                        >
                            <FaRobot /> {generatingSEO ? 'Generando...' : 'Generar SEO'}
                        </button>
                    </div>

                    <div className="epe-form-group">
                        <label htmlFor="seo_title">Título SEO</label>
                        <input
                            type="text"
                            id="seo_title"
                            value={formData.seo.title}
                            onChange={(e) => handleNestedChange('seo', 'title', e.target.value)}
                            placeholder="Título optimizado para Google (máx. 60 caracteres)"
                            maxLength="60"
                            className={errors.seoTitle ? 'epe-input-error' : ''}
                        />
                        <small className="epe-helper-text" style={{ color: formData.seo.title.length > 60 ? '#dc2626' : '#6b7280' }}>
                            {formData.seo.title.length}/60 caracteres
                        </small>
                    </div>

                    <div className="epe-form-group">
                        <label htmlFor="seo_description">Descripción SEO</label>
                        <textarea
                            id="seo_description"
                            value={formData.seo.description}
                            onChange={(e) => handleNestedChange('seo', 'description', e.target.value)}
                            rows="3"
                            placeholder="Descripción meta para resultados de búsqueda (máx. 160 caracteres)"
                            maxLength="160"
                            className={errors.seoDescription ? 'epe-input-error' : ''}
                        />
                        <small className="epe-helper-text" style={{ color: formData.seo.description.length > 160 ? '#dc2626' : '#6b7280' }}>
                            {formData.seo.description.length}/160 caracteres
                        </small>
                    </div>

                    <div className="epe-form-group">
                        <label>Palabras Clave SEO</label>
                        <div className="epe-tags-input">
                            <input
                                type="text"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddKeyword();
                                    }
                                }}
                                placeholder="Agregar palabra clave..."
                            />
                            <button onClick={handleAddKeyword} className="epe-btn epe-btn-outline" type="button">
                                <FaPlus /> Agregar
                            </button>
                        </div>

                        <div className="epe-tags-list">
                            {formData.seo.keywords.map(keyword => (
                                <span key={keyword} className="epe-tag">
                                    {keyword}
                                    <button onClick={() => handleRemoveKeyword(keyword)} type="button">×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Google Preview */}
                    {(formData.seo.title || formData.seo.description) && (
                        <div className="epe-google-preview">
                            <h4>Vista Previa de Google</h4>
                            <div className="epe-google-result">
                                <div className="epe-google-title">
                                    {formData.seo.title || formData.title}
                                </div>
                                <div className="epe-google-url">
                                    https://quimicaindustrial.pe/products/{formData.slug}
                                </div>
                                <div className="epe-google-description">
                                    {formData.seo.description || formData.short_text}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* 7. Images */}
                <section className="epe-section">
                    <h2>Imágenes</h2>
                    <p className="epe-helper-text epe-mb-0">
                        Las imágenes de presentación se muestran primero. Estas imágenes son un respaldo.
                    </p>

                    <div className="epe-form-group epe-mt-2">
                        <label htmlFor="hero_image">Imagen Principal</label>
                        <div className="epe-image-upload">
                            <input
                                type="file"
                                id="hero_image"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="hero_image" className="epe-upload-area">
                                {uploadingImage ? (
                                    <div className="epe-upload-progress">
                                        <FaSpinner className="epe-spinner" />
                                        <span>Subiendo... {uploadProgress}%</span>
                                    </div>
                                ) : imagePreview ? (
                                    <div className="epe-image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setImagePreview(null);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    media: {
                                                        ...prev.media,
                                                        hero: { url: '', alt: '', width: 0, height: 0 }
                                                    }
                                                }));
                                            }}
                                            className="epe-image-remove"
                                            type="button"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div className="epe-upload-placeholder">
                                        <FaPlus size={32} />
                                        <p>Arrastra imagen aquí o haz clic para seleccionar</p>
                                        <small>JPG, PNG, WebP - Máx. 5MB</small>
                                    </div>
                                )}
                            </label>
                        </div>

                        {imagePreview && (
                            <div className="epe-form-group epe-mt-1">
                                <label htmlFor="image_alt">Texto Alternativo</label>
                                <input
                                    type="text"
                                    id="image_alt"
                                    value={formData.media.hero.alt}
                                    onChange={(e) => handleNestedChange('media', 'hero', {
                                        ...formData.media.hero,
                                        alt: e.target.value
                                    })}
                                    placeholder="Descripción de la imagen"
                                />
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Save Confirmation Modal */}
            {showSaveConfirm && (
                <div className="epe-modal-overlay" onClick={() => setShowSaveConfirm(false)}>
                    <div className="epe-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="epe-modal-header">
                            <h3>Confirmar Guardado</h3>
                            <button onClick={() => setShowSaveConfirm(false)} className="epe-modal-close">×</button>
                        </div>
                        <div className="epe-modal-body">
                            <div className="epe-save-summary">
                                <h4>{formData.title || 'Nuevo Producto'}</h4>
                                <p className="epe-text-muted">{formData.slug}</p>

                                <div className="epe-summary-grid">
                                    <div className="epe-summary-item">
                                        <strong>Estado:</strong>
                                        <span className={`epe-status-badge epe-status-${formData.status}`}>
                                            {formData.status === 'published' ? 'Publicado' : 'Borrador'}
                                        </span>
                                    </div>
                                    <div className="epe-summary-item">
                                        <strong>Categorías:</strong>
                                        <span>{formData.categoryIds.length}</span>
                                    </div>
                                    <div className="epe-summary-item">
                                        <strong>Presentaciones:</strong>
                                        <span>{formData.presentationIds.length}</span>
                                    </div>
                                    <div className="epe-summary-item">
                                        <strong>Destacado:</strong>
                                        <span>{formData.featured ? 'Sí' : 'No'}</span>
                                    </div>
                                    <div className="epe-summary-item">
                                        <strong>Fiscalizado:</strong>
                                        <span>{formData.fiscalizado ? 'Sí' : 'No'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="epe-modal-footer">
                            <button onClick={() => setShowSaveConfirm(false)} className="epe-btn epe-btn-secondary">
                                Cancelar
                            </button>
                            {formData.status === 'draft' && (
                                <button
                                    onClick={() => handleSave(true)}
                                    className="epe-btn epe-btn-primary"
                                    disabled={saving}
                                >
                                    <FaSave /> Guardar y Publicar
                                </button>
                            )}
                            <button
                                onClick={() => handleSave(false)}
                                className="epe-btn epe-btn-primary"
                                disabled={saving}
                            >
                                <FaSave /> {saving ? 'Guardando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedProductEditor;
