import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaImage } from 'react-icons/fa';
import { ENDPOINTS } from '../../config/api';
import './QICategoryList.css';

const QICategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${ENDPOINTS.CATEGORIES}?includeCount=true`);

                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }

                const data = await response.json();
                console.log('Categories:', data);

                setCategories(data.data || []);
                setFilteredCategories(data.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Failed to load categories');
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Filter categories
    useEffect(() => {
        if (searchQuery) {
            const filtered = categories.filter(category =>
                category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                category.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                category.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredCategories(filtered);
        } else {
            setFilteredCategories(categories);
        }
    }, [searchQuery, categories]);

    // Delete category
    const handleDelete = async (categoryId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
            return;
        }

        try {
            const response = await fetch(`${ENDPOINTS.CATEGORIES}/${categoryId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete category');
            }

            setCategories(categories.filter(c => c._id !== categoryId));
            alert('Categoría eliminada exitosamente');
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Error al eliminar la categoría');
        }
    };

    if (loading) {
        return <div className="qi-loading">Cargando categorías...</div>;
    }

    if (error) {
        return <div className="qi-error">{error}</div>;
    }

    return (
        <div className="qi-category-list">
            <div className="qi-header">
                <h1>Categorías QI</h1>
                <Link to="/categorias/crear" className="qi-btn-primary">
                    <FaPlus /> Crear Categoría
                </Link>
            </div>

            <div className="qi-filters">
                <div className="qi-search">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, slug o descripción..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="qi-stats">
                    {filteredCategories.length} de {categories.length} categorías
                </div>
            </div>

            <div className="qi-grid">
                {filteredCategories.map(category => (
                    <div key={category._id} className="qi-category-card">
                        <div className="qi-category-image">
                            {category.image?.url ? (
                                <img src={category.image.url} alt={category.name} />
                            ) : (
                                <div className="qi-category-placeholder">
                                    <FaImage />
                                </div>
                            )}
                        </div>

                        <div className="qi-category-content">
                            <h3>{category.name}</h3>
                            <p className="qi-category-slug">{category.slug}</p>

                            {category.description && (
                                <p className="qi-category-description">
                                    {category.description.length > 100
                                        ? `${category.description.slice(0, 100)}...`
                                        : category.description}
                                </p>
                            )}

                            <div className="qi-category-stats">
                                <span className="qi-badge">
                                    {category.productCount || 0} productos
                                </span>
                            </div>
                        </div>

                        <div className="qi-category-actions">
                            <Link
                                to={`/categorias/editar/${category._id}`}
                                className="qi-btn-icon qi-btn-edit"
                                title="Editar"
                            >
                                <FaEdit />
                            </Link>
                            <button
                                onClick={() => handleDelete(category._id)}
                                className="qi-btn-icon qi-btn-delete"
                                title="Eliminar"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCategories.length === 0 && (
                <div className="qi-empty">
                    No se encontraron categorías
                </div>
            )}
        </div>
    );
};

export default QICategoryList;
