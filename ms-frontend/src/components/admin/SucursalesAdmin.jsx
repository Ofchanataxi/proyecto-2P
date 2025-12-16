import React, { useState, useEffect } from 'react';
import inventarioService from '../../services/inventarioService';
import './AdminTables.css';

const SucursalesAdmin = () => {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadSucursales();
  }, []);

  const loadSucursales = async () => {
    try {
      setLoading(true);
      const data = await inventarioService.getAllSucursales();
      setSucursales(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar sucursales');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await inventarioService.updateSucursal(editingId, formData);
        alert('Sucursal actualizada');
      } else {
        await inventarioService.createSucursal(formData);
        alert('Sucursal creada');
      }
      resetForm();
      loadSucursales();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (sucursal) => {
    setFormData({
      nombre: sucursal.nombre,
      direccion: sucursal.direccion,
      telefono: sucursal.telefono || '',
    });
    setEditingId(sucursal.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta sucursal?')) return;
    try {
      await inventarioService.deleteSucursal(id);
      alert('Sucursal eliminada');
      loadSucursales();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar sucursal');
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', direccion: '', telefono: '' });
    setEditingId(null);
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="admin-section">
      <h2>📍 Gestión de Sucursales</h2>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-grid">
          <input
            type="text"
            placeholder="Nombre de la sucursal *"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Dirección *"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {editingId ? '✏️ Actualizar' : '➕ Crear'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-cancel">
              ❌ Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sucursales.map(suc => (
              <tr key={suc.id}>
                <td>{suc.id}</td>
                <td>{suc.nombre}</td>
                <td>{suc.direccion}</td>
                <td>{suc.telefono || 'N/A'}</td>
                <td className="actions">
                  <button onClick={() => handleEdit(suc)} className="btn-edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(suc.id)} className="btn-delete">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SucursalesAdmin;
