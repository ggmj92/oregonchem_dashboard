// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default API_URL;

export const ENDPOINTS = {
    BANNERS: `${API_URL}/api/qi/banners`,
    CATEGORIES: `${API_URL}/api/qi/categories`,
    PRESENTATIONS: `${API_URL}/api/qi/presentations`,
    PRODUCTS: `${API_URL}/api/qi/products`,
    QUOTES: `${API_URL}/api/qi/quotes`,

    // Legacy WooCommerce endpoints — retained for any remaining consumers
    LEGACY: {
        BANNERS: `${API_URL}/api/banners`,
        CATEGORIES: `${API_URL}/api/categorias`,
        PRESENTATIONS: `${API_URL}/api/presentaciones`,
        PRODUCTS: `${API_URL}/api/productos`,
    },

    PUBLIC_BANNERS: `${API_URL}/api/qi/banners/active`,
    PUBLIC_CATEGORIES: `${API_URL}/api/qi/categories`,
    PUBLIC_PRESENTATIONS: `${API_URL}/api/qi/presentations`,
    PUBLIC_PRODUCTS: `${API_URL}/api/qi/products`,

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