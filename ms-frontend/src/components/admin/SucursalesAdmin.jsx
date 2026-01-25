import React, { useState, useEffect } from 'react';
import inventarioService from '../../services/inventarioService';
import Modal from '../Modal';
import '../../pages/SucursalesAdmin.css';
import '../admin/AdminTables.css';

const SucursalesAdmin = () => {
  const [sucursales, setSucursales] = useState([]);
  const [form, setForm] = useState({ nombre: '', direccion: '' });
  const [loading, setLoading] = useState(false);
  const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  useEffect(() => {
    loadSucursales();
  }, []);

  const loadSucursales = async () => {
    try {
      setLoading(true);
      const data = await inventarioService.getSucursales();
      setSucursales(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error loading sucursales", e);
    } finally {
      setLoading(false);
    }
  };

  const showModal = (message, type = 'success') => {
    setModalInfo({ isOpen: true, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventarioService.createSucursal(form);
      setForm({ nombre: '', direccion: '' });
      loadSucursales();
      showModal('✅ Sucursal creada correctamente', 'success');
    } catch (e) {
      console.error("Error creating sucursal", e);
      showModal('❌ Error al crear la sucursal', 'error');
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete({ show: true, id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await inventarioService.deleteSucursal(confirmDelete.id);
      loadSucursales();
      showModal('✅ Sucursal eliminada correctamente', 'success');
    } catch (e) {
      console.error(e);
      showModal('❌ Error al eliminar la sucursal', 'error');
    }
    setConfirmDelete({ show: false, id: null });
  };

  return (
    <div className="admin-content-inner">
      <Modal
        isOpen={modalInfo.isOpen}
        onClose={() => setModalInfo({ ...modalInfo, isOpen: false })}
        message={modalInfo.message}
        type={modalInfo.type}
      />

      <Modal
        isOpen={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false, id: null })}
        onConfirm={handleDeleteConfirm}
        message="¿Estás seguro de eliminar esta sucursal? Esta acción no se puede deshacer."
        type="confirm"
      />

      <div className="admin-split-layout">
        <div className="form-card">
          <h3>➕ Nueva Sucursal</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Nombre de la Sucursal *</label>
              <input
                placeholder="Ej: Farmacia Centro"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Dirección *</label>
              <input
                placeholder="Ej: Av. Amazonas y Naciones Unidas"
                value={form.direccion}
                onChange={e => setForm({ ...form, direccion: e.target.value })}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save">Crear Sucursal</button>
            </div>
          </form>
        </div>

        <div className="illustration-card">
          <div className="illustration-placeholder">
            <span style={{ fontSize: '60px' }}>📍</span>
            <h3>Gestiona tus Puntos de Venta</h3>
            <p>Mantén actualizada la red de farmacias para que tus clientes siempre encuentren lo que buscan.</p>
            <ul className="stats-mini">
              <li>🏢 {sucursales.length} Sucursales</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="list-card" style={{ marginTop: '30px' }}>
        <h3>📋 Lista de Sucursales Actuales</h3>
        <p style={{ marginBottom: '15px', color: '#666' }}>
          Total de sucursales activas: <strong>{sucursales.length}</strong>
        </p>

        {loading ? <div className="loading">Cargando datos...</div> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sucursales.map(s => (
                <tr key={s.id}>
                  <td><strong>#{s.id}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>🏥</span>
                      {s.nombre}
                    </div>
                  </td>
                  <td>{s.direccion}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteClick(s.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {sucursales.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                    No hay sucursales registradas. ¡Añade la primera!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SucursalesAdmin;