import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaEye, FaEyeSlash, FaImage } from 'react-icons/fa';
import { ENDPOINTS } from '../../config/api';
import '../categories/QICategoryList.css';

const QIBannerList = () => {
    const [banners, setBanners] = useState([]);
    const [filteredBanners, setFilteredBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Fetch banners
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true);
                const response = await fetch(ENDPOINTS.BANNERS);

                if (!response.ok) {
                    throw new Error('Failed to fetch banners');
                }

                const data = await response.json();
                console.log('Banners:', data);

                // Sort by sortOrder
                const sorted = (data.data || []).sort((a, b) => a.sortOrder - b.sortOrder);
                setBanners(sorted);
                setFilteredBanners(sorted);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching banners:', error);
                setError('Failed to load banners');
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    // Filter banners
    useEffect(() => {
        let filtered = [...banners];

        if (searchQuery) {
            filtered = filtered.filter(banner =>
                banner.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                banner.placement?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            filtered = filtered.filter(banner => banner.active === isActive);
        }

        setFilteredBanners(filtered);
    }, [searchQuery, statusFilter, banners]);

    // Toggle active status
    const handleToggleActive = async (banner) => {
        try {
            const response = await fetch(`${ENDPOINTS.BANNERS}/${banner._id}/toggle`, {
                method: 'PATCH',
            });

            if (!response.ok) {
                throw new Error('Failed to toggle banner status');
            }

            const updatedBanner = await response.json();
            setBanners(banners.map(b => b._id === banner._id ? updatedBanner.data : b));
        } catch (error) {
            console.error('Error toggling banner status:', error);
            alert('Error al cambiar el estado del banner');
        }
    };

    // Delete banner
    const handleDelete = async (bannerId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este banner?')) {
            return;
        }

        try {
            const response = await fetch(`${ENDPOINTS.BANNERS}/${bannerId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete banner');
            }

            setBanners(banners.filter(b => b._id !== bannerId));
            alert('Banner eliminado exitosamente');
        } catch (error) {
            console.error('Error deleting banner:', error);
            alert('Error al eliminar el banner');
        }
    };

    if (loading) {
        return <div className="qi-loading">Cargando banners...</div>;
    }

    if (error) {
        return <div className="qi-error">{error}</div>;
    }

    return (
        <div className="qi-category-list">
            <div className="qi-header">
                <h1>Banners QI</h1>
                <Link to="/banners/crear" className="qi-btn-primary">
                    <FaPlus /> Crear Banner
                </Link>
            </div>

            <div className="qi-filters">
                <div className="qi-search">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Buscar por título o ubicación..."
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
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                </select>

                <div className="qi-stats">
                    {filteredBanners.length} de {banners.length} banners
                </div>
            </div>

            <div className="qi-grid">
                {filteredBanners.map(banner => (
                    <div key={banner._id} className="qi-category-card">
                        <div className="qi-category-image">
                            {banner.image?.url ? (
                                <img src={banner.image.url} alt={banner.title} />
                            ) : (
                                <div className="qi-category-placeholder">
                                    <FaImage />
                                </div>
                            )}
                        </div>

                        <div className="qi-category-content">
                            <h3>{banner.title}</h3>
                            <p className="qi-category-slug">{banner.placement}</p>

                            {banner.link?.url && (
                                <p className="qi-category-description" style={{ fontSize: '0.75rem' }}>
                                    🔗 {banner.link.url}
                                </p>
                            )}

                            <div className="qi-category-stats">
                                <span className={`qi-status qi-status-${banner.active ? 'published' : 'draft'}`}>
                                    {banner.active ? 'Activo' : 'Inactivo'}
                                </span>
                                <span className="qi-badge">
                                    Orden: {banner.sortOrder}
                                </span>
                                <span className="qi-badge">
                                    👁️ {banner.impressions || 0}
                                </span>
                                <span className="qi-badge">
                                    🖱️ {banner.clicks || 0}
                                </span>
                            </div>
                        </div>

                        <div className="qi-category-actions">
                            <button
                                onClick={() => handleToggleActive(banner)}
                                className="qi-btn-icon"
                                title={banner.active ? 'Desactivar' : 'Activar'}
                            >
                                {banner.active ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            <Link
                                to={`/banners/editar/${banner._id}`}
                                className="qi-btn-icon qi-btn-edit"
                                title="Editar"
                            >
                                <FaEdit />
                            </Link>
                            <button
                                onClick={() => handleDelete(banner._id)}
                                className="qi-btn-icon qi-btn-delete"
                                title="Eliminar"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredBanners.length === 0 && (
                <div className="qi-empty">
                    No se encontraron banners
                </div>
            )}
        </div>
    );
};

export default QIBannerList;
