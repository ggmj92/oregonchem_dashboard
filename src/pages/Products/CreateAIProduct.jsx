import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authContext';
import { useLoading } from '../../contexts/loadingContext';
import { fetchWithCache, API_ENDPOINTS } from '../../utils/api';
import AIProductForm from '../../components/Forms/AIProductForm';
import './CreateProduct.css';

const CreateAIProduct = () => {
  const { currentUser } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        showLoading();
        const categoriesData = await fetchWithCache(API_ENDPOINTS.CATEGORIES);
        setCategories(categoriesData?.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
        hideLoading();
      }
    };

    fetchCategories();
  }, []);

  const handleSuccess = () => {
    // Refresh the page or redirect
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading AI Product Form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="error-container">
        <h2>Authentication Required</h2>
        <p>Please log in to create AI products.</p>
      </div>
    );
  }

  return (
    <div className="create-product-container">
      <div className="page-header">
        <h1>Crear Producto con IA</h1>
        <p className="page-description">
          Utiliza inteligencia artificial para generar imágenes de productos basadas en plantillas predefinidas.
          Selecciona las plantillas, configura los parámetros de IA y genera automáticamente las imágenes.
        </p>
      </div>
      
      <div className="form-section">
        <AIProductForm
          categories={categories}
          onSuccess={handleSuccess}
          submitButtonText="Generar Producto con IA"
        />
      </div>
    </div>
  );
};
    
export default CreateAIProduct;

