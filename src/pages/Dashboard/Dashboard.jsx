import React, { useState, useEffect } from "react";
import { auth } from "../../firebase/firebase";
import Login from "../Login/Login";
import PresentationForm from "../../components/Forms/PresentationForm";
import CategoryForm from "../../components/Forms/CategoryForm";
import BannerForm from "../../components/Forms/BannerForm";
import ProductForm from "../../components/Forms/ProductForm";
import "./dashboard.css";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [presentations, setPresentations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isProductFormReady, setIsProductFormReady] = useState(false);

    // Handle authentication
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    // Fetch data when user is authenticated
    useEffect(() => {
        if (user) {
            fetchContent();
        }
    }, [user]);

    const fetchContent = async () => {
        try {
            setLoading(true);
            setIsProductFormReady(false);
            setError(null);
            
            const [presentationsResponse, categoriesResponse] = await Promise.all([
                fetch('http://localhost:5001/api/public/presentaciones'),
                fetch('http://localhost:5001/api/public/categorias')
            ]);

            if (!presentationsResponse.ok || !categoriesResponse.ok) {
                throw new Error('Failed to fetch content data');
            }

            const [presentationsData, categoriesData] = await Promise.all([
                presentationsResponse.json(),
                categoriesResponse.json()
            ]);

            const presentationsList = presentationsData.data || [];
            const categoriesList = categoriesData.data || [];

            setPresentations(presentationsList);
            setCategories(categoriesList);
            setIsProductFormReady(true);
        } catch (error) {
            setError(error.message || 'An error occurred while fetching content');
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContentUpdate = () => {
        fetchContent();
    };

    if (!user) {
        return <Login />;
    }

    if (loading) {
        return <div className="container">Loading...</div>;
    }

    if (error) {
        return <div className="container">Error: {error}</div>;
    }

    return (
        <div className="container">
            <h1>Dashboard</h1>
            <div className="dashboard-container">
                <div className="card small-card">
                    <h2>Crear Presentación</h2>
                    <PresentationForm onSuccess={handleContentUpdate} />
                </div>
                <div className="card large-card">
                    <h2>Crear Producto</h2>
                    <ProductForm 
                        presentations={presentations}
                        categories={categories}
                        onSuccess={handleContentUpdate}
                    />
                </div>
                <div className="card small-card">
                    <h2>Crear Categoría</h2>
                    <CategoryForm onSuccess={handleContentUpdate} />
                </div>
                <div className="card small-card">
                    <h2>Crear Banner</h2>
                    <BannerForm onSuccess={handleContentUpdate} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;