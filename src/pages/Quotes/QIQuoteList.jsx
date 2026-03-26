import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaCheckCircle, FaClock, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { ENDPOINTS } from '../../config/api';
import './QIQuoteList.css';

const QIQuoteList = () => {
    const [quotes, setQuotes] = useState([]);
    const [filteredQuotes, setFilteredQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name, id
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedQuote, setSelectedQuote] = useState(null);

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${ENDPOINTS.QUOTES}?limit=1000`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch quotes');
            }

            const data = await response.json();
            setQuotes(data.data || []);
            setFilteredQuotes(data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching quotes:', error);
            setError('Error al cargar las cotizaciones');
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = [...quotes];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(quote =>
                quote.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                quote.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                quote.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                quote.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                quote._id?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(quote => quote.status === statusFilter);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'name':
                    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
                    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
                    return nameA.localeCompare(nameB);
                case 'id':
                    return a._id.localeCompare(b._id);
                default:
                    return 0;
            }
        });

        setFilteredQuotes(filtered);
    }, [searchQuery, sortBy, statusFilter, quotes]);

    const handleStatusUpdate = async (quoteId, newStatus) => {
        try {
            const response = await fetch(`${ENDPOINTS.QUOTES}/${quoteId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            const updatedQuote = await response.json();
            setQuotes(quotes.map(q => q._id === quoteId ? updatedQuote.data : q));
            alert('Estado actualizado correctamente');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error al actualizar el estado');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <FaClock className="status-icon pending" />;
            case 'processing':
                return <FaSpinner className="status-icon processing" />;
            case 'completed':
                return <FaCheckCircle className="status-icon completed" />;
            case 'cancelled':
                return <FaTimesCircle className="status-icon cancelled" />;
            default:
                return null;
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pendiente',
            processing: 'En Proceso',
            completed: 'Completado',
            cancelled: 'Cancelado'
        };
        return labels[status] || status;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="qi-loading">Cargando cotizaciones...</div>;
    }

    if (error) {
        return <div className="qi-error">{error}</div>;
    }

    return (
        <div className="qi-quote-list">
            <div className="qi-header">
                <h1>Cotizaciones</h1>
                <div className="qi-stats-summary">
                    <span className="stat-badge">Total: {quotes.length}</span>
                    <span className="stat-badge pending">Pendientes: {quotes.filter(q => q.status === 'pending').length}</span>
                    <span className="stat-badge processing">En Proceso: {quotes.filter(q => q.status === 'processing').length}</span>
                    <span className="stat-badge completed">Completadas: {quotes.filter(q => q.status === 'completed').length}</span>
                </div>
            </div>

            <div className="qi-filters">
                <div className="qi-search">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email, empresa o ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="qi-select"
                >
                    <option value="newest">Más Recientes</option>
                    <option value="oldest">Más Antiguos</option>
                    <option value="name">Nombre (A-Z)</option>
                    <option value="id">ID</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="qi-select"
                >
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="processing">En Proceso</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                </select>

                <div className="qi-stats">
                    {filteredQuotes.length} de {quotes.length} cotizaciones
                </div>
            </div>

            <div className="qi-table-container">
                <table className="qi-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Tipo</th>
                            <th>Contacto</th>
                            <th>Productos</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredQuotes.map(quote => (
                            <tr key={quote._id}>
                                <td>
                                    <span className="quote-id" title={quote._id}>
                                        {quote._id.slice(-8)}
                                    </span>
                                </td>
                                <td>{formatDate(quote.createdAt)}</td>
                                <td>
                                    <div className="client-info">
                                        <strong>{quote.firstName} {quote.lastName}</strong>
                                        {quote.companyName && (
                                            <span className="company-name">{quote.companyName}</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <span className={`client-type-badge ${quote.clientType}`}>
                                        {quote.clientType === 'natural' ? 'Persona Natural' : 
                                         quote.clientType === 'empresa' ? 'Empresa' : 
                                         'Natural + Empresa'}
                                    </span>
                                </td>
                                <td>
                                    <div className="contact-info">
                                        <div>{quote.email}</div>
                                        <div className="phone">{quote.phone}</div>
                                    </div>
                                </td>
                                <td>
                                    <span className="products-count">
                                        {quote.products?.length || 0} producto(s)
                                    </span>
                                </td>
                                <td>
                                    <div className="status-cell">
                                        {getStatusIcon(quote.status)}
                                        <span className={`qi-status qi-status-${quote.status}`}>
                                            {getStatusLabel(quote.status)}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="qi-actions">
                                        <button
                                            onClick={() => setSelectedQuote(quote)}
                                            className="qi-btn-icon"
                                            title="Ver detalles"
                                        >
                                            <FaEye />
                                        </button>
                                        <select
                                            value={quote.status}
                                            onChange={(e) => handleStatusUpdate(quote._id, e.target.value)}
                                            className="status-select"
                                            title="Cambiar estado"
                                        >
                                            <option value="pending">Pendiente</option>
                                            <option value="processing">En Proceso</option>
                                            <option value="completed">Completado</option>
                                            <option value="cancelled">Cancelado</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredQuotes.length === 0 && (
                <div className="qi-empty">
                    No se encontraron cotizaciones
                </div>
            )}

            {selectedQuote && (
                <QuoteDetailModal
                    quote={selectedQuote}
                    onClose={() => setSelectedQuote(null)}
                />
            )}
        </div>
    );
};

const QuoteDetailModal = ({ quote, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Detalles de Cotización</h2>
                    <button onClick={onClose} className="modal-close">&times;</button>
                </div>

                <div className="modal-body">
                    <div className="detail-section">
                        <h3>Información del Cliente</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Nombre Completo:</label>
                                <span>{quote.firstName} {quote.lastName}</span>
                            </div>
                            <div className="detail-item">
                                <label>DNI:</label>
                                <span>{quote.dni}</span>
                            </div>
                            <div className="detail-item">
                                <label>Email:</label>
                                <span>{quote.email}</span>
                            </div>
                            <div className="detail-item">
                                <label>Teléfono:</label>
                                <span>{quote.phone}</span>
                            </div>
                            {quote.companyName && (
                                <>
                                    <div className="detail-item">
                                        <label>Empresa:</label>
                                        <span>{quote.companyName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>RUC:</label>
                                        <span>{quote.ruc}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Productos Solicitados</h3>
                        <div className="products-list">
                            {quote.products?.map((product, index) => (
                                <div key={index} className="product-item">
                                    <div className="product-name">{product.productName}</div>
                                    <div className="product-details">
                                        <span>Presentación: {product.presentationLabel}</span>
                                        <span>Cantidad: {product.quantity}</span>
                                        <span>Frecuencia: {product.frequency}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Preferencias de Contacto</h3>
                        <div className="contact-preferences">
                            {quote.contactPreferences?.email && <span className="pref-badge">📧 Email</span>}
                            {quote.contactPreferences?.whatsapp && <span className="pref-badge">💬 WhatsApp</span>}
                            {quote.contactPreferences?.phone && <span className="pref-badge">📞 Teléfono</span>}
                        </div>
                    </div>

                    {quote.observations && (
                        <div className="detail-section">
                            <h3>Observaciones</h3>
                            <p className="observations">{quote.observations}</p>
                        </div>
                    )}

                    <div className="detail-section">
                        <h3>Información Adicional</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>ID:</label>
                                <span className="mono">{quote._id}</span>
                            </div>
                            <div className="detail-item">
                                <label>Fecha de Creación:</label>
                                <span>{new Date(quote.createdAt).toLocaleString('es-PE')}</span>
                            </div>
                            <div className="detail-item">
                                <label>Última Actualización:</label>
                                <span>{new Date(quote.updatedAt).toLocaleString('es-PE')}</span>
                            </div>
                            <div className="detail-item">
                                <label>Estado:</label>
                                <span className={`qi-status qi-status-${quote.status}`}>
                                    {quote.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QIQuoteList;
