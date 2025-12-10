import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFlask } from 'react-icons/fa';
import { ENDPOINTS } from '../../config/api';
import '../categories/QICategoryList.css';

const QIPresentationList = () => {
    const [presentations, setPresentations] = useState([]);
    const [filteredPresentations, setFilteredPresentations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch presentations
    useEffect(() => {
        const fetchPresentations = async () => {
            try {
                setLoading(true);
                const response = await fetch(ENDPOINTS.PRESENTATIONS);

                if (!response.ok) {
                    throw new Error('Failed to fetch presentations');
                }

                const data = await response.json();
                console.log('Presentations:', data);

                // Sort by sortOrder
                const sorted = (data.data || []).sort((a, b) => a.sortOrder - b.sortOrder);
                setPresentations(sorted);
                setFilteredPresentations(sorted);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching presentations:', error);
                setError('Failed to load presentations');
                setLoading(false);
            }
        };

        fetchPresentations();
    }, []);

    // Filter presentations
    useEffect(() => {
        if (searchQuery) {
            const filtered = presentations.filter(presentation =>
                presentation.pretty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                presentation.unit?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredPresentations(filtered);
        } else {
            setFilteredPresentations(presentations);
        }
    }, [searchQuery, presentations]);

    // Delete presentation
    const handleDelete = async (presentationId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta presentación?')) {
            return;
        }

        try {
            const response = await fetch(`${ENDPOINTS.PRESENTATIONS}/${presentationId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete presentation');
            }

            setPresentations(presentations.filter(p => p._id !== presentationId));
            alert('Presentación eliminada exitosamente');
        } catch (error) {
            console.error('Error deleting presentation:', error);
            alert('Error al eliminar la presentación');
        }
    };

    if (loading) {
        return <div className="qi-loading">Cargando presentaciones...</div>;
    }

    if (error) {
        return <div className="qi-error">{error}</div>;
    }

    return (
        <div className="qi-category-list">
            <div className="qi-header">
                <h1>Presentaciones QI</h1>
                <Link to="/presentaciones/crear" className="qi-btn-primary">
                    <FaPlus /> Crear Presentación
                </Link>
            </div>

            <div className="qi-filters">
                <div className="qi-search">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o unidad..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="qi-stats">
                    {filteredPresentations.length} de {presentations.length} presentaciones
                </div>
            </div>

            <div className="qi-grid">
                {filteredPresentations.map(presentation => (
                    <div key={presentation._id} className="qi-category-card">
                        <div className="qi-category-image">
                            {presentation.image?.url ? (
                                <img src={presentation.image.url} alt={presentation.pretty} />
                            ) : (
                                <div className="qi-category-placeholder">
                                    <FaFlask />
                                </div>
                            )}
                        </div>

                        <div className="qi-category-content">
                            <h3>{presentation.pretty}</h3>
                            <p className="qi-category-slug">
                                {presentation.qty} {presentation.unit}
                            </p>

                            <div className="qi-category-stats">
                                <span className="qi-badge">
                                    {presentation.productCount || 0} productos
                                </span>
                                <span className="qi-badge">
                                    Orden: {presentation.sortOrder}
                                </span>
                            </div>
                        </div>

                        <div className="qi-category-actions">
                            <Link
                                to={`/presentaciones/editar/${presentation._id}`}
                                className="qi-btn-icon qi-btn-edit"
                                title="Editar"
                            >
                                <FaEdit />
                            </Link>
                            <button
                                onClick={() => handleDelete(presentation._id)}
                                className="qi-btn-icon qi-btn-delete"
                                title="Eliminar"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPresentations.length === 0 && (
                <div className="qi-empty">
                    No se encontraron presentaciones
                </div>
            )}
        </div>
    );
};

export default QIPresentationList;
