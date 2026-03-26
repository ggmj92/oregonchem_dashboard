// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default API_URL;

// API Endpoints - Updated for QI MongoDB API
export const ENDPOINTS = {
    // QI MongoDB API endpoints (NEW)
    BANNERS: `${API_URL}/api/qi/banners`,
    CATEGORIES: `${API_URL}/api/qi/categories`,
    PRESENTATIONS: `${API_URL}/api/qi/presentations`,
    PRODUCTS: `${API_URL}/api/qi/products`,
    QUOTES: `${API_URL}/api/public/quotes`,

    // Legacy endpoints (OLD - kept for reference, will be removed)
    LEGACY: {
        BANNERS: `${API_URL}/api/banners`,
        CATEGORIES: `${API_URL}/api/categorias`,
        PRESENTATIONS: `${API_URL}/api/presentaciones`,
        PRODUCTS: `${API_URL}/api/productos`,
    },

    // Public endpoints (same as main endpoints for now)
    PUBLIC_BANNERS: `${API_URL}/api/qi/banners/active`,
    PUBLIC_CATEGORIES: `${API_URL}/api/qi/categories`,
    PUBLIC_PRESENTATIONS: `${API_URL}/api/qi/presentations`,
    PUBLIC_PRODUCTS: `${API_URL}/api/qi/products`,

    // Analytics endpoints (TODO: implement in QI API)
    ANALYTICS: {
        OVERVIEW: `${API_URL}/api/analytics/quimicaindustrial/overview`,
        EVENTS: `${API_URL}/api/analytics/quimicaindustrial/events`,
        COMBINED: `${API_URL}/api/analytics/combined/overview`
    },

    // Auth endpoints
    AUTH: {
        VERIFY: `${API_URL}/auth/verify`
    }
}; 