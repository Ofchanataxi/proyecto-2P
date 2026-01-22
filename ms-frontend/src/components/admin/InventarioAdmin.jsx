import React, { useState, useEffect } from 'react';
import { inventarioService } from '../../services/inventarioService';
import { catalogoService } from '../../services/catalogoService';
import './AdminTables.css';

const InventarioAdmin = () => {
  const [sucursales, setSucursales] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [formData, setFormData] = useState({ codigoSucursal: '', codigoMedicamento: '', cantidad: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
      try {
        const [sucs, meds] = await Promise.all([
            inventarioService.getAllSucursales(),
            catalogoService.getAllMedicamentos()
        ]);
        setSucursales(sucs || []);
        setMedicamentos(meds || []);
      } catch (error) {
          console.error("Error cargando datos:", error);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.codigoSucursal || !formData.codigoMedicamento) {
        alert("⚠️ Selecciona sucursal y medicamento.");
        return;
    }
    const cant = parseInt(formData.cantidad);
    if (isNaN(cant) || cant <= 0) {
        alert("⚠️ Cantidad inválida.");
        return;
    }

    try {
        // ESTRUCTURA CORRECTA PARA TU BACKEND (Entity Inventario)
        const payload = {
            sucursal: { id: parseInt(formData.codigoSucursal) }, // Objeto anidado
            medicamentoId: parseInt(formData.codigoMedicamento),
            cantidad: cant
        };

        await inventarioService.createInventario(payload);
        alert('✅ Stock agregado correctamente');
        setFormData({ ...formData, cantidad: '' }); 
    } catch (err) {
        console.error(err);
        alert('❌ Error al agregar. Verifica que no esté duplicado.');
    }
  };

  return (
    <div className="admin-section">
      <h2>📦 Asignar Inventario</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-grid">
            <select 
                value={formData.codigoSucursal}
                onChange={e => setFormData({...formData, codigoSucursal: e.target.value})} 
                required
            >
                <option value="">-- Sucursal --</option>
                {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
        
            <select 
                value={formData.codigoMedicamento}
                onChange={e => setFormData({...formData, codigoMedicamento: e.target.value})} 
                required
            >
                <option value="">-- Medicamento --</option>
                {medicamentos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>

            <input 
                type="number" 
                placeholder="Cantidad" 
                value={formData.cantidad}
                onChange={e => setFormData({...formData, cantidad: e.target.value})} 
                required 
            />
        </div>
        <button type="submit" className="btn-submit" style={{marginTop: '10px'}}>Agregar Stock</button>
      </form>
    </div>
  );
};

export default InventarioAdmin;