import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { IoHome, IoCube, IoAlbums, IoFlask, IoImage, IoDocumentText, IoChevronDown, IoChevronForward } from "react-icons/io5";
import logo from "../../../images/oregonchemlogo.png";
import shortLogo from "../../../images/oregonchemlogoshort.png";
import { useAuth } from "../../../contexts/authContext";
import "./Sidebar.css";

const SidebarQI = ({ collapsed }) => {
    const { userLoggedIn } = useAuth();
    const [isProductsOpen, setIsProductsOpen] = useState(true);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isPresentationsOpen, setIsPresentationsOpen] = useState(false);
    const [isBannersOpen, setIsBannersOpen] = useState(false);

    if (!userLoggedIn) return null;

    const toggleProductsMenu = () => setIsProductsOpen(!isProductsOpen);
    const toggleCategoriesMenu = () => setIsCategoriesOpen(!isCategoriesOpen);
    const togglePresentationsMenu = () => setIsPresentationsOpen(!isPresentationsOpen);
    const toggleBannersMenu = () => setIsBannersOpen(!isBannersOpen);

    return (
        <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
            <div className="sidebar__header">
                <NavLink to="/" className="sidebar__logo">
                    <img src={collapsed ? shortLogo : logo} alt="QI Dashboard" />
                </NavLink>
            </div>

            <ul className="sidebar__menu">
                <li>
                    <NavLink to="/dashboard" className="sidebar__link">
                        <IoHome />
                        <span>Dashboard</span>
                    </NavLink>
                </li>

                {/* Products */}
                <li className="sidebar__dropdown">
                    <div className="sidebar__link" onClick={toggleProductsMenu}>
                        <IoCube />
                        <span>Productos</span>
                        {!collapsed && (isProductsOpen ? <IoChevronDown /> : <IoChevronForward />)}
                    </div>
                    {!collapsed && isProductsOpen && (
                        <ul className="sidebar__submenu">
                            <li>
                                <NavLink to="/productos" className="sidebar__sublink">
                                    Lista de Productos
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/productos/crear" className="sidebar__sublink">
                                    Crear Producto
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Categories */}
                <li className="sidebar__dropdown">
                    <div className="sidebar__link" onClick={toggleCategoriesMenu}>
                        <IoAlbums />
                        <span>Categorías</span>
                        {!collapsed && (isCategoriesOpen ? <IoChevronDown /> : <IoChevronForward />)}
                    </div>
                    {!collapsed && isCategoriesOpen && (
                        <ul className="sidebar__submenu">
                            <li>
                                <NavLink to="/categorias/todas" className="sidebar__sublink">
                                    Lista de Categorías
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/categorias/crear" className="sidebar__sublink">
                                    Crear Categoría
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Presentations */}
                <li className="sidebar__dropdown">
                    <div className="sidebar__link" onClick={togglePresentationsMenu}>
                        <IoFlask />
                        <span>Presentaciones</span>
                        {!collapsed && (isPresentationsOpen ? <IoChevronDown /> : <IoChevronForward />)}
                    </div>
                    {!collapsed && isPresentationsOpen && (
                        <ul className="sidebar__submenu">
                            <li>
                                <NavLink to="/presentaciones/todas" className="sidebar__sublink">
                                    Lista de Presentaciones
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/presentaciones/crear" className="sidebar__sublink">
                                    Crear Presentación
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Banners */}
                <li className="sidebar__dropdown">
                    <div className="sidebar__link" onClick={toggleBannersMenu}>
                        <IoImage />
                        <span>Banners</span>
                        {!collapsed && (isBannersOpen ? <IoChevronDown /> : <IoChevronForward />)}
                    </div>
                    {!collapsed && isBannersOpen && (
                        <ul className="sidebar__submenu">
                            <li>
                                <NavLink to="/banners/todos" className="sidebar__sublink">
                                    Lista de Banners
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/banners/crear" className="sidebar__sublink">
                                    Crear Banner
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Quotes */}
                <li>
                    <NavLink to="/cotizaciones" className="sidebar__link">
                        <IoDocumentText />
                        <span>Cotizaciones</span>
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default SidebarQI;
