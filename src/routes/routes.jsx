import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/authContext";
import SidebarQI from "../components/layout/Sidebar/SidebarQI";
import Topbar from "../components/layout/Topbar/Topbar";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import QIProductList from "../pages/Products/QIProductList";
import EnhancedProductEditor from "../pages/Products/EnhancedProductEditor";
import QICategoryList from "../pages/Categories/QICategoryList";
import QICategoryEditor from "../pages/Categories/QICategoryEditor";
import QIPresentationList from "../pages/Presentations/QIPresentationList";
import QIPresentationEditor from "../pages/Presentations/QIPresentationEditor";
import QIBannerList from "../pages/Banners/QIBannerList";
import QIBannerEditor from "../pages/Banners/QIBannerEditor";
import PrivateRoute from "../contexts/PrivateRoute";

const AppRoutes = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { userLoggedIn } = useAuth();

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    // If not logged in, show login page without layout
    if (!userLoggedIn) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    // If logged in, show full layout with sidebar and topbar
    return (
        <div className="app-container">
            <SidebarQI collapsed={collapsed} />
            <div className="main-content">
                <Topbar collapsed={collapsed} toggleSidebar={toggleSidebar} />
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

                            {/* QI Product Routes */}
                            <Route path="/productos" element={<PrivateRoute><QIProductList /></PrivateRoute>} />
                            <Route path="/productos/todos" element={<PrivateRoute><QIProductList /></PrivateRoute>} />
                            <Route path="/productos/crear" element={<PrivateRoute><EnhancedProductEditor /></PrivateRoute>} />
                            <Route path="/productos/editar/:id" element={<PrivateRoute><EnhancedProductEditor /></PrivateRoute>} />

                            {/* QI Category Routes */}
                            <Route path="/categorias/todas" element={<PrivateRoute><QICategoryList /></PrivateRoute>} />
                            <Route path="/categorias/crear" element={<PrivateRoute><QICategoryEditor /></PrivateRoute>} />
                            <Route path="/categorias/editar/:id" element={<PrivateRoute><QICategoryEditor /></PrivateRoute>} />

                            {/* QI Presentation Routes */}
                            <Route path="/presentaciones/todas" element={<PrivateRoute><QIPresentationList /></PrivateRoute>} />
                            <Route path="/presentaciones/crear" element={<PrivateRoute><QIPresentationEditor /></PrivateRoute>} />
                            <Route path="/presentaciones/editar/:id" element={<PrivateRoute><QIPresentationEditor /></PrivateRoute>} />

                            {/* QI Banner Routes */}
                    <Route path="/banners/todos" element={<PrivateRoute><QIBannerList /></PrivateRoute>} />
                    <Route path="/banners/crear" element={<PrivateRoute><QIBannerEditor /></PrivateRoute>} />
                    <Route path="/banners/editar/:id" element={<PrivateRoute><QIBannerEditor /></PrivateRoute>} />
                </Routes>
            </div>
        </div>
    );
}

export default AppRoutes;


