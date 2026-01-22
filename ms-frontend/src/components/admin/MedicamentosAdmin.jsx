import React, { useState, useEffect } from 'react';
import { catalogoService } from '../../services/catalogoService';
import './AdminTables.css';

const MedicamentosAdmin = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  // Estado inicial basado exactamente en tu entidad Medicamento.java
  const [formData, setFormData] = useState({
    nombre: '',
    codigoBarra: '',
    laboratorio: '',
    precioUnitario: '',
    categoria: '',
    imagenUrl: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadMedicamentos();
  }, []);

  const loadMedicamentos = async () => {
    try {
      setLoading(true);
      const data = await catalogoService.getAllMedicamentos();
      setMedicamentos(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar precio
    const precio = parseFloat(formData.precioUnitario);
    if (isNaN(precio) || precio <= 0) {
        alert("El precio debe ser mayor a 0");
        return;
    }

    try {
      // Payload exacto para Medicamento.java
      const medicamentoPayload = {
          ...formData,
          precioUnitario: precio
      };

      if (editingId) {
        await catalogoService.updateMedicamento(editingId, medicamentoPayload);
        alert('✅ Medicamento actualizado');
      } else {
        await catalogoService.createMedicamento(medicamentoPayload);
        alert('✅ Medicamento creado');
      }
      resetForm();
      loadMedicamentos();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al guardar. Verifica que el Código de Barra no esté duplicado.');
    }
  };

  const handleEdit = (med) => {
    setFormData({
      nombre: med.nombre,
      codigoBarra: med.codigoBarra,
      laboratorio: med.laboratorio,
      precioUnitario: med.precioUnitario,
      categoria: med.categoria || '',
      imagenUrl: med.imagenUrl || ''
    });
    setEditingId(med.id);
  };

  const handleDelete = async (id) => {
      if(!window.confirm("¿Estás seguro de eliminar este medicamento?")) return;
      try {
          await catalogoService.deleteMedicamento(id);
          loadMedicamentos();
      } catch (error) {
          alert("Error al eliminar");
      }
  };

  const resetForm = () => {
    setFormData({ 
        nombre: '', 
        codigoBarra: '', 
        laboratorio: '', 
        precioUnitario: '', 
        categoria: '', 
        imagenUrl: '' 
    });
    setEditingId(null);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="admin-section">
      <h2>💊 Gestión de Medicamentos</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-grid">
            {/* Fila 1 */}
            <input 
                placeholder="Nombre *" 
                value={formData.nombre} 
                onChange={e => setFormData({...formData, nombre: e.target.value})} 
                required 
            />
            <input 
                placeholder="Código de Barra *" 
                value={formData.codigoBarra} 
                onChange={e => setFormData({...formData, codigoBarra: e.target.value})} 
                required 
            />
            
            {/* Fila 2 */}
            <input 
                placeholder="Laboratorio *" 
                value={formData.laboratorio} 
                onChange={e => setFormData({...formData, laboratorio: e.target.value})} 
                required 
            />
            <input 
                type="number" 
                step="0.01" 
                placeholder="Precio (Ej: 12.50) *" 
                value={formData.precioUnitario} 
                onChange={e => setFormData({...formData, precioUnitario: e.target.value})} 
                required 
            />

            {/* Fila 3 - Opcionales */}
            <input 
                placeholder="Categoría" 
                value={formData.categoria} 
                onChange={e => setFormData({...formData, categoria: e.target.value})} 
            />
            <input 
                placeholder="URL de Imagen" 
                value={formData.imagenUrl} 
                onChange={e => setFormData({...formData, imagenUrl: e.target.value})} 
            />
        </div>
        
        <div className="form-actions" style={{marginTop: '15px'}}>
            <button type="submit" className="btn-submit">
                {editingId ? 'Actualizar' : 'Crear Medicamento'}
            </button>
            {editingId && (
                <button type="button" onClick={resetForm} style={{marginLeft: '10px', background: '#999'}}>
                    Cancelar
                </button>
            )}
        </div>
      </form>

      <div className="table-responsive">
          <table className="admin-table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Laboratorio</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {medicamentos.map(med => (
                    <tr key={med.id}>
                        <td>{med.codigoBarra}</td>
                        <td>{med.nombre}</td>
                        <td>{med.laboratorio}</td>
                        <td>{med.categoria}</td>
                        <td>${med.precioUnitario.toFixed(2)}</td>
                        <td>
                            <button onClick={() => handleEdit(med)}>✏️</button>
                            <button onClick={() => handleDelete(med.id)} style={{marginLeft:'5px', color:'red'}}>🗑️</button>
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