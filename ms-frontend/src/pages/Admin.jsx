import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardAdmin from '../components/admin/DashboardAdmin';
import MedicamentosAdmin from '../components/admin/MedicamentosAdmin';
import SucursalesAdmin from '../components/admin/SucursalesAdmin';
import InventarioAdmin from '../components/admin/InventarioAdmin';
import UsuariosAdmin from '../components/admin/UsuariosAdmin';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener token desde localStorage
    try {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        setToken(accessToken);
      }
    } catch (e) {
      console.error("Error leyendo token:", e);
    }
  }, []);

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    // Show brief feedback
    const btn = document.querySelector('.copy-token-btn');
    if (btn) {
      btn.textContent = '✅ Copiado';
      setTimeout(() => { btn.textContent = 'Copiar'; }, 2000);
    }
  };

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

        {/* Token Viewer para fines académicos */}
        <div className="token-viewer">
          <div className="token-header">
            <h4>🔑 Token de Acceso (Debug)</h4>
            <div className="token-actions">
              <button
                onClick={() => setShowToken(!showToken)}
                className="toggle-token-btn"
              >
                {showToken ? '👁️ Ocultar' : '👁️ Mostrar'}
              </button>
              <button onClick={copyToken} className="copy-token-btn">Copiar</button>
            </div>
          </div>
          {showToken && (
            <div className="token-content">
              {token || 'No hay token disponible'}
            </div>
          )}
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
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
          <button
            className={`tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('usuarios')}
          >
            👥 Usuarios
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'dashboard' && <DashboardAdmin />}
          {activeTab === 'medicamentos' && <MedicamentosAdmin />}
          {activeTab === 'sucursales' && <SucursalesAdmin />}
          {activeTab === 'inventario' && <InventarioAdmin />}
          {activeTab === 'usuarios' && <UsuariosAdmin />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
