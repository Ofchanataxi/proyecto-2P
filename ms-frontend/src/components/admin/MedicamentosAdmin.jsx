import React, { useState, useEffect } from 'react';
import { catalogoService } from '../../services/catalogoService';
import Modal from '../Modal';
import './AdminTables.css';

const MedicamentosAdmin = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    codigoBarra: '',
    laboratorio: '',
    precioUnitario: '',
    categoria: '',
    imagenUrl: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

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

  const showModal = (message, type = 'success') => {
    setModalInfo({ isOpen: true, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const precio = parseFloat(formData.precioUnitario);
    if (isNaN(precio) || precio <= 0) {
      showModal("El precio debe ser mayor a 0", 'error');
      return;
    }

    try {
      if (editingId) {
        await catalogoService.updateMedicamento(editingId, { ...formData, precioUnitario: precio });
        showModal('✅ Medicamento actualizado correctamente', 'success');
      } else {
        await catalogoService.createMedicamento({ ...formData, precioUnitario: precio });
        showModal('✅ Medicamento creado correctamente', 'success');
      }
      resetForm();
      loadMedicamentos();
    } catch (error) {
      showModal('❌ Error al guardar. Verifique los datos e intente nuevamente.', 'error');
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
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete({ show: true, id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await catalogoService.deleteMedicamento(confirmDelete.id);
      loadMedicamentos();
      showModal('✅ Medicamento eliminado correctamente', 'success');
    } catch (error) {
      showModal('❌ Error al eliminar el medicamento', 'error');
    }
    setConfirmDelete({ show: false, id: null });
  };

  const resetForm = () => {
    setFormData({ nombre: '', codigoBarra: '', laboratorio: '', precioUnitario: '', categoria: '', imagenUrl: '' });
    setEditingId(null);
  };

  // Imágenes por defecto para medicamentos
  const getDefaultImage = (categoria) => {
    const images = {
      'Analgesicos': '💊',
      'Antibioticos': '💉',
      'Vitaminas': '🧬',
      'Antiinflamatorios': '🩹',
      default: '💊'
    };
    return images[categoria] || images.default;
  };

  if (loading) return <div className="loading">Cargando medicamentos...</div>;

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
        onClose={() => setConfirmDelete({ show: false, id: null })}
        onConfirm={handleDeleteConfirm}
        message="¿Estás seguro de eliminar este medicamento? Esta acción no se puede deshacer."
        type="confirm"
      />

      <h2>💊 Gestión de Productos y Medicamentos</h2>

      <div className="admin-split-layout">
        <div className="form-card">
          <h3>{editingId ? '✏️ Editar Medicamento' : '✨ Nuevo Medicamento'}</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Nombre del Producto *</label>
              <input
                placeholder="Ej: Paracetamol 500mg"
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Código de Barra *</label>
                <input
                  placeholder="EAN-13"
                  value={formData.codigoBarra}
                  onChange={e => setFormData({ ...formData, codigoBarra: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Laboratorio / Marca *</label>
                <input
                  placeholder="Ej: Genfar"
                  value={formData.laboratorio}
                  onChange={e => setFormData({ ...formData, laboratorio: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Precio Unitario ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.precioUnitario}
                  onChange={e => setFormData({ ...formData, precioUnitario: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="Analgesicos">Analgésicos</option>
                  <option value="Antibioticos">Antibióticos</option>
                  <option value="Vitaminas">Vitaminas</option>
                  <option value="Antiinflamatorios">Antiinflamatorios</option>
                  <option value="Antigripales">Antigripales</option>
                  <option value="Dermatologicos">Dermatológicos</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>URL de Imagen (opcional)</label>
              <input
                placeholder="https://ejemplo.com/imagen.jpg"
                value={formData.imagenUrl}
                onChange={e => setFormData({ ...formData, imagenUrl: e.target.value })}
              />
              <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                Si no proporciona URL, se usará un ícono por defecto según la categoría
              </small>
            </div>

            <div className="form-actions">
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-cancel">
                  Cancelar
                </button>
              )}
              <button type="submit" className="btn-submit">
                {editingId ? 'Actualizar Producto' : 'Guardar Producto'}
              </button>
            </div>
          </form>
        </div>

        <div className="illustration-card">
          <div className="illustration-placeholder">
            <span style={{ fontSize: '60px' }}>🧴</span>
            <h3>Catálogo de Productos</h3>
            <p>Gestiona tu inventario de medicamentos. Las categorías ayudan a los clientes a encontrar productos más rápido.</p>
            <ul className="stats-mini">
              <li>📦 {medicamentos.length} Productos</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="list-card" style={{ marginTop: '30px' }}>
        <h3>📚 Inventario Global: {medicamentos.length} items</h3>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Img</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Laboratorio</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {medicamentos.map(med => (
                <tr key={med.id}>
                  <td>
                    {med.imagenUrl ? (
                      <img
                        src={med.imagenUrl}
                        alt={med.nombre}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline'; }}
                      />
                    ) : null}
                    <span style={{ fontSize: '24px', display: med.imagenUrl ? 'none' : 'inline' }}>
                      {getDefaultImage(med.categoria)}
                    </span>
                  </td>
                  <td><code>{med.codigoBarra}</code></td>
                  <td style={{ fontWeight: '500' }}>{med.nombre}</td>
                  <td>
                    <span className="badge badge-admin">{med.categoria || 'General'}</span>
                  </td>
                  <td>{med.laboratorio}</td>
                  <td style={{ color: '#16a34a', fontWeight: 'bold' }}>${med.precioUnitario?.toFixed(2)}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(med)} title="Editar">✏️</button>
                    <button className="btn-delete" onClick={() => handleDeleteClick(med.id)} title="Eliminar">🗑️</button>
                  </td>
                </tr>
              ))}
              {medicamentos.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    No hay medicamentos registrados. ¡Añade el primero!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicamentosAdmin;