import React, { useState, useEffect } from 'react';
import { catalogoService } from '../../services/catalogoService';
import { inventarioService } from '../../services/inventarioService';
import { ventasService } from '../../services/ventasService';
import './AdminTables.css';
import './Dashboard.css';

const DashboardAdmin = () => {
    const [stats, setStats] = useState({
        totalProductos: 0,
        totalSucursales: 0,
        totalInventarios: 0,
        totalVentas: 0,
        productosBajoStock: [],
        ventasRecientes: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const [medicamentos, sucursales, inventarios, ventas] = await Promise.all([
                catalogoService.getMedicamentos().catch(() => []),
                inventarioService.getSucursales().catch(() => []),
                inventarioService.getInventarios().catch(() => []),
                ventasService.getVentas().catch(() => [])
            ]);

            // Identificar productos con stock bajo (menos de 10 unidades)
            const bajoStock = (inventarios || []).filter(inv => inv.cantidad < 10);

            // Calcular total de ventas
            const totalVentasAmount = (ventas || []).reduce((sum, v) => sum + (v.total || 0), 0);

            setStats({
                totalProductos: (medicamentos || []).length,
                totalSucursales: (sucursales || []).length,
                totalInventarios: (inventarios || []).length,
                totalVentas: totalVentasAmount,
                ventasCount: (ventas || []).length,
                productosBajoStock: bajoStock,
                ventasRecientes: (ventas || []).slice(-5).reverse()
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Cargando estadísticas...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-admin">
            <h2>📊 Panel de Control</h2>
            <p className="dashboard-subtitle">Vista general del sistema de farmacia</p>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-blue">
                    <div className="stat-icon">💊</div>
                    <div className="stat-info">
                        <h3>{stats.totalProductos}</h3>
                        <p>Productos en Catálogo</p>
                    </div>
                </div>

                <div className="stat-card stat-green">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-info">
                        <h3>{stats.totalSucursales}</h3>
                        <p>Sucursales Activas</p>
                    </div>
                </div>

                <div className="stat-card stat-purple">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                        <h3>{stats.totalInventarios}</h3>
                        <p>Registros de Inventario</p>
                    </div>
                </div>

                <div className="stat-card stat-orange">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <h3>${stats.totalVentas.toFixed(2)}</h3>
                        <p>{stats.ventasCount || 0} Ventas Realizadas</p>
                    </div>
                </div>
            </div>

            {/* Alertas de Stock Bajo */}
            {stats.productosBajoStock.length > 0 && (
                <div className="alert-section">
                    <h3>⚠️ Alertas de Stock Bajo</h3>
                    <p className="alert-subtitle">Los siguientes productos necesitan reabastecimiento</p>
                    <div className="alert-list">
                        {stats.productosBajoStock.map((inv, idx) => (
                            <div key={idx} className="alert-item">
                                <span className="alert-badge">🔴 {inv.cantidad} unidades</span>
                                <span className="alert-product">
                                    {inv.medicamento?.nombre || `Producto ID: ${inv.medicamentoId}`}
                                </span>
                                <span className="alert-location">
                                    📍 {inv.sucursal?.nombre || `Sucursal ID: ${inv.sucursal?.id || inv.sucursalId}`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ventas Recientes */}
            <div className="recent-section">
                <h3>🛒 Ventas Recientes</h3>
                {stats.ventasRecientes.length > 0 ? (
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Fecha</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.ventasRecientes.map(venta => (
                                <tr key={venta.id}>
                                    <td><strong>#{venta.id}</strong></td>
                                    <td>{venta.cliente?.nombre || 'N/A'}</td>
                                    <td>{new Date(venta.fecha || venta.createdAt).toLocaleDateString()}</td>
                                    <td className="amount">${(venta.total || 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-data">
                        <span style={{ fontSize: '40px' }}>📋</span>
                        <p>No hay ventas registradas aún</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>⚡ Acciones Rápidas</h3>
                <div className="actions-grid">
                    <button className="action-btn" onClick={() => window.location.reload()}>
                        🔄 Actualizar Datos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardAdmin;
