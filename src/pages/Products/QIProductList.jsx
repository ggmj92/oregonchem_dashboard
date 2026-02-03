import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ENDPOINTS } from '../../config/api';
import './QIProductList.css';

const QIProductList = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [presentations, setPresentations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, published, draft
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Fetch products, categories, and presentations
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch all data in parallel - GET ALL PRODUCTS (no limit)
                const [productsRes, categoriesRes, presentationsRes] = await Promise.all([
                    fetch(`${ENDPOINTS.PRODUCTS}?limit=1000`),
                    fetch(ENDPOINTS.CATEGORIES),
                    fetch(ENDPOINTS.PRESENTATIONS)
                ]);

                if (!productsRes.ok || !categoriesRes.ok || !presentationsRes.ok) {
                    throw new Error('Failed to fetch data');
                }

                const productsData = await productsRes.json();
                const categoriesData = await categoriesRes.json();
                const presentationsData = await presentationsRes.json();

                console.log('Products:', productsData);
                console.log('Categories:', categoriesData);
                console.log('Presentations:', presentationsData);

                setProducts(productsData.data || []);
                setFilteredProducts(productsData.data || []);
                setCategories(categoriesData.data || []);
                setPresentations(presentationsData.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter products
    useEffect(() => {
        let filtered = [...products];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(product =>
                product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.slug?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(product => product.status === statusFilter);
        }

        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(product =>
                product.categoryIds?.includes(categoryFilter)
            );
        }

        setFilteredProducts(filtered);
    }, [searchQuery, statusFilter, categoryFilter, products]);

    // Delete product
    const handleDelete = async (productId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            return;
        }

        try {
            const response = await fetch(`${ENDPOINTS.PRODUCTS}/${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            setProducts(products.filter(p => p._id !== productId));
            alert('Producto eliminado exitosamente');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error al eliminar el producto');
        }
    };

    // Toggle published status
    const handleToggleStatus = async (product) => {
        const newStatus = product.status === 'published' ? 'draft' : 'published';

        try {
            const response = await fetch(`${ENDPOINTS.PRODUCTS}/${product._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...product,
                    status: newStatus
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update product status');
            }

            const updatedProduct = await response.json();
            setProducts(products.map(p => p._id === product._id ? updatedProduct.data : p));
            alert(`Producto ${newStatus === 'published' ? 'publicado' : 'guardado como borrador'}`);
        } catch (error) {
            console.error('Error updating product status:', error);
            alert('Error al actualizar el estado del producto');
        }
    };

    // Get category name by ID
    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c._id === categoryId);
        return category ? category.name : 'Sin categoría';
    };

    // Get presentation label by ID
    const getPresentationLabel = (presentationId) => {
        const presentation = presentations.find(p => p._id === presentationId);
        return presentation ? presentation.pretty : '';
    };

    // Get product image - USE PRESENTATION IMAGES, NOT LEGACY MEDIA
    const getProductImage = (product) => {
        // First, try to get the first presentation's image
        if (product.presentationIds && product.presentationIds.length > 0) {
            const firstPresentationId = product.presentationIds[0];
            const presentation = presentations.find(p => p._id === firstPresentationId);

            if (presentation?.image?.url) {
                const imageUrl = presentation.image.url;
                // If it's a relative path, prepend the frontend URL
                if (imageUrl.startsWith('/images/')) {
                    return `https://quimicaindustrial.pe${imageUrl}`;
                }
                // If it's already a full URL (Firebase), use as-is
                return imageUrl;
            }
        }

        // If no presentation image, use placeholder from frontend
        const isLiquid = product.physicalState === 'liquido';
        return `https://quimicaindustrial.pe/images/placeholders/presentation-placeholder-${isLiquid ? 'liquido' : 'solido'}.png`;
    };

    if (loading) {
        return <div className="qi-loading">Cargando productos...</div>;
    }

    if (error) {
        return <div className="qi-error">{error}</div>;
    }

    return (
        <div className="qi-product-list">
            <div className="qi-header">
                <h1>Productos QI</h1>
                <Link to="/productos/crear" className="qi-btn-primary">
                    <FaPlus /> Crear Producto
                </Link>
            </div>

            <div className="qi-filters">
                <div className="qi-search">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, SKU o slug..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="qi-select"
                >
                    <option value="all">Todos los estados</option>
                    <option value="published">Publicados</option>
                    <option value="draft">Borradores</option>
                </select>

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="qi-select"
                >
                    <option value="all">Todas las categorías</option>
                    {categories.map(category => (
                        <option key={category._id} value={category._id}>
                            {category.name}
                        </option>
                    ))}
                </select>

                <div className="qi-stats">
                    {filteredProducts.length} de {products.length} productos
                </div>
            </div>

            <div className="qi-table-container">
                <table className="qi-table">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Título</th>
                            <th>SKU</th>
                            <th>Categorías</th>
                            <th>Presentaciones</th>
                            <th>Estado</th>
                            <th>Vistas</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product._id}>
                                <td>
                                    <img
                                        src={getProductImage(product)}
                                        alt={product.title}
                                        className="qi-product-thumb"
                                        onError={(e) => {
                                            console.error('Failed to load image:', getProductImage(product));
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </td>
                                <td>
                                    <div className="qi-product-title">
                                        {product.title}
                                        {product.featured && (
                                            <span className="qi-badge qi-badge-featured">Destacado</span>
                                        )}
                                    </div>
                                    <div className="qi-product-slug">{product.slug}</div>
                                </td>
                                <td>{product.sku || '-'}</td>
                                <td>
                                    <div className="qi-categories">
                                        {(product.categoryIds || []).slice(0, 2).map(catId => (
                                            <span key={catId} className="qi-badge">
                                                {getCategoryName(catId)}
                                            </span>
                                        ))}
                                        {product.categoryIds?.length > 2 && (
                                            <span className="qi-badge">+{product.categoryIds.length - 2}</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="qi-presentations">
                                        {(product.presentationIds || []).slice(0, 3).map(presId => (
                                            <span key={presId} className="qi-badge qi-badge-presentation">
                                                {getPresentationLabel(presId)}
                                            </span>
                                        ))}
                                        {product.presentationIds?.length > 3 && (
                                            <span className="qi-badge">+{product.presentationIds.length - 3}</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <span className={`qi-status qi-status-${product.status}`}>
                                        {product.status === 'published' ? 'Publicado' : 'Borrador'}
                                    </span>
                                </td>
                                <td>{product.views || 0}</td>
                                <td>
                                    <div className="qi-actions">
                                        <button
                                            onClick={() => handleToggleStatus(product)}
                                            className="qi-btn-icon"
                                            title={product.status === 'published' ? 'Despublicar' : 'Publicar'}
                                        >
                                            {product.status === 'published' ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                        <Link
                                            to={`/productos/editar/${product._id}`}
                                            className="qi-btn-icon qi-btn-edit"
                                            title="Editar"
                                        >
                                            <FaEdit />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="qi-btn-icon qi-btn-delete"
                                            title="Eliminar"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredProducts.length === 0 && (
                    <div className="qi-empty">
                        No se encontraron productos
                    </div>
                )}
            </div>
        </div>
    );
};

export default QIProductList;
