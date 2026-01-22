import React, { useState, useEffect } from 'react';
import inventarioService from '../../services/inventarioService';
import catalogoService from '../../services/catalogoService';
import './AdminTables.css';

const InventarioAdmin = () => {
  const [sucursales, setSucursales] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [inventarios, setInventarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sucursalFiltro, setSucursalFiltro] = useState('');
  const [formData, setFormData] = useState({
    sucursalId: '',
    medicamentoId: '',
    stock: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (sucursalFiltro && medicamentos.length > 0) {
      loadInventarioPorSucursal();
    }
  }, [sucursalFiltro]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sucursalesData, medicamentosData] = await Promise.all([
        inventarioService.getAllSucursales(),
        catalogoService.getAllMedicamentos(),
      ]);
      setSucursales(sucursalesData);
      setMedicamentos(medicamentosData);
      if (sucursalesData.length > 0) {
        setSucursalFiltro(sucursalesData[0].id);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const loadInventarioPorSucursal = async () => {
    if (!sucursalFiltro) return;
    
    try {
      // Usar el nuevo endpoint que trae todos los inventarios de una sucursal
      const inventariosData = await inventarioService.getInventariosPorSucursal(sucursalFiltro);
      
      // Mapear los inventarios agregando el nombre del medicamento
      const inventariosConNombre = inventariosData.map(inv => ({
        id: inv.id,
        sucursalId: inv.sucursal.id,
        medicamentoId: inv.medicamentoId,
        medicamentoNombre: getMedicamentoNombrePorId(inv.medicamentoId),
        stock: inv.cantidad || 0,
      }));
      
      setInventarios(inventariosConNombre);
    } catch (error) {
      console.error('Error cargando inventarios:', error);
      setInventarios([]);
    }
  };

  const getMedicamentoNombrePorId = (id) => {
    const med = medicamentos.find(m => m.id === id);
    return med ? med.nombre : 'Desconocido';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode && editId) {
        // Modo edición: actualizar cantidad existente
        await inventarioService.updateInventario(editId, parseInt(formData.stock));
        alert('Stock actualizado correctamente');
      } else {
        // Modo creación: agregar nuevo stock
        const inventarioData = {
          sucursal: { id: parseInt(formData.sucursalId) },
          medicamentoId: parseInt(formData.medicamentoId),
          cantidad: parseInt(formData.stock),
        };
        await inventarioService.createInventario(inventarioData);
        alert('Stock agregado correctamente');
      }
      resetForm();
      loadInventarioPorSucursal();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (inventario) => {
    setFormData({
      sucursalId: inventario.sucursalId,
      medicamentoId: inventario.medicamentoId,
      stock: inventario.stock,
    });
    setEditMode(true);
    setEditId(inventario.id);
  };

  const resetForm = () => {
    setFormData({ sucursalId: '', medicamentoId: '', stock: '' });
    setEditMode(false);
    setEditId(null);
  };

  const getMedicamentoNombre = (id) => {
    const med = medicamentos.find(m => m.id === id);
    return med ? med.nombre : 'Desconocido';
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="admin-section">
      <h2>📦 Gestión de Inventario por Sucursal</h2>

      <div className="info-box">
        <p>💡 <strong>Nota:</strong> Aquí puedes agregar y gestionar el stock de medicamentos en cada sucursal.</p>
      </div>

      {/* Filtro de Sucursal */}
      <div className="filter-section" style={{ marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>📍 Sucursal:</label>
        <select
          value={sucursalFiltro}
          onChange={(e) => setSucursalFiltro(e.target.value)}
          style={{ padding: '8px', fontSize: '14px', minWidth: '300px' }}
        >
          {sucursales.map(suc => (
            <option key={suc.id} value={suc.id}>
              {suc.nombre} - {suc.direccion}
            </option>
          ))}
        </select>
      </div>

      {/* Formulario para agregar/editar stock */}
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>{editMode ? '✏️ Editar Stock' : '➕ Agregar Nuevo Stock'}</h3>
        <div className="form-grid">
          <select
            value={formData.sucursalId}
            onChange={(e) => setFormData({ ...formData, sucursalId: e.target.value })}
            required
            disabled={editMode}
          >
            <option value="">Seleccionar Sucursal *</option>
            {sucursales.map(suc => (
              <option key={suc.id} value={suc.id}>
                {suc.nombre} - {suc.direccion}
              </option>
            ))}
          </select>

          <select
            value={formData.medicamentoId}
            onChange={(e) => setFormData({ ...formData, medicamentoId: e.target.value })}
            required
            disabled={editMode}
          >
            <option value="">Seleccionar Medicamento *</option>
            {medicamentos.map(med => (
              <option key={med.id} value={med.id}>
                {med.nombre} - ${med.precioUnitario}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Cantidad en Stock *"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
            min="0"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {editMode ? '💾 Actualizar Stock' : '➕ Agregar Stock'}
          </button>
          {editMode && (
            <button type="button" onClick={resetForm} className="btn-cancel">
              ❌ Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabla de inventarios */}
      <div className="table-container">
        <h3>📊 Inventario en {sucursales.find(s => s.id === parseInt(sucursalFiltro))?.nombre || 'la sucursal seleccionada'}</h3>
        {inventarios.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No hay inventario registrado para esta sucursal. Agrega medicamentos usando el formulario arriba.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Medicamento</th>
                <th>Stock Disponible</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventarios.map(inv => (
                <tr key={inv.id}>
                  <td>{inv.id}</td>
                  <td>{inv.medicamentoNombre}</td>
                  <td>
                    <strong style={{ fontSize: '16px', color: inv.stock > 10 ? '#2e7d32' : inv.stock > 0 ? '#ed6c02' : '#d32f2f' }}>
                      {inv.stock} unidades
                    </strong>
                  </td>
                  <td>
                    {inv.stock > 10 ? (
                      <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>✅ Buen Stock</span>
                    ) : inv.stock > 0 ? (
                      <span style={{ color: '#ed6c02', fontWeight: 'bold' }}>⚠️ Stock Bajo</span>
                    ) : (
                      <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>❌ Sin Stock</span>
                    )}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEdit(inv)} 
                      className="btn-edit"
                      title="Editar stock"
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="table-info">
        <h3>📋 Instrucciones</h3>
        <ul>
          <li>✅ Selecciona una sucursal para ver su inventario actual</li>
          <li>➕ Usa el formulario para agregar stock de nuevos medicamentos</li>
          <li>✏️ Haz clic en el botón editar para modificar el stock existente</li>
          <li>📊 El sistema muestra alertas visuales para stock bajo o agotado</li>
        </ul>
      </div>
    </div>
  );
};

export default InventarioAdmin;
