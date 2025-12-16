import React, { useState, useEffect } from 'react';
import catalogoService from '../../services/catalogoService';
import './AdminTables.css';

const MedicamentosAdmin = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    codigoBarra: '',
    laboratorio: '',
    precioUnitario: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadMedicamentos();
  }, []);

  const loadMedicamentos = async () => {
    try {
      setLoading(true);
      const data = await catalogoService.getAllMedicamentos();
      setMedicamentos(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar medicamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await catalogoService.updateMedicamento(editingId, {
          ...formData,
          precioUnitario: parseFloat(formData.precioUnitario),
        });
        alert('Medicamento actualizado');
      } else {
        await catalogoService.createMedicamento({
          ...formData,
          precioUnitario: parseFloat(formData.precioUnitario),
        });
        alert('Medicamento creado');
      }
      resetForm();
      loadMedicamentos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (medicamento) => {
    setFormData({
      nombre: medicamento.nombre,
      codigoBarra: medicamento.codigoBarra,
      laboratorio: medicamento.laboratorio,
      precioUnitario: medicamento.precioUnitario.toString(),
    });
    setEditingId(medicamento.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este medicamento?')) return;
    try {
      await catalogoService.deleteMedicamento(id);
      alert('Medicamento eliminado');
      loadMedicamentos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar medicamento');
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', codigoBarra: '', laboratorio: '', precioUnitario: '' });
    setEditingId(null);
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="admin-section">
      <h2>💊 Gestión de Medicamentos</h2>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-grid">
          <input
            type="text"
            placeholder="Nombre del medicamento *"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Código de barra *"
            value={formData.codigoBarra}
            onChange={(e) => setFormData({ ...formData, codigoBarra: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Laboratorio *"
            value={formData.laboratorio}
            onChange={(e) => setFormData({ ...formData, laboratorio: e.target.value })}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Precio unitario *"
            value={formData.precioUnitario}
            onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })}
            required
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
              <th>Código</th>
              <th>Laboratorio</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {medicamentos.map(med => (
              <tr key={med.id}>
                <td>{med.id}</td>
                <td>{med.nombre}</td>
                <td>{med.codigoBarra}</td>
                <td>{med.laboratorio}</td>
                <td>${med.precioUnitario.toFixed(2)}</td>
                <td className="actions">
                  <button onClick={() => handleEdit(med)} className="btn-edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(med.id)} className="btn-delete">
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

export default MedicamentosAdmin;
