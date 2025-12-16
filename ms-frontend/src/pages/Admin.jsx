import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicamentosAdmin from '../components/admin/MedicamentosAdmin';
import SucursalesAdmin from '../components/admin/SucursalesAdmin';
import InventarioAdmin from '../components/admin/InventarioAdmin';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('medicamentos');
  const navigate = useNavigate();

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <button onClick={() => navigate('/')} className="back-btn">
            ← Volver al Inicio
          </button>
          <h1>⚙️ Panel de Administración</h1>
        </div>
      </div>

      <div className="container">
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'medicamentos' ? 'active' : ''}`}
            onClick={() => setActiveTab('medicamentos')}
          >
            💊 Medicamentos
          </button>
          <button
            className={`tab-btn ${activeTab === 'sucursales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sucursales')}
          >
            📍 Sucursales
          </button>
          <button
            className={`tab-btn ${activeTab === 'inventario' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventario')}
          >
            📦 Inventario
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'medicamentos' && <MedicamentosAdmin />}
          {activeTab === 'sucursales' && <SucursalesAdmin />}
          {activeTab === 'inventario' && <InventarioAdmin />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
