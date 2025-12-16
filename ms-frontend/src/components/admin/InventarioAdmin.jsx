import React, { useState, useEffect } from 'react';
import inventarioService from '../../services/inventarioService';
import catalogoService from '../../services/catalogoService';
import './AdminTables.css';

const InventarioAdmin = () => {
  const [sucursales, setSucursales] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    sucursalId: '',
    medicamentoId: '',
    cantidad: '',
  });
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sucursalesData, medicamentosData] = await Promise.all([
        inventarioService.getAllSucursales(),
        catalogoService.getAllMedicamentos(),
      ]);
      setSucursales(sucursalesData);
      setMedicamentos(medicamentosData);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const inventarioData = {
        sucursal: { id: parseInt(formData.sucursalId) },
        medicamentoId: parseInt(formData.medicamentoId),
        cantidad: parseInt(formData.cantidad),
      };
      await inventarioService.createInventario(inventarioData);
      alert('Inventario creado/actualizado');
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleVerificar = async () => {
    if (!formData.sucursalId || !formData.medicamentoId) {
      alert('Selecciona sucursal y medicamento');
      return;
    }
    try {
      const result = await inventarioService.verificarDisponibilidad(
        formData.sucursalId,
        formData.medicamentoId
      );
      setSearchResult(result);
    } catch (error) {
      console.error('Error:', error);
      alert('No se encontró inventario para esta combinación');
      setSearchResult(null);
    }
  };

  const resetForm = () => {
    setFormData({ sucursalId: '', medicamentoId: '', cantidad: '' });
    setSearchResult(null);
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="admin-section">
      <h2>📦 Gestión de Inventario</h2>

      <div className="info-box">
        <p>💡 <strong>Nota:</strong> Aquí puedes agregar stock inicial o verificar disponibilidad de medicamentos en sucursales.</p>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-grid">
          <select
            value={formData.sucursalId}
            onChange={(e) => setFormData({ ...formData, sucursalId: e.target.value })}
            required
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
            placeholder="Cantidad *"
            value={formData.cantidad}
            onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
            required
            min="0"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            ➕ Agregar al Inventario
          </button>
          <button type="button" onClick={handleVerificar} className="btn-secondary">
            🔍 Verificar Stock
          </button>
          <button type="button" onClick={resetForm} className="btn-cancel">
            🔄 Limpiar
          </button>
        </div>
      </form>

      {searchResult && (
        <div className="result-box">
          <h3>📊 Resultado de la Búsqueda</h3>
          <div className="result-content">
            <p><strong>ID:</strong> {searchResult.id}</p>
            <p><strong>Sucursal:</strong> {searchResult.sucursal?.nombre}</p>
            <p><strong>Medicamento ID:</strong> {searchResult.medicamentoId}</p>
            <p><strong>Medicamento:</strong> {searchResult.medicamento?.nombre || 'N/A'}</p>
            <p><strong>Cantidad Disponible:</strong> 
              <span className={`stock ${searchResult.cantidad > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {searchResult.cantidad} unidades
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="table-info">
        <h3>📋 Información</h3>
        <ul>
          <li>✅ Usa el formulario para agregar stock inicial a cualquier sucursal</li>
          <li>🔍 Verifica el stock disponible antes de agregar más</li>
          <li>📊 Las ventas descontarán automáticamente del inventario</li>
          <li>⚠️ Si el medicamento ya existe en la sucursal, se actualizará la cantidad</li>
        </ul>
      </div>
    </div>
  );
};

export default InventarioAdmin;
