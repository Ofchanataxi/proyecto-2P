import React, { useState, useEffect } from 'react';
import inventarioService from '../../services/inventarioService'; // Default import
import '../../pages/SucursalesAdmin.css'; // Importando los nuevos estilos

const SucursalesAdmin = () => {
  const [sucursales, setSucursales] = useState([]);
  const [form, setForm] = useState({ nombre: '', direccion: '' });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventarioService.createSucursal(form);
      setForm({ nombre: '', direccion: '' });
      loadSucursales();
      alert('Sucursal creada correctamente');
    } catch (e) {
      console.error("Error creating sucursal", e);
      alert('Error al crear sucursal');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar sucursal?')) {
      try {
        await inventarioService.deleteSucursal(id);
        loadSucursales();
      } catch (e) {
        console.error(e);
      }
    }
  }

  return (
    <div className="admin-content-inner">
      <div className="form-card">
        <h3>Gestionar Sucursales</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Nombre de la Sucursal</label>
            <input
              placeholder="Ej: Farmacia Centro"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Dirección</label>
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

      <div className="list-card" style={{ marginTop: '30px' }}>
        <h3>Lista de Sucursales</h3>
        {loading ? <p>Cargando...</p> : (
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
                  <td>{s.id}</td>
                  <td>{s.nombre}</td>
                  <td>{s.direccion}</td>
                  <td>
                    <button className="btn-icon delete" onClick={() => handleDelete(s.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SucursalesAdmin;