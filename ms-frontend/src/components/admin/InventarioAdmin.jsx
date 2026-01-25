import React, { useState, useEffect } from 'react';
import { inventarioService } from '../../services/inventarioService';
import { catalogoService } from '../../services/catalogoService';
import Modal from '../Modal';
import './AdminTables.css';

const InventarioAdmin = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('productos');

  // Data states
  const [sucursales, setSucursales] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [inventarios, setInventarios] = useState([]);

  // Mobiliario/Equipamiento (local state - can be connected to backend)
  const [mobiliario, setMobiliario] = useState([
    { id: 1, nombre: 'Estantería Metálica Grande', tipo: 'Estantería', cantidad: 5, ubicacion: 'Almacén', estado: 'Bueno' },
    { id: 2, nombre: 'Vitrina Exhibidora LED', tipo: 'Vitrina', cantidad: 3, ubicacion: 'Mostrador', estado: 'Bueno' },
    { id: 3, nombre: 'Refrigerador Medicamentos', tipo: 'Refrigerador', cantidad: 2, ubicacion: 'Almacén', estado: 'Excelente' },
    { id: 4, nombre: 'Mostrador de Atención', tipo: 'Mostrador', cantidad: 1, ubicacion: 'Entrada', estado: 'Bueno' },
    { id: 5, nombre: 'Góndola Central', tipo: 'Góndola', cantidad: 4, ubicacion: 'Pasillo', estado: 'Regular' },
  ]);

  // Form states
  const [formData, setFormData] = useState({ sucursalId: '', medicamentoId: '', cantidad: '' });
  const [mobiliarioForm, setMobiliarioForm] = useState({ nombre: '', tipo: '', cantidad: '', ubicacion: '', estado: 'Bueno' });
  const [editingMobiliario, setEditingMobiliario] = useState(null);

  // UI states
  const [currentStock, setCurrentStock] = useState(null);
  const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '', type: 'success' });
  const [filterSucursal, setFilterSucursal] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ show: false, item: null, type: '' });

  // Tipos de mobiliario
  const tiposMobiliario = ['Estantería', 'Vitrina', 'Refrigerador', 'Mostrador', 'Góndola', 'Silla', 'Mesa', 'Armario', 'Caja Registradora', 'Otro'];
  const ubicaciones = ['Almacén', 'Mostrador', 'Entrada', 'Pasillo', 'Oficina', 'Bodega'];
  const estados = ['Excelente', 'Bueno', 'Regular', 'Necesita Reparación', 'Fuera de Servicio'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.sucursalId && formData.medicamentoId && inventarios.length > 0) {
      const parsedSucursal = parseInt(formData.sucursalId);
      const parsedMed = parseInt(formData.medicamentoId);

      const existing = inventarios.find(inv =>
        (inv.sucursal?.id === parsedSucursal || inv.sucursal === parsedSucursal) &&
        (inv.medicamento?.id === parsedMed || inv.medicamento === parsedMed || inv.medicamentoId === parsedMed)
      );

      setCurrentStock(existing ? existing.cantidad : 0);
    } else {
      setCurrentStock(null);
    }
  }, [formData.sucursalId, formData.medicamentoId, inventarios]);

  const loadData = async () => {
    try {
      const [sucs, meds, invs] = await Promise.all([
        inventarioService.getSucursales(),
        catalogoService.getMedicamentos(),
        inventarioService.getInventarios().catch(() => [])
      ]);
      setSucursales(sucs || []);
      setMedicamentos(meds || []);
      setInventarios(invs || []);
    } catch (error) {
      console.error(error);
    }
  };

  const getMedicamentoName = (inv) => {
    if (inv.medicamento?.nombre) return inv.medicamento.nombre;
    const med = medicamentos.find(m => m.id === inv.medicamentoId);
    return med ? med.nombre : `ID: ${inv.medicamentoId}`;
  };

  const getSucursalName = (inv) => {
    if (inv.sucursal?.nombre) return inv.sucursal.nombre;
    return `Sucursal ID: ${inv.sucursal?.id || 'N/A'}`;
  };

  // PRODUCTOS/MEDICAMENTOS handlers
  const handleSubmitProducto = async (e) => {
    e.preventDefault();
    if (!formData.sucursalId || !formData.medicamentoId) {
      setModalInfo({ isOpen: true, message: "Selecciona todos los campos", type: 'error' });
      return;
    }

    try {
      const payload = {
        sucursal: { id: parseInt(formData.sucursalId) },
        medicamentoId: parseInt(formData.medicamentoId),
        cantidad: parseInt(formData.cantidad)
      };
      await inventarioService.createInventario(payload);
      setModalInfo({ isOpen: true, message: '✅ Stock asignado/actualizado correctamente', type: 'success' });
      setFormData({ ...formData, cantidad: '' });
      loadData();
    } catch (err) {
      setModalInfo({ isOpen: true, message: '❌ Error al guardar. Verifique los datos.', type: 'error' });
    }
  };

  // MOBILIARIO handlers
  const handleSubmitMobiliario = (e) => {
    e.preventDefault();
    if (!mobiliarioForm.nombre || !mobiliarioForm.tipo || !mobiliarioForm.cantidad) {
      setModalInfo({ isOpen: true, message: "Completa todos los campos requeridos", type: 'error' });
      return;
    }

    if (editingMobiliario) {
      setMobiliario(mobiliario.map(m =>
        m.id === editingMobiliario.id ? { ...m, ...mobiliarioForm, cantidad: parseInt(mobiliarioForm.cantidad) } : m
      ));
      setModalInfo({ isOpen: true, message: '✅ Mobiliario actualizado correctamente', type: 'success' });
      setEditingMobiliario(null);
    } else {
      const newItem = {
        id: Date.now(),
        ...mobiliarioForm,
        cantidad: parseInt(mobiliarioForm.cantidad)
      };
      setMobiliario([...mobiliario, newItem]);
      setModalInfo({ isOpen: true, message: '✅ Mobiliario agregado correctamente', type: 'success' });
    }
    setMobiliarioForm({ nombre: '', tipo: '', cantidad: '', ubicacion: '', estado: 'Bueno' });
  };

  const handleEditMobiliario = (item) => {
    setEditingMobiliario(item);
    setMobiliarioForm({
      nombre: item.nombre,
      tipo: item.tipo,
      cantidad: item.cantidad.toString(),
      ubicacion: item.ubicacion,
      estado: item.estado
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = () => {
    if (confirmDelete.type === 'mobiliario') {
      setMobiliario(mobiliario.filter(m => m.id !== confirmDelete.item.id));
      setModalInfo({ isOpen: true, message: '✅ Mobiliario eliminado', type: 'success' });
    }
    setConfirmDelete({ show: false, item: null, type: '' });
  };

  const getStockStatus = (cantidad) => {
    if (cantidad === 0) return { class: 'stock-empty', label: 'Sin Stock' };
    if (cantidad < 10) return { class: 'stock-low', label: 'Stock Bajo' };
    if (cantidad < 50) return { class: 'stock-medium', label: 'Normal' };
    return { class: 'stock-high', label: 'Óptimo' };
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Excelente': return 'stock-high';
      case 'Bueno': return 'stock-medium';
      case 'Regular': return 'stock-low';
      default: return 'stock-empty';
    }
  };

  const filteredInventarios = filterSucursal
    ? inventarios.filter(inv => (inv.sucursal?.id || inv.sucursalId) == filterSucursal)
    : inventarios;

  return (
    <div className="admin-section">
      <Modal
        isOpen={modalInfo.isOpen}
        onClose={() => setModalInfo({ ...modalInfo, isOpen: false })}
        message={modalInfo.message}
        type={modalInfo.type}
      />

      <Modal
        isOpen={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false, item: null, type: '' })}
        onConfirm={handleDeleteConfirm}
        message="¿Estás seguro de eliminar este elemento?"
        type="confirm"
      />

      <h2>📦 Gestión de Inventario</h2>

      {/* TABS */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'productos' ? 'active' : ''}`}
          onClick={() => setActiveTab('productos')}
        >
          💊 Productos / Medicamentos
        </button>
        <button
          className={`tab-btn ${activeTab === 'mobiliario' ? 'active' : ''}`}
          onClick={() => setActiveTab('mobiliario')}
        >
          🪑 Mobiliario / Equipamiento
        </button>
        <button
          className={`tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          📊 Control de Stock
        </button>
      </div>

      {/* TAB: PRODUCTOS */}
      {activeTab === 'productos' && (
        <div className="tab-content">
          <div className="admin-split-layout">
            <div className="form-card">
              <h3>➕ Asignar Stock a Sucursal</h3>
              <form onSubmit={handleSubmitProducto} className="admin-form">
                <div className="form-group">
                  <label>Sucursal *</label>
                  <select
                    value={formData.sucursalId}
                    onChange={e => setFormData({ ...formData, sucursalId: e.target.value })}
                    required
                  >
                    <option value="">-- Seleccionar Sucursal --</option>
                    {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Medicamento *</label>
                  <select
                    value={formData.medicamentoId}
                    onChange={e => setFormData({ ...formData, medicamentoId: e.target.value })}
                    required
                  >
                    <option value="">-- Seleccionar Medicamento --</option>
                    {medicamentos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>

                {currentStock !== null && (
                  <div className="stock-info-card">
                    <span>📊 Stock Actual:</span>
                    <strong>{currentStock} unidades</strong>
                  </div>
                )}

                <div className="form-group">
                  <label>Cantidad a Agregar/Asignar *</label>
                  <input
                    type="number"
                    placeholder="Ej: 50"
                    value={formData.cantidad}
                    onChange={e => setFormData({ ...formData, cantidad: e.target.value })}
                    required
                    min="1"
                  />
                </div>

                <button type="submit" className="btn-submit">💾 Guardar Inventario</button>
              </form>
            </div>

            <div className="illustration-card">
              <div className="illustration-placeholder">
                <span style={{ fontSize: '50px' }}>📦</span>
                <h3>Control de Stock</h3>
                <p>Gestiona el stock de tus farmacias de manera centralizada.</p>
                <ul className="stats-mini">
                  <li>🏢 {sucursales.length} Sucursales</li>
                  <li>💊 {medicamentos.length} Productos</li>
                  <li>📋 {inventarios.length} Registros</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tabla de Inventarios de Productos */}
          <div className="list-card" style={{ marginTop: '30px' }}>
            <div className="list-header">
              <h3>📋 Inventario por Sucursal</h3>
              <div className="filter-section">
                <label>Filtrar por sucursal:</label>
                <select value={filterSucursal} onChange={e => setFilterSucursal(e.target.value)}>
                  <option value="">Todas las sucursales</option>
                  {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
            </div>

            {filteredInventarios.length === 0 ? (
              <div className="no-data" style={{ padding: '40px', textAlign: 'center' }}>
                <span style={{ fontSize: '50px' }}>📦</span>
                <p>No hay registros de inventario {filterSucursal ? 'para esta sucursal' : ''}.</p>
                <p style={{ color: '#64748b' }}>Usa el formulario de arriba para asignar stock.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Sucursal</th>
                    <th>Medicamento</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventarios.map((inv, idx) => {
                    const status = getStockStatus(inv.cantidad);
                    return (
                      <tr key={inv.id || idx}>
                        <td><strong>#{inv.id || idx + 1}</strong></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🏥</span>
                            {getSucursalName(inv)}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>💊</span>
                            {getMedicamentoName(inv)}
                          </div>
                        </td>
                        <td>
                          <strong style={{ fontSize: '16px' }}>{inv.cantidad}</strong>
                          <small> unidades</small>
                        </td>
                        <td>
                          <span className={`stock-badge ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-edit"
                            onClick={() => {
                              setFormData({
                                sucursalId: inv.sucursal?.id || '',
                                medicamentoId: inv.medicamentoId || inv.medicamento?.id || '',
                                cantidad: ''
                              });
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            title="Modificar stock"
                          >
                            ✏️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB: MOBILIARIO Y EQUIPAMIENTO */}
      {activeTab === 'mobiliario' && (
        <div className="tab-content">
          <div className="admin-split-layout">
            <div className="form-card">
              <h3>{editingMobiliario ? '✏️ Editar Mobiliario' : '➕ Agregar Mobiliario'}</h3>
              <form onSubmit={handleSubmitMobiliario} className="admin-form">
                <div className="form-group">
                  <label>Nombre del Artículo *</label>
                  <input
                    type="text"
                    placeholder="Ej: Estantería Metálica Grande"
                    value={mobiliarioForm.nombre}
                    onChange={e => setMobiliarioForm({ ...mobiliarioForm, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tipo *</label>
                  <select
                    value={mobiliarioForm.tipo}
                    onChange={e => setMobiliarioForm({ ...mobiliarioForm, tipo: e.target.value })}
                    required
                  >
                    <option value="">-- Seleccionar Tipo --</option>
                    {tiposMobiliario.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Cantidad *</label>
                  <input
                    type="number"
                    placeholder="Ej: 5"
                    value={mobiliarioForm.cantidad}
                    onChange={e => setMobiliarioForm({ ...mobiliarioForm, cantidad: e.target.value })}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Ubicación</label>
                  <select
                    value={mobiliarioForm.ubicacion}
                    onChange={e => setMobiliarioForm({ ...mobiliarioForm, ubicacion: e.target.value })}
                  >
                    <option value="">-- Seleccionar Ubicación --</option>
                    {ubicaciones.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select
                    value={mobiliarioForm.estado}
                    onChange={e => setMobiliarioForm({ ...mobiliarioForm, estado: e.target.value })}
                  >
                    {estados.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-submit">
                    {editingMobiliario ? '💾 Actualizar' : '➕ Agregar'}
                  </button>
                  {editingMobiliario && (
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setEditingMobiliario(null);
                        setMobiliarioForm({ nombre: '', tipo: '', cantidad: '', ubicacion: '', estado: 'Bueno' });
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="illustration-card">
              <div className="illustration-placeholder">
                <span style={{ fontSize: '50px' }}>🪑</span>
                <h3>Mobiliario y Equipamiento</h3>
                <p>Gestiona estanterías, vitrinas, refrigeradores y otros activos de la farmacia.</p>
                <ul className="stats-mini">
                  <li>🗄️ {mobiliario.filter(m => m.tipo === 'Estantería').length} Estanterías</li>
                  <li>🪟 {mobiliario.filter(m => m.tipo === 'Vitrina').length} Vitrinas</li>
                  <li>❄️ {mobiliario.filter(m => m.tipo === 'Refrigerador').length} Refrigeradores</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tabla de Mobiliario */}
          <div className="list-card" style={{ marginTop: '30px' }}>
            <h3>📋 Lista de Mobiliario y Equipamiento</h3>
            {mobiliario.length === 0 ? (
              <div className="no-data">
                <span style={{ fontSize: '50px' }}>🪑</span>
                <p>No hay mobiliario registrado.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Ubicación</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {mobiliario.map(item => (
                    <tr key={item.id}>
                      <td><strong>#{item.id}</strong></td>
                      <td>{item.nombre}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {item.tipo === 'Estantería' && '🗄️'}
                          {item.tipo === 'Vitrina' && '🪟'}
                          {item.tipo === 'Refrigerador' && '❄️'}
                          {item.tipo === 'Mostrador' && '🛒'}
                          {item.tipo === 'Góndola' && '📚'}
                          {item.tipo}
                        </span>
                      </td>
                      <td><strong>{item.cantidad}</strong></td>
                      <td>{item.ubicacion || '-'}</td>
                      <td>
                        <span className={`stock-badge ${getEstadoClass(item.estado)}`}>
                          {item.estado}
                        </span>
                      </td>
                      <td className="actions">
                        <button className="btn-edit" onClick={() => handleEditMobiliario(item)} title="Editar">
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => setConfirmDelete({ show: true, item, type: 'mobiliario' })}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB: CONTROL DE STOCK */}
      {activeTab === 'stock' && (
        <div className="tab-content">
          <div className="list-card">
            <h3>📊 Resumen General de Stock</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div className="stock-info-card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderLeftColor: '#16a34a' }}>
                <span>✅ Stock Óptimo</span>
                <strong style={{ color: '#16a34a' }}>{inventarios.filter(i => i.cantidad >= 50).length}</strong>
              </div>
              <div className="stock-info-card" style={{ background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)', borderLeftColor: '#ca8a04' }}>
                <span>⚠️ Stock Normal</span>
                <strong style={{ color: '#ca8a04' }}>{inventarios.filter(i => i.cantidad >= 10 && i.cantidad < 50).length}</strong>
              </div>
              <div className="stock-info-card" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', borderLeftColor: '#ea580c' }}>
                <span>🔸 Stock Bajo</span>
                <strong style={{ color: '#ea580c' }}>{inventarios.filter(i => i.cantidad > 0 && i.cantidad < 10).length}</strong>
              </div>
              <div className="stock-info-card" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', borderLeftColor: '#dc2626' }}>
                <span>❌ Sin Stock</span>
                <strong style={{ color: '#dc2626' }}>{inventarios.filter(i => i.cantidad === 0).length}</strong>
              </div>
            </div>

            <h4 style={{ marginTop: '20px', color: '#003d7a' }}>🚨 Productos con Stock Bajo o Agotado</h4>
            {inventarios.filter(i => i.cantidad < 10).length === 0 ? (
              <div className="no-data">
                <span style={{ fontSize: '40px' }}>✅</span>
                <p>¡Todos los productos tienen stock suficiente!</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sucursal</th>
                    <th>Producto</th>
                    <th>Stock Actual</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {inventarios.filter(i => i.cantidad < 10).map((inv, idx) => {
                    const status = getStockStatus(inv.cantidad);
                    return (
                      <tr key={inv.id || idx}>
                        <td>{getSucursalName(inv)}</td>
                        <td>{getMedicamentoName(inv)}</td>
                        <td><strong>{inv.cantidad}</strong></td>
                        <td>
                          <span className={`stock-badge ${status.class}`}>{status.label}</span>
                        </td>
                        <td>
                          <button
                            className="btn-submit"
                            style={{ padding: '8px 16px', fontSize: '14px' }}
                            onClick={() => {
                              setActiveTab('productos');
                              setFormData({
                                sucursalId: inv.sucursal?.id || '',
                                medicamentoId: inv.medicamentoId || inv.medicamento?.id || '',
                                cantidad: ''
                              });
                              setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                            }}
                          >
                            ➕ Reabastecer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioAdmin;