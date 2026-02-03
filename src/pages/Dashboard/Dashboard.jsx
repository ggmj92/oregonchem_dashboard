import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoCube, IoAlbums, IoFlask, IoImage, IoDocumentText } from "react-icons/io5";
import { ENDPOINTS } from "../../config/api";
import "./Dashboard.css";

const Dashboard = () => {
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        presentations: 0,
        banners: 0,
        quotes: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [productsRes, categoriesRes, presentationsRes, bannersRes, quotesRes] = await Promise.all([
                fetch(ENDPOINTS.PRODUCTS),
                fetch(ENDPOINTS.CATEGORIES),
                fetch(ENDPOINTS.PRESENTATIONS),
                fetch(ENDPOINTS.BANNERS),
                fetch(ENDPOINTS.QUOTES)
            ]);

            const [products, categories, presentations, banners, quotes] = await Promise.all([
                productsRes.json(),
                categoriesRes.json(),
                presentationsRes.json(),
                bannersRes.json(),
                quotesRes.json()
            ]);

            setStats({
                products: products.pagination?.total || products.data?.length || 0,
                categories: categories.data?.length || 0,
                presentations: presentations.data?.length || 0,
                banners: banners.data?.length || 0,
                quotes: quotes.pagination?.total || quotes.data?.length || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-header">
                    <h1>Cargando...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Dashboard - Quimica Industrial</h1>
                <p>Gestiona el contenido de tu sitio web</p>
            </div>

            <div className="dashboard-stats">
                <Link to="/productos" className="stat-card">
                    <div className="stat-icon">
                        <IoCube />
                    </div>
                    <div className="stat-info">
                        <h3>Productos</h3>
                        <p className="stat-number">{stats.products}</p>
                    </div>
                </Link>

                <Link to="/categorias/todas" className="stat-card">
                    <div className="stat-icon">
                        <IoAlbums />
                    </div>
                    <div className="stat-info">
                        <h3>Categorías</h3>
                        <p className="stat-number">{stats.categories}</p>
                    </div>
                </Link>

                <Link to="/presentaciones/todas" className="stat-card">
                    <div className="stat-icon">
                        <IoFlask />
                    </div>
                    <div className="stat-info">
                        <h3>Presentaciones</h3>
                        <p className="stat-number">{stats.presentations}</p>
                    </div>
                </Link>

                <Link to="/banners/todos" className="stat-card">
                    <div className="stat-icon">
                        <IoImage />
                    </div>
                    <div className="stat-info">
                        <h3>Banners</h3>
                        <p className="stat-number">{stats.banners}</p>
                    </div>
                </Link>

                <Link to="/cotizaciones" className="stat-card">
                    <div className="stat-icon">
                        <IoDocumentText />
                    </div>
                    <div className="stat-info">
                        <h3>Cotizaciones</h3>
                        <p className="stat-number">{stats.quotes}</p>
                    </div>
                </Link>
            </div>

            <div className="dashboard-quick-actions">
                <h2>Acciones Rápidas</h2>
                <div className="quick-actions-grid">
                    <Link to="/productos/crear" className="action-button">
                        <IoCube />
                        <span>Crear Producto</span>
                    </Link>
                    <Link to="/categorias/crear" className="action-button">
                        <IoAlbums />
                        <span>Crear Categoría</span>
                    </Link>
                    <Link to="/presentaciones/crear" className="action-button">
                        <IoFlask />
                        <span>Crear Presentación</span>
                    </Link>
                    <Link to="/banners/crear" className="action-button">
                        <IoImage />
                        <span>Crear Banner</span>
                    </Link>
                    <Link to="/cotizaciones" className="action-button">
                        <IoDocumentText />
                        <span>Ver Cotizaciones</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;