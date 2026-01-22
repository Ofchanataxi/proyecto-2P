import React, { useState, useEffect } from 'react';
import * as inventarioService from '../../services/inventarioService'; // <--- OJO AQUÍ
import './AdminTables.css';

const SucursalesAdmin = () => {
  const [sucursales, setSucursales] = useState([]);
  const [form, setForm] = useState({ nombre: '', direccion: '' });

  useEffect(() => {
    loadSucursales();
  }, []);

  const loadSucursales = async () => {
    const data = await inventarioService.getSucursales(); // <--- OJO AQUÍ
    setSucursales(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await inventarioService.createSucursal(form); // <--- OJO AQUÍ
    setForm({ nombre: '', direccion: '' });
    loadSucursales();
  };

  return (
    <div className="admin-table-container">
      <h3>Gestionar Sucursales</h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
        <input placeholder="Dirección" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} required />
        <button type="submit">Crear Sucursal</button>
      </form>
      {/* ... tabla similar a medicamentos ... */}
      <ul>
          {sucursales.map(s => <li key={s.id}>{s.nombre} - {s.direccion}</li>)}
      </ul>
    </div>
  );
};

export default SucursalesAdmin;