import React, { useState, useEffect } from 'react';
import { inventarioService } from '../../services/inventarioService';
import { catalogoService } from '../../services/catalogoService';
import './AdminTables.css';

const InventarioAdmin = () => {
  const [sucursales, setSucursales] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [formData, setFormData] = useState({ sucursalId: '', medicamentoId: '', cantidad: '' });

  useEffect(() => {
    Promise.all([
      inventarioService.getSucursales(),
      catalogoService.getMedicamentos()
    ]).then(([sucs, meds]) => {
      setSucursales(sucs || []);
      setMedicamentos(meds || []);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sucursalId || !formData.medicamentoId) return alert("Selecciona campos");

    try {
      const payload = {
        sucursal: { id: parseInt(formData.sucursalId) },
        medicamentoId: parseInt(formData.medicamentoId),
        cantidad: parseInt(formData.cantidad)
      };
      await inventarioService.createInventario(payload);
      alert('✅ Stock asignado');
      setFormData({ ...formData, cantidad: '' });
    } catch (err) {
      alert('❌ Error: El medicamento debe existir en el catálogo y la combinación ser única.');
    }
  };

  return (
    <div className="admin-section">
      <h3>📦 Asignar Stock</h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <select value={formData.sucursalId} onChange={e => setFormData({...formData, sucursalId: e.target.value})} required>
          <option value="">-- Sucursal --</option>
          {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        <select value={formData.medicamentoId} onChange={e => setFormData({...formData, medicamentoId: e.target.value})} required>
          <option value="">-- Medicamento --</option>
          {medicamentos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
        <input type="number" placeholder="Cantidad" value={formData.cantidad} onChange={e => setFormData({...formData, cantidad: e.target.value})} required />
        <button type="submit" className="btn-submit">Guardar</button>
      </form>
    </div>
  );
};

export default InventarioAdmin;